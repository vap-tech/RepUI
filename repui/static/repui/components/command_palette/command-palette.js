import { CollectionController } from "../../interaction/collection.js";
import { createOverlayStackEntry } from "../../interaction/overlay-stack.js";

const instances = new WeakMap();
const normalize = (value) => value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").trim();

class CommandPaletteRuntime {
  constructor(root) {
    this.root = root;
    this.input = root.querySelector("[data-rui-command-input]");
    this.list = root.querySelector("[data-rui-command-list]");
    this.empty = root.querySelector("[data-rui-command-empty]");
    this.collection = new CollectionController({ loop: true });
    this.abort = new AbortController();
    this.previousFocus = null;
    this.overlayStack = createOverlayStackEntry({ element: root, onEscape: () => this.close() });
    this.bind();
    this.refresh();
  }

  get items() { return [...this.root.querySelectorAll("[data-rui-command-item]")]; }

  bind() {
    const { signal } = this.abort;
    document.querySelectorAll(`[data-rui-command-trigger="${this.root.id}"]`).forEach((trigger) =>
      trigger.addEventListener("click", () => this.open(trigger), { signal }));
    this.root.addEventListener("click", (event) => {
      if (event.target.closest("[data-rui-command-close]")) this.close();
      const item = event.target.closest("[data-rui-command-item]");
      if (item && !item.disabled) this.run(item);
    }, { signal });
    this.input.addEventListener("input", () => this.filter(), { signal });
    this.root.addEventListener("keydown", (event) => this.key(event), { signal });
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        this.open(document.activeElement);
      }
    }, { signal });
  }

  refresh() {
    this.collection.setItems(this.items.map((item, index) => ({
      id: item.id || `rui-command-item-${index}`,
      value: item.dataset.value || "",
      label: item.textContent.trim(),
      disabled: item.disabled || item.hidden || item.getAttribute("aria-disabled") === "true",
      selected: item.getAttribute("aria-selected") === "true",
    })));
    this.setActive(this.collection.activeIndex);
    return this;
  }

  open(trigger = document.activeElement) {
    if (!this.root.hidden) return this;
    this.previousFocus = trigger;
    this.root.hidden = false;
    this.root.dataset.open = "true";
    this.overlayStack.activate();
    document.documentElement.dataset.ruiScrollLocked = "true";
    this.input.focus({ preventScroll: true });
    this.input.select();
    this.filter();
    this.root.dispatchEvent(new CustomEvent("rui:commandopen", { bubbles: true }));
    return this;
  }

  close() {
    if (this.root.hidden) return this;
    this.root.hidden = true;
    this.overlayStack.deactivate();
    delete this.root.dataset.open;
    delete document.documentElement.dataset.ruiScrollLocked;
    this.previousFocus?.focus?.({ preventScroll: true });
    this.root.dispatchEvent(new CustomEvent("rui:commandclose", { bubbles: true }));
    return this;
  }

  filter() {
    const term = normalize(this.input.value);
    let count = 0;
    this.items.forEach((item) => {
      item.hidden = !normalize(`${item.dataset.keywords || ""} ${item.textContent}`).includes(term);
      if (!item.hidden) count += 1;
    });
    if (this.empty) this.empty.hidden = count > 0;
    this.refresh();
    return this;
  }

  setActive(index) {
    if (index < 0 || !this.collection.setActive(index)) return;
    this.items.forEach((item, itemIndex) => { item.dataset.active = String(itemIndex === index); });
    this.items[index]?.scrollIntoView({ block: "nearest" });
  }

  key(event) {
    if (this.root.hidden) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      this.setActive(this.collection.move(event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      this.setActive(event.key === "Home" ? this.collection.first() : this.collection.last());
    } else if (event.key === "Enter") {
      event.preventDefault();
      this.run(this.items[this.collection.activeIndex]);
    }
  }

  run(item) {
    if (!item || item.disabled || item.hidden) return;
    const action = item.dataset.action || item.dataset.value || item.textContent.trim();
    this.close();
    this.root.dispatchEvent(new CustomEvent("rui:commandselect", { bubbles: true, detail: { action, item } }));
    if (item.dataset.href) window.location.assign(item.dataset.href);
  }

  destroy() {
    this.close();
    this.abort.abort();
    this.overlayStack.destroy();
    instances.delete(this.root);
  }
}

export function mountCommandPalettes(root = document) {
  const nodes = root.matches?.("[data-rui-command]") ? [root] : [...root.querySelectorAll?.("[data-rui-command]") || []];
  return nodes.map((node) => {
    const current = instances.get(node);
    if (current) return current;
    const runtime = new CommandPaletteRuntime(node);
    instances.set(node, runtime);
    return runtime;
  });
}
