const instances = new WeakMap();

function collect(root) {
  const nodes = [];
  if (root instanceof HTMLElement && root.matches("[data-rui-collapsible]")) nodes.push(root);
  nodes.push(...(root.querySelectorAll?.("[data-rui-collapsible]") || []));
  return [...new Set(nodes)];
}

class CollapsibleRuntime {
  constructor(element) {
    this.element = element;
    this.trigger = element.querySelector("[data-rui-collapsible-trigger]");
    this.content = element.querySelector("[data-rui-collapsible-content]");
    if (!this.trigger || !this.content) throw new Error("Collapsible requires trigger and content");
    this.onClick = () => this.toggle();
    this.trigger.addEventListener("click", this.onClick);
    this.sync();
  }

  get open() { return this.trigger.getAttribute("aria-expanded") === "true"; }

  setOpen(open) {
    this.trigger.setAttribute("aria-expanded", String(open));
    this.element.dataset.state = open ? "open" : "closed";
    this.content.hidden = !open;
    this.element.dispatchEvent(new CustomEvent("rui:collapsiblechange", {
      bubbles: true,
      detail: { open, element: this.element },
    }));
    return this;
  }

  toggle() { return this.setOpen(!this.open); }
  sync() { this.content.hidden = !this.open; this.element.dataset.state = this.open ? "open" : "closed"; return this; }
  refresh() { return this.sync(); }
  destroy() { this.trigger.removeEventListener("click", this.onClick); instances.delete(this.element); }
}

export function mountCollapsibles(root = document) {
  return collect(root).map((element) => {
    let instance = instances.get(element);
    if (!instance) { instance = new CollapsibleRuntime(element); instances.set(element, instance); }
    return instance;
  });
}
