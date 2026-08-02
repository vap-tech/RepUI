const instances = new WeakMap();
const SELECTOR = "[data-rui-drawer]";
const FOCUSABLE = [
  "a[href]", "button:not([disabled])", "input:not([disabled])",
  "select:not([disabled])", "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function collect(root) {
  const nodes = [];
  if (root instanceof HTMLElement && root.matches(SELECTOR)) nodes.push(root);
  nodes.push(...(root.querySelectorAll?.(SELECTOR) || []));
  return [...new Set(nodes)];
}

class DrawerRuntime {
  constructor(element) {
    this.element = element;
    this.panel = element.querySelector(".rui-drawer__panel");
    this.abort = new AbortController();
    this.returnFocus = null;
    if (!this.panel) throw new Error("Drawer requires .rui-drawer__panel");
    this.overlayStack = createOverlayStackEntry({ element, onEscape: () => this.close() });
    this.bind();
    this.refresh();
  }

  get modal() { return this.element.dataset.variant !== "persistent"; }
  get openState() { return !this.element.hidden; }

  focusables() {
    return [...this.panel.querySelectorAll(FOCUSABLE)].filter((node) => {
      return !node.hidden && node.getAttribute("aria-hidden") !== "true";
    });
  }

  refresh() {
    if (this.openState) this.activate(false);
    return this;
  }

  activate(moveFocus = true) {
    if (this.modal) { document.body.dataset.ruiDrawerOpen = "true"; this.overlayStack.activate(); }
    if (moveFocus) (this.focusables()[0] || this.panel).focus();
  }

  open(trigger = null) {
    if (this.openState) return this;
    this.returnFocus = trigger || document.activeElement;
    this.element.hidden = false;
    this.activate(true);
    this.element.dispatchEvent(new CustomEvent("rui:draweropen", { bubbles: true }));
    return this;
  }

  close({ restoreFocus = true } = {}) {
    if (!this.openState || !this.modal) return this;
    this.element.hidden = true;
    this.overlayStack.deactivate();
    delete document.body.dataset.ruiDrawerOpen;
    if (restoreFocus) this.returnFocus?.focus?.();
    this.element.dispatchEvent(new CustomEvent("rui:drawerclose", { bubbles: true }));
    return this;
  }

  trap(event) {
    if (!this.modal || !this.openState) return;
    const focusable = this.focusables();
    if (!focusable.length) {
      event.preventDefault();
      this.panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  bind() {
    const { signal } = this.abort;
    this.element.addEventListener("click", (event) => {
      if (event.target.closest("[data-rui-drawer-close]")) this.close();
    }, { signal });
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-rui-drawer-open]");
      if (trigger?.dataset.ruiDrawerOpen === this.element.id) this.open(trigger);
    }, { signal });
    document.addEventListener("keydown", (event) => {
      if (!this.openState || !this.overlayStack.isTop()) return;
      if (event.key === "Tab") {
        this.trap(event);
      }
    }, { signal });
  }

  destroy() {
    this.abort.abort();
    this.overlayStack.destroy();
    if (this.openState && this.modal) delete document.body.dataset.ruiDrawerOpen;
    instances.delete(this.element);
  }
}

export function mountDrawers(root = document) {
  return collect(root).map((element) => {
    let instance = instances.get(element);
    if (!instance) {
      instance = new DrawerRuntime(element);
      instances.set(element, instance);
    } else {
      instance.refresh();
    }
    return instance;
  });
}
import { createOverlayStackEntry } from "../../interaction/overlay-stack.js";
