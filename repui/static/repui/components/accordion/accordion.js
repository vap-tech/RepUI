const instances = new WeakMap();

function collect(root) {
  const nodes = [];
  if (root instanceof HTMLElement && root.matches("[data-rui-accordion]")) nodes.push(root);
  nodes.push(...(root.querySelectorAll?.("[data-rui-accordion]") || []));
  return [...new Set(nodes)];
}

class AccordionRuntime {
  constructor(element) {
    this.element = element;
    this.items = [...element.querySelectorAll("[data-rui-accordion-item]")];
    this.onClick = (event) => {
      const trigger = event.target.closest("[data-rui-accordion-trigger]");
      const item = trigger?.closest("[data-rui-accordion-item]");
      if (item && item.parentElement === this.element) this.toggle(this.items.indexOf(item));
    };
    this.onKeyDown = (event) => this.navigate(event);
    element.addEventListener("click", this.onClick);
    element.addEventListener("keydown", this.onKeyDown);
    this.sync();
  }

  get multiple() { return this.element.hasAttribute("data-multiple"); }

  set(index, open) {
    const item = this.items[index];
    if (!item) return this;
    if (open && !this.multiple) this.items.forEach((_, other) => other !== index && this.set(other, false));
    const trigger = item.querySelector("[data-rui-accordion-trigger]");
    const panel = item.querySelector("[data-rui-accordion-panel]");
    trigger?.setAttribute("aria-expanded", String(open));
    item.dataset.state = open ? "open" : "closed";
    if (panel) panel.hidden = !open;
    this.element.dispatchEvent(new CustomEvent("rui:accordionchange", {
      bubbles: true, detail: { index, open, element: item },
    }));
    return this;
  }

  toggle(index) {
    const trigger = this.items[index]?.querySelector("[data-rui-accordion-trigger]");
    return this.set(index, trigger?.getAttribute("aria-expanded") !== "true");
  }

  navigate(event) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const current = this.items.findIndex((item) => item.contains(document.activeElement));
    if (current < 0) return;
    const next = event.key === "Home" ? 0 : event.key === "End" ? this.items.length - 1
      : (current + (event.key === "ArrowDown" ? 1 : -1) + this.items.length) % this.items.length;
    event.preventDefault();
    this.items[next]?.querySelector("[data-rui-accordion-trigger]")?.focus();
  }

  sync() { this.items.forEach((item) => { const trigger = item.querySelector("[data-rui-accordion-trigger]"); item.dataset.state = trigger?.getAttribute("aria-expanded") === "true" ? "open" : "closed"; const panel = item.querySelector("[data-rui-accordion-panel]"); if (panel) panel.hidden = item.dataset.state !== "open"; }); return this; }
  refresh() { this.items = [...this.element.querySelectorAll("[data-rui-accordion-item]")]; return this.sync(); }
  destroy() { this.element.removeEventListener("click", this.onClick); this.element.removeEventListener("keydown", this.onKeyDown); instances.delete(this.element); }
}

export function mountAccordions(root = document) {
  return collect(root).map((element) => {
    let instance = instances.get(element);
    if (!instance) { instance = new AccordionRuntime(element); instances.set(element, instance); }
    return instance;
  });
}
