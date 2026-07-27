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
      flip: true,
      restoreFocus: false,
      onRequestClose: null,
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
            this.options.onRequestClose?.({ reason: "anchor-hidden" });
          }
        })
      : null;
    this.position = this.position.bind(this);
    this.schedulePosition = this.schedulePosition.bind(this);
  }

  mount() {
    if (this.mounted) return;
    this.previousFocus = document.activeElement;
    this.overlay.before(this.placeholder);
    this.options.container.append(this.overlay);
    this.overlay.dataset.ruiPortal = "true";
    this.overlay.style.position = "fixed";
    this.overlay.style.inset = "auto";
    this.overlay.style.margin = "0";
    this.mounted = true;

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
    document.addEventListener("pointerdown", (event) => {
      const path = event.composedPath();
      if (path.includes(this.anchor) || path.includes(this.overlay)) return;
      this.options.onRequestClose?.({ reason: "outside-pointer", event });
    }, { signal, capture: true });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      this.options.onRequestClose?.({ reason: "escape", event });
    }, { signal, capture: true });
    this.resizeObserver?.observe(this.anchor);
    this.resizeObserver?.observe(this.overlay);
    this.intersectionObserver?.observe(this.anchor);
    this.position();
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
    const available = Math.max(80, openAbove ? above : below);
    this.overlay.style.maxHeight = `${Math.floor(available)}px`;

    const measured = this.overlay.getBoundingClientRect();
    const top = openAbove
      ? anchorRect.top - measured.height - this.options.offset
      : anchorRect.bottom + this.options.offset;
    const minLeft = viewportLeft + padding;
    const maxLeft = viewportLeft + viewportWidth - padding - measured.width;
    const left = Math.min(Math.max(anchorRect.left, minLeft), Math.max(minLeft, maxLeft));
    const minTop = viewportTop + padding;
    const maxTop = viewportTop + viewportHeight - padding - measured.height;

    this.overlay.style.left = `${Math.round(left)}px`;
    this.overlay.style.top = `${Math.round(Math.min(Math.max(top, minTop), Math.max(minTop, maxTop)))}px`;
    this.overlay.dataset.side = openAbove ? "top" : "bottom";
  }

  unmount() {
    if (!this.mounted) return;
    this.abortController?.abort();
    this.abortController = null;
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.scrollParents = [];
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.mounted = false;
    delete this.overlay.dataset.ruiPortal;
    ["position", "inset", "top", "left", "right", "bottom", "width", "margin", "max-width", "max-height"].forEach(
      (property) => this.overlay.style.removeProperty(property),
    );
    delete this.overlay.dataset.side;
    if (this.placeholder.parentNode) this.placeholder.replaceWith(this.overlay);
    if (this.options.restoreFocus && this.previousFocus?.isConnected) {
      this.previousFocus.focus({ preventScroll: true });
    }
    this.previousFocus = null;
  }

  destroy() {
    this.unmount();
    this.anchor = null;
    this.overlay = null;
  }
}
