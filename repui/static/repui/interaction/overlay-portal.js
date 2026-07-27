/**
 * Temporarily moves an overlay to body so ancestor overflow cannot clip it.
 */
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
      onRequestClose: null,
      ...options,
    };
    this.placeholder = document.createComment("rui-overlay-portal");
    this.mounted = false;
    this.abortController = null;
    this.position = this.position.bind(this);
  }

  mount() {
    if (this.mounted) return;
    this.overlay.before(this.placeholder);
    this.options.container.append(this.overlay);
    this.overlay.dataset.ruiPortal = "true";
    this.overlay.style.position = "fixed";
    this.overlay.style.inset = "auto";
    this.overlay.style.margin = "0";
    this.mounted = true;

    this.abortController = new AbortController();
    const { signal } = this.abortController;
    window.addEventListener("resize", this.position, { signal, passive: true });
    window.addEventListener("scroll", this.position, {
      signal,
      passive: true,
      capture: true,
    });
    window.visualViewport?.addEventListener("resize", this.position, {
      signal,
      passive: true,
    });
    window.visualViewport?.addEventListener("scroll", this.position, {
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
    this.position();
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
    this.mounted = false;
    delete this.overlay.dataset.ruiPortal;
    ["position", "inset", "top", "left", "right", "bottom", "width", "margin", "max-width", "max-height"].forEach(
      (property) => this.overlay.style.removeProperty(property),
    );
    delete this.overlay.dataset.side;
    if (this.placeholder.parentNode) this.placeholder.replaceWith(this.overlay);
  }

  destroy() {
    this.unmount();
    this.anchor = null;
    this.overlay = null;
  }
}
