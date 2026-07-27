import { CollectionController } from "../../interaction/collection.js";

const instances = new WeakMap();

class ListboxRuntime {
  constructor(root) {
    this.element = root;
    this.collection = new CollectionController({ loop: true });
    this.abort = new AbortController();
    this.typeahead = "";
    this.typeaheadTimer = 0;
    this.bind();
    this.refresh();
  }

  get options() {
    return [...this.element.querySelectorAll("[data-rui-listbox-option]")];
  }

  refresh() {
    const occurrences = new Map();
    this.options.forEach((item, index) => {
      if (item.id) return;
      const base = item.dataset.value || `item-${index}`;
      const occurrence = occurrences.get(base) ?? 0;
      occurrences.set(base, occurrence + 1);
      item.id = `rui-listbox-option-${base}-${occurrence}`;
    });
    this.collection.setItems(this.options.map((item, index) => ({
      id: item.id, index, value: item.dataset.value || "", label: item.textContent.trim(),
      selected: item.getAttribute("aria-selected") === "true",
      disabled: item.getAttribute("aria-disabled") === "true",
    })));
    const selected = this.collection.selected();
    this.setActive(selected >= 0 ? selected : this.collection.first());
    return this;
  }

  bind() {
    const { signal } = this.abort;
    this.element.tabIndex = 0;
    this.element.addEventListener("pointermove", (event) => {
      const item = event.target.closest("[data-rui-listbox-option]");
      const index = item && this.options.indexOf(item);
      if (index >= 0) this.setActive(index);
    }, { signal });
    this.element.addEventListener("click", (event) => {
      const item = event.target.closest("[data-rui-listbox-option]");
      const index = item && this.options.indexOf(item);
      if (index >= 0) this.select(index, event);
    }, { signal });
    this.element.addEventListener("keydown", (event) => {
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const next = event.key === "ArrowDown" ? this.collection.move(1)
          : event.key === "ArrowUp" ? this.collection.move(-1)
          : event.key === "Home" ? this.collection.first() : this.collection.last();
        this.setActive(next);
      } else if ((event.key === "Enter" || event.key === " ") && this.collection.activeIndex >= 0) {
        event.preventDefault();
        this.select(this.collection.activeIndex, event);
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        this.typeahead = `${this.typeahead}${event.key.toLocaleLowerCase()}`;
        clearTimeout(this.typeaheadTimer);
        this.typeaheadTimer = setTimeout(() => { this.typeahead = ""; }, 650);
        const next = this.collection.findByPrefix(this.typeahead);
        if (next >= 0) this.setActive(next);
      }
    }, { signal });
  }

  setActive(index) {
    if (index < 0 || !this.collection.setActive(index)) return;
    this.options.forEach((item, itemIndex) => { item.dataset.active = String(itemIndex === index); });
    if (this.options[index]?.id) {
      this.element.setAttribute("aria-activedescendant", this.options[index].id);
    }
    this.options[index]?.scrollIntoView({ block: "nearest" });
  }

  select(index, originalEvent = null) {
    const item = this.options[index];
    if (!item || item.getAttribute("aria-disabled") === "true") return;
    this.options.forEach((option) => option.setAttribute("aria-selected", String(option === item)));
    this.element.dispatchEvent(new CustomEvent("rui:change", { bubbles: true, detail: { item, value: item.dataset.value || "", originalEvent } }));
  }

  destroy() {
    this.abort.abort();
    clearTimeout(this.typeaheadTimer);
    instances.delete(this.element);
  }
}

export function mountListboxes(root = document) {
  const elements = root.matches?.("[data-rui-listbox]") ? [root] : [...root.querySelectorAll?.("[data-rui-listbox]") || []];
  return elements.map((element) => {
    const current = instances.get(element);
    if (current) return current;
    const runtime = new ListboxRuntime(element);
    instances.set(element, runtime);
    return runtime;
  });
}
