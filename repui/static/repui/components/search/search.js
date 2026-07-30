const instances = new WeakMap();
function collect(root) { const nodes = []; if (root instanceof HTMLElement && root.matches("[data-rui-search]")) nodes.push(root); nodes.push(...(root.querySelectorAll?.("[data-rui-search]") || [])); return [...new Set(nodes)]; }
class SearchRuntime {
  constructor(element) { this.element = element; this.input = element.querySelector(".rui-search__input"); this.clear = element.querySelector("[data-rui-search-clear]"); this.onInput = () => this.sync(); this.onClear = () => { this.input.value = ""; this.sync(); this.input.focus(); }; this.input?.addEventListener("input", this.onInput); this.clear?.addEventListener("click", this.onClear); this.sync(); }
  sync() { if (this.clear) this.clear.hidden = !this.input?.value; return this; }
  refresh() { return this.sync(); }
  destroy() { this.input?.removeEventListener("input", this.onInput); this.clear?.removeEventListener("click", this.onClear); instances.delete(this.element); }
}
export function mountSearches(root = document) { return collect(root).map((element) => { let instance = instances.get(element); if (!instance) { instance = new SearchRuntime(element); instances.set(element, instance); } return instance; }); }
