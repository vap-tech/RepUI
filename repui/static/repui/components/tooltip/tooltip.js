import { OverlayPortal } from "../../interaction/overlay-portal.js";

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
    if (!this.trigger || !this.popup) throw new Error("Tooltip markup is incomplete");
    if (!this.popup.id) this.popup.id = `rui-tooltip-${++uid}`;
    this.focusTarget = this.trigger.matches(
      "a,button,input,select,textarea,[contenteditable=\"true\"]",
    )
      ? this.trigger
      : this.trigger.querySelector(
          "a,button,input,select,textarea,[contenteditable=\"true\"]",
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
      offset: 8,
      onRequestClose: () => this.close(),
    });
    this.abort = new AbortController();
    const { signal } = this.abort;
    this.trigger.addEventListener("pointerenter", () => this.open(), { signal });
    this.trigger.addEventListener("pointerleave", () => this.close(), { signal });
    this.trigger.addEventListener("focusin", () => this.open(), { signal });
    this.trigger.addEventListener("focusout", () => this.close(), { signal });
  }

  open() {
    if (!this.popup.hidden) return this;
    this.popup.hidden = false;
    this.portal.mount();
    return this;
  }

  close() {
    if (this.popup.hidden) return this;
    this.popup.hidden = true;
    this.portal.unmount();
    return this;
  }

  destroy() {
    this.close();
    this.portal.destroy();
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

document.addEventListener("htmx:afterSwap", (event) => {
  mountTooltips(event.detail?.target || event.target);
});
