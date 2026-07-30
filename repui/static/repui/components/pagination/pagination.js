const instances = new WeakMap();
function collect(root) { const nodes = []; if (root instanceof HTMLElement && root.matches("[data-rui-pagination]")) nodes.push(root); nodes.push(...(root.querySelectorAll?.("[data-rui-pagination]") || [])); return [...new Set(nodes)]; }
class PaginationRuntime {
  constructor(element) { this.element = element; this.onClick = (event) => { const item = event.target.closest("[data-page]"); if (!item || !element.contains(item) || item.disabled || item.getAttribute("aria-disabled") === "true") return; element.dispatchEvent(new CustomEvent("rui:pagechange", { bubbles: true, detail: { page: Number(item.dataset.page), item } })); }; element.addEventListener("click", this.onClick); }
  refresh() { return this; }
  destroy() { this.element.removeEventListener("click", this.onClick); instances.delete(this.element); }
}
export function mountPaginations(root = document) { return collect(root).map((element) => { let instance = instances.get(element); if (!instance) { instance = new PaginationRuntime(element); instances.set(element, instance); } return instance; }); }
