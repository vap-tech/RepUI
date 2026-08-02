import { OverlayPortal } from "../../interaction/overlay-portal.js";
import { createDismissLayer } from "../../interaction/dismiss-layer.js";
import { createOverlayStackEntry } from "../../interaction/overlay-stack.js";

const instances = new WeakMap();
let uid = 0;

function collect(root) {
  const nodes = [];
  if (root instanceof HTMLElement && root.matches("[data-rui-tooltip]")) nodes.push(root);
  nodes.push(...(root.querySelectorAll?.("[data-rui-tooltip]") || []));
  return [...new Set(nodes)];
}

class TooltipRuntime {
  constructor(element) {
    this.element = element;
    this.trigger = element.querySelector("[data-rui-tooltip-trigger]");
    this.popup = element.querySelector("[data-rui-tooltip-popup]");
    this.arrow = element.querySelector("[data-rui-tooltip-arrow]");
    if (!this.trigger || !this.popup) throw new Error("Tooltip markup is incomplete");
    if (!this.popup.id) this.popup.id = `rui-tooltip-${++uid}`;
    this.focusTarget = this.trigger.matches(
      "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[contenteditable=\"true\"]",
    )
      ? this.trigger
      : this.trigger.querySelector(
          "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[contenteditable=\"true\"]",
        );
    if (this.focusTarget) {
      this.trigger.removeAttribute("tabindex");
      this.focusTarget.setAttribute("aria-describedby", this.popup.id);
    } else {
      this.trigger.tabIndex = 0;
      this.trigger.setAttribute("aria-describedby", this.popup.id);
    }
    this.portal = new OverlayPortal(this.trigger, this.popup, {
      matchAnchorWidth: false,
      align: "center",
      horizontalFlip: true,
      offset: 21,
      arrow: this.arrow,
      onAnchorHidden: () => this.close(),
    });
    this.dismiss = createDismissLayer({ anchor: this.trigger, overlay: this.popup, outsidePointer: false, escape: false, onDismiss: () => this.close() });
    this.overlayStack = createOverlayStackEntry({ element: this.popup, onEscape: () => this.close() });
    this.openDelay = 650;
    this.openTimer = 0;
    this.abort = new AbortController();
    const { signal } = this.abort;
    this.trigger.addEventListener("pointerenter", () => this.open(), { signal });
    this.trigger.addEventListener("pointerleave", () => this.close(), { signal });
    this.trigger.addEventListener("focusin", () => this.open(), { signal });
    this.trigger.addEventListener("focusout", () => this.close(), { signal });
  }

  open() {
    clearTimeout(this.openTimer);
    if (!this.popup.hidden) return this;
    this.openTimer = setTimeout(() => {
      this.openTimer = 0;
      if (this.popup.hidden) {
        this.popup.hidden = false;
        this.portal.mount();
        this.overlayStack.activate();
      }
    }, this.openDelay);
    return this;
  }

  close() {
    clearTimeout(this.openTimer);
    this.openTimer = 0;
    if (this.popup.hidden) return this;
    this.popup.hidden = true;
    this.overlayStack.deactivate();
    this.portal.unmount();
    return this;
  }

  destroy() {
    this.close();
    this.portal.destroy();
    this.dismiss.destroy();
    this.overlayStack.destroy();
    this.abort.abort();
    instances.delete(this.element);
  }
}

export function mountTooltips(root = document) {
  return collect(root).map((element) => {
    let instance = instances.get(element);
    if (!instance) {
      instance = new TooltipRuntime(element);
      instances.set(element, instance);
    }
    return instance;
  });
}
