import { createRovingGroup } from "../../interaction/roving.js";

const instances = new WeakMap();
const SELECTOR = "[data-rui-navbar]";

function collect(root) {
  const nodes = [];
  if (root instanceof HTMLElement && root.matches(SELECTOR)) nodes.push(root);
  nodes.push(...(root.querySelectorAll?.(SELECTOR) || []));
  return [...new Set(nodes)];
}

class NavbarRuntime {
  constructor(element) {
    this.element = element;
    this.roving = null;
    this.refresh();
  }

  refresh() {
    const enabled = this.element.dataset.roving === "true";
    if (!enabled) {
      this.roving?.destroy();
      this.roving = null;
      return this;
    }
    if (!this.roving) {
      this.roving = createRovingGroup(this.element, {
        itemSelector: "[data-rui-nav-item]",
        orientation: this.element.dataset.orientation || "horizontal",
        loop: false,
      });
    } else {
      this.roving.refresh();
    }
    return this;
  }

  destroy() {
    this.roving?.destroy();
    this.roving = null;
    instances.delete(this.element);
  }
}

export function mountNavbars(root = document) {
  return collect(root).map((element) => {
    let instance = instances.get(element);
    if (!instance) {
      instance = new NavbarRuntime(element);
      instances.set(element, instance);
    } else {
      instance.refresh();
    }
    return instance;
  });
}
