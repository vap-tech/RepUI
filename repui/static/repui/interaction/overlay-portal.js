/** Moves an overlay to a portal and keeps it positioned relative to its anchor. */
function getScrollParents(element) {
  const parents = [];
  let node = element?.parentElement;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (/(auto|scroll|overlay)/.test(`${style.overflow}${style.overflowX}${style.overflowY}`)) {
      parents.push(node);
    }
    node = node.parentElement;
  }
  parents.push(window);
  return [...new Set(parents)];
}
export class OverlayPortal {
  constructor(anchor, overlay, options = {}) {
    if (!(anchor instanceof Element)) {
      throw new TypeError("OverlayPortal anchor must be an Element");
    }
    if (!(overlay instanceof HTMLElement)) {
      throw new TypeError("OverlayPortal overlay must be an HTMLElement");
    }

    this.anchor = anchor;
    this.overlay = overlay;
    this.options = {
      container: document.body,
      offset: 4,
      viewportPadding: 8,
      matchAnchorWidth: true,
      align: "start",
      horizontalFlip: false,
      arrow: null,
      flip: true,
      onAnchorHidden: null,
      ...options,
    };
    this.placeholder = document.createComment("rui-overlay-portal");
    this.mounted = false;
    this.abortController = null;
    this.scrollParents = [];
    this.frame = 0;
    this.previousFocus = null;
    this.resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(() => this.schedulePosition())
      : null;
    this.intersectionObserver = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          if (entries[0] && !entries[0].isIntersecting) {
            this.options.onAnchorHidden?.({ reason: "anchor-hidden" });
          }
        })
      : null;
    this.position = this.position.bind(this);
    this.schedulePosition = this.schedulePosition.bind(this);
  }

  mount() {
    if (this.mounted) return this.activate();
    this.previousFocus = document.activeElement;
    this.overlay.before(this.placeholder);
    this.options.container.append(this.overlay);
    this.overlay.dataset.ruiPortal = "true";
    this.overlay.style.position = "fixed";
    this.overlay.style.inset = "auto";
    this.overlay.style.margin = "0";
    if (this.options.arrow) this.options.arrow.dataset.ruiOverlayArrow = "true";
    this.mounted = true;

    this.activate();
  }

  activate() {
    if (!this.mounted || this.abortController) return this;
    this.abortController = new AbortController();
    const { signal } = this.abortController;
    this.scrollParents = getScrollParents(this.anchor);
    this.scrollParents.forEach((parent) => parent.addEventListener(
      "scroll", this.schedulePosition, { signal, passive: true, capture: parent === window },
    ));
    window.addEventListener("resize", this.schedulePosition, { signal, passive: true });
    window.visualViewport?.addEventListener("resize", this.schedulePosition, {
      signal,
      passive: true,
    });
    window.visualViewport?.addEventListener("scroll", this.schedulePosition, {
      signal,
      passive: true,
    });
    this.resizeObserver?.observe(this.anchor);
    this.resizeObserver?.observe(this.overlay);
    this.intersectionObserver?.observe(this.anchor);
    this.position();
    return this;
  }

  deactivate() {
    if (!this.mounted) return this;
    this.abortController?.abort();
    this.abortController = null;
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.scrollParents = [];
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    return this;
  }

  schedulePosition() {
    if (!this.mounted || this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.position();
    });
  }

  position() {
    if (!this.mounted || !this.anchor.isConnected) return;
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width ?? document.documentElement.clientWidth;
    const viewportHeight = viewport?.height ?? document.documentElement.clientHeight;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const padding = this.options.viewportPadding;
    const anchorRect = this.anchor.getBoundingClientRect();

    if (this.options.matchAnchorWidth) {
      this.overlay.style.width = `${Math.round(anchorRect.width)}px`;
    }
    this.overlay.style.maxWidth = `${Math.max(0, viewportWidth - padding * 2)}px`;
    this.overlay.style.maxHeight = "";

    const natural = this.overlay.getBoundingClientRect();
    const below = viewportTop + viewportHeight - padding - anchorRect.bottom - this.options.offset;
    const above = anchorRect.top - viewportTop - padding - this.options.offset;
    const openAbove = this.options.flip && below < natural.height && above > below;
    const right = viewportLeft + viewportWidth - padding - anchorRect.right - this.options.offset;
    const leftSpace = anchorRect.left - viewportLeft - padding - this.options.offset;
    const horizontalSide = this.options.horizontalFlip &&
      below < natural.height && above < natural.height &&
      (right >= natural.width || leftSpace >= natural.width)
      ? (right >= leftSpace ? "right" : "left")
      : null;
    const side = horizontalSide || (openAbove ? "top" : "bottom");
    const available = Math.max(
      80,
      side === "top" ? above : side === "bottom" ? below : viewportHeight - padding * 2,
    );
    this.overlay.style.maxHeight = `${Math.floor(available)}px`;

    const measured = this.overlay.getBoundingClientRect();
    const top = side === "top"
      ? anchorRect.top - measured.height - this.options.offset
      : side === "bottom"
        ? anchorRect.bottom + this.options.offset
        : anchorRect.top + (anchorRect.height - measured.height) / 2;
    const minLeft = viewportLeft + padding;
    const maxLeft = viewportLeft + viewportWidth - padding - measured.width;
    const preferredLeft = side === "right"
      ? anchorRect.right + this.options.offset
      : side === "left"
        ? anchorRect.left - measured.width - this.options.offset
        : this.options.align === "center"
          ? anchorRect.left + (anchorRect.width - measured.width) / 2
          : anchorRect.left;
    const left = Math.min(Math.max(preferredLeft, minLeft), Math.max(minLeft, maxLeft));
    const minTop = viewportTop + padding;
    const maxTop = viewportTop + viewportHeight - padding - measured.height;

    this.overlay.style.left = `${Math.round(left)}px`;
    this.overlay.style.top = `${Math.round(Math.min(Math.max(top, minTop), Math.max(minTop, maxTop)))}px`;
    this.overlay.dataset.side = side;
    if (this.options.arrow) {
      const arrowPadding = 8;
      const anchorCenter = anchorRect.left + anchorRect.width / 2;
      const arrowX = Math.min(
        Math.max(anchorCenter - left, arrowPadding),
        Math.max(arrowPadding, measured.width - arrowPadding),
      );
      this.overlay.style.setProperty(
        "--rui-overlay-arrow-x",
        `${Math.round(arrowX)}px`,
      );
      const anchorMiddle = anchorRect.top + anchorRect.height / 2;
      const arrowY = Math.min(
        Math.max(anchorMiddle - top, arrowPadding),
        Math.max(arrowPadding, measured.height - arrowPadding),
      );
      this.overlay.style.setProperty("--rui-overlay-arrow-y", `${Math.round(arrowY)}px`);
    }
  }

  unmount() {
    if (!this.mounted) return;
    this.deactivate();
    this.mounted = false;
    delete this.overlay.dataset.ruiPortal;
    ["position", "inset", "top", "left", "right", "bottom", "width", "margin", "max-width", "max-height", "--rui-overlay-arrow-x", "--rui-overlay-arrow-y"].forEach(
      (property) => this.overlay.style.removeProperty(property),
    );
    if (this.options.arrow) delete this.options.arrow.dataset.ruiOverlayArrow;
    delete this.overlay.dataset.side;
    if (this.placeholder.parentNode) this.placeholder.replaceWith(this.overlay);
    this.previousFocus = null;
  }

  destroy() {
    this.unmount();
    this.anchor = null;
    this.overlay = null;
  }
}
