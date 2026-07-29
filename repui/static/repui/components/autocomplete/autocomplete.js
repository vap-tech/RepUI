import { CollectionController } from "../../interaction/collection.js";
import { OverlayPortal } from "../../interaction/overlay-portal.js";

const instances = new WeakMap();
const ROOT_SELECTOR = "[data-rui-autocomplete]";
let uid = 0;

function collect(root) {
  const nodes = [];
  if (root instanceof HTMLElement && root.matches(ROOT_SELECTOR)) nodes.push(root);
  nodes.push(...(root.querySelectorAll?.(ROOT_SELECTOR) || []));
  return [...new Set(nodes)];
}

class AutocompleteRuntime {
  constructor(root) {
    this.element = root;
    this.input = root.querySelector(".rui-autocomplete__input");
    this.hiddenInput = root.querySelector("[data-rui-autocomplete-value]");
    this.popup = root.querySelector(".rui-autocomplete__popup");
    this.listbox = root.querySelector("[data-rui-autocomplete-options]");
    this.empty = root.querySelector("[data-rui-autocomplete-empty]");
    if (!this.input || !this.hiddenInput || !this.popup || !this.listbox) {
      throw new Error("Autocomplete markup is incomplete");
    }
    this.collection = new CollectionController({ loop: false });
    this.abort = new AbortController();
    if (!this.listbox.id) this.listbox.id = `rui-autocomplete-${++uid}`;
    this.input.setAttribute("aria-controls", this.listbox.id);
    this.portal = new OverlayPortal(this.input, this.popup, {
      onRequestClose: () => this.close(),
    });
    this.bind();
    this.refresh();
  }

  options() { return [...this.listbox.querySelectorAll("[data-rui-autocomplete-option]")]; }

  refresh() {
    const options = this.options();
    const previousValue = this.hiddenInput.value;
    this.collection.setItems(options.map((element, index) => ({
      index,
      element,
      value: element.dataset.value || "",
      label: element.textContent.trim(),
      selected: element.getAttribute("aria-selected") === "true" || element.dataset.value === previousValue,
      disabled: element.hidden || element.getAttribute("aria-disabled") === "true",
    })));
    const selected = this.collection.selected();
    this.setActive(selected >= 0 ? selected : this.collection.first(), { scroll: false });
    if (!this.popup.hidden) this.portal.position();
    return this;
  }

  open() {
    if (this.input.disabled || this.input.readOnly || !this.collection.items.length) return this;
    this.popup.hidden = false;
    this.portal.mount();
    this.input.setAttribute("aria-expanded", "true");
    this.portal.position();
    return this;
  }

  filter() {
    const query = this.input.value.toLocaleLowerCase("ru-RU").trim();
    let visible = 0;
    this.options().forEach((option) => {
      const text = `${option.dataset.value || ""} ${option.dataset.keywords || ""} ${option.textContent}`.toLocaleLowerCase("ru-RU");
      option.hidden = !text.includes(query);
      if (!option.hidden) visible += 1;
    });
    if (this.empty) this.empty.hidden = visible > 0;
    this.refresh();
    return visible;
  }

  close() {
    if (this.popup.hidden) return this;
    this.popup.hidden = true;
    this.portal.unmount();
    this.input.setAttribute("aria-expanded", "false");
    this.input.removeAttribute("aria-activedescendant");
    return this;
  }

  setActive(index, { scroll = true } = {}) {
    this.options().forEach((option) => option.removeAttribute("data-active"));
    if (index < 0 || !this.collection.setActive(index)) {
      this.input.removeAttribute("aria-activedescendant");
      return this;
    }
    this.options().forEach((option, optionIndex) => {
      const active = optionIndex === index;
      if (!active) return;
      option.dataset.active = "true";
      if (!option.id) option.id = `${this.listbox.id}-option-${optionIndex}`;
      this.input.setAttribute("aria-activedescendant", option.id);
      if (scroll) option.scrollIntoView({ block: "nearest" });
    });
    return this;
  }

  choose(index, originalEvent = null) {
    const item = this.collection.items[index];
    if (!item || item.disabled) return this;
    this.hiddenInput.value = item.value;
    this.input.value = item.label;
    this.options().forEach((option, optionIndex) => {
      option.setAttribute("aria-selected", String(optionIndex === index));
    });
    this.hiddenInput.dispatchEvent(new Event("input", { bubbles: true }));
    this.hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    this.element.dispatchEvent(new CustomEvent("rui:autocompletechange", {
      bubbles: true,
      detail: { value: item.value, label: item.label, originalEvent },
    }));
    this.close();
    return this;
  }

  onKeydown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault(); this.open(); this.setActive(this.collection.move(1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault(); this.open(); this.setActive(this.collection.move(-1));
    } else if (event.key === "Home" && !this.popup.hidden) {
      event.preventDefault(); this.setActive(this.collection.first());
    } else if (event.key === "End" && !this.popup.hidden) {
      event.preventDefault(); this.setActive(this.collection.last());
    } else if (event.key === "Enter" && !this.popup.hidden) {
      event.preventDefault(); this.choose(this.collection.activeIndex, event);
    } else if (event.key === "Escape" && !this.popup.hidden) {
      event.preventDefault(); this.close();
    } else if (event.key === "Tab") {
      this.close();
    }
  }

  bind() {
    const { signal } = this.abort;
    this.input.addEventListener("focus", () => this.open(), { signal });
    this.input.addEventListener("input", () => {
      this.filter();
      this.open();
    }, { signal });
    this.input.addEventListener("keydown", (event) => this.onKeydown(event), { signal });
    this.listbox.addEventListener("pointermove", (event) => {
      const option = event.target.closest("[data-rui-autocomplete-option]");
      if (!option || option.getAttribute("aria-disabled") === "true") return;
      this.setActive(this.options().indexOf(option), { scroll: false });
    }, { signal });
    this.listbox.addEventListener("click", (event) => {
      const option = event.target.closest("[data-rui-autocomplete-option]");
      if (option) this.choose(this.options().indexOf(option), event);
    }, { signal });
    this.element.addEventListener("htmx:afterSwap", () => this.refresh(), { signal });
  }

  destroy() {
    this.close();
    this.portal.destroy();
    this.abort.abort();
    instances.delete(this.element);
  }
}

export function mountAutocompletes(root = document) {
  return collect(root).map((element) => {
    let instance = instances.get(element);
    if (!instance) {
      instance = new AutocompleteRuntime(element);
      instances.set(element, instance);
    } else {
      instance.refresh();
    }
    return instance;
  });
}

document.addEventListener("htmx:afterSwap", (event) => {
  mountAutocompletes(event.detail?.target || event.target);
});
