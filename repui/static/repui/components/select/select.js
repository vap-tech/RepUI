import { CollectionController } from "../../interaction/collection.js";
import { OverlayPortal } from "../../interaction/overlay-portal.js";

const instances = new WeakMap();
let generatedId = 0;

function nextId() {
  generatedId += 1;
  return `rui-select-${generatedId}`;
}

function collectRoots(root) {
  const elements = [];
  if (root instanceof HTMLSelectElement &&
      root.matches("[data-rui-select]")) {
    elements.push(root);
  }
  if (root?.querySelectorAll) {
    elements.push(...root.querySelectorAll(
      "select[data-rui-select]"
    ));
  }
  return elements;
}

function optionRecord(option, index) {
  return {
    index,
    value: option.value,
    label: option.textContent.trim(),
    selected: option.selected,
    disabled: option.disabled,
  };
}

class SelectRuntime {
  constructor(select) {
    this.element = select;
    this.select = select;
    this.collection = new CollectionController({
      loop: false,
      disabledItemsFocusable: false,
    });
    this.isOpen = false;
    this.typeahead = "";
    this.typeaheadTimer = null;
    this.abortController = new AbortController();
    this.originalTabIndex = select.getAttribute("tabindex");
    this.originalAriaHidden = select.getAttribute("aria-hidden");
    this.build();
    this.portal = new OverlayPortal(this.trigger, this.popup, {
      onRequestClose: ({ reason }) => this.close(reason === "escape"),
    });
    this.bind();
    this.refresh();
  }

  build() {
    if (
      !this.select.multiple &&
      ![...this.select.options].some((option) => option.defaultSelected)
    ) {
      this.select.selectedIndex = -1;
    }

    const id = this.select.id || nextId();
    if (!this.select.id) this.select.id = id;

    this.wrapper = document.createElement("div");
    this.wrapper.className = "rui-select";
    this.wrapper.dataset.size = this.select.dataset.size || "md";
    this.wrapper.dataset.multiple = String(this.select.multiple);

    this.trigger = document.createElement("button");
    this.trigger.type = "button";
    this.trigger.className = "rui-select__trigger";
    this.trigger.setAttribute("role", "combobox");
    this.trigger.setAttribute("aria-haspopup", "listbox");
    this.trigger.setAttribute("aria-expanded", "false");

    this.valueNode = document.createElement("span");
    this.valueNode.className = "rui-select__value";

    this.iconNode = document.createElement("span");
    this.iconNode.className = "rui-select__icon";
    this.iconNode.setAttribute("aria-hidden", "true");
    this.iconNode.textContent = "▾";

    this.trigger.append(this.valueNode, this.iconNode);

    this.popup = document.createElement("div");
    this.popup.className = "rui-select__popup";
    this.popup.hidden = true;

    this.listbox = document.createElement("div");
    this.listbox.className = "rui-select__listbox";
    this.listbox.id = `${id}-listbox`;
    this.listbox.setAttribute("role", "listbox");
    if (this.select.multiple) {
      this.listbox.setAttribute("aria-multiselectable", "true");
    }

    this.trigger.setAttribute("aria-controls", this.listbox.id);
    this.popup.append(this.listbox);

    this.select.insertAdjacentElement("afterend", this.wrapper);
    this.wrapper.append(this.select, this.trigger, this.popup);

    this.select.dataset.ruiMounted = "true";
    this.select.tabIndex = -1;
    this.select.setAttribute("aria-hidden", "true");
  }

  bind() {
    const { signal } = this.abortController;

    this.trigger.addEventListener(
      "click",
      () => this.toggle(),
      { signal },
    );

    this.trigger.addEventListener(
      "keydown",
      (event) => this.onTriggerKeyDown(event),
      { signal },
    );

    this.listbox.addEventListener(
      "pointermove",
      (event) => {
        const option = event.target.closest("[data-rui-option]");
        if (!option || option.getAttribute("aria-disabled") === "true") {
          return;
        }
        this.setActive(Number(option.dataset.index));
      },
      { signal },
    );

    this.listbox.addEventListener(
      "click",
      (event) => {
        const option = event.target.closest("[data-rui-option]");
        if (!option) return;
        this.selectIndex(Number(option.dataset.index), event);
      },
      { signal },
    );

    this.select.addEventListener(
      "change",
      () => this.syncFromNative(),
      { signal },
    );
    this.select.addEventListener(
      "input",
      () => this.syncFromNative(),
      { signal },
    );

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (
          this.isOpen &&
          !this.wrapper.contains(event.target) &&
          !this.popup.contains(event.target)
        ) {
          this.close();
        }
      },
      { signal },
    );
  }

  onTriggerKeyDown(event) {
    if (this.disabled || this.readonly) return;

    if (!this.isOpen) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        this.open(event.key === "ArrowUp" ? "last" : "selected");
        return;
      }
      this.handleTypeahead(event, false);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.close(true);
    } else if (event.key === "Tab") {
      this.close(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      this.setActive(this.collection.move(1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      this.setActive(this.collection.move(-1));
    } else if (event.key === "Home") {
      event.preventDefault();
      this.setActive(this.collection.first());
    } else if (event.key === "End") {
      event.preventDefault();
      this.setActive(this.collection.last());
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.selectIndex(this.collection.activeIndex, event);
    } else {
      this.handleTypeahead(event, true);
    }
  }

  handleTypeahead(event, activeOnly) {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.key.length !== 1
    ) {
      return;
    }

    this.typeahead += event.key.toLocaleLowerCase();
    clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = setTimeout(() => {
      this.typeahead = "";
    }, 600);

    const index = this.collection.findByPrefix(this.typeahead);
    if (index < 0) return;

    event.preventDefault();

    if (this.isOpen || activeOnly) {
      this.setActive(index);
    } else if (!this.select.multiple) {
      this.selectIndex(index, event);
    }
  }

  renderOptions() {
    this.listbox.replaceChildren();
    this.optionNodes = [];
    const options = [...this.select.options];

    options.forEach((option, index) => {
      const node = document.createElement("div");
      node.id = `${this.listbox.id}-option-${index}`;
      node.className = "rui-select__option";
      node.dataset.ruiOption = "";
      node.dataset.index = String(index);
      node.dataset.value = option.value;
      node.setAttribute("role", "option");
      node.setAttribute("aria-selected", String(option.selected));
      node.textContent = option.textContent;

      if (option.disabled) {
        node.setAttribute("aria-disabled", "true");
      }

      this.listbox.append(node);
      this.optionNodes.push(node);
    });

    if (!options.length) {
      const empty = document.createElement("div");
      empty.className = "rui-select__empty";
      empty.textContent =
        this.select.dataset.emptyText || "Нет вариантов";
      this.listbox.append(empty);
    }

    this.collection.setItems(
      options.map(optionRecord)
    );
  }

  syncFromNative() {
    const selected = [...this.select.selectedOptions];
    const placeholder =
      this.select.dataset.placeholder || "Выберите значение";

    this.valueNode.textContent = selected.length
      ? selected.map((option) => option.textContent.trim()).join(", ")
      : placeholder;
    this.valueNode.dataset.placeholder = String(!selected.length);

    this.optionNodes?.forEach((node, index) => {
      const selectedState =
        this.select.options[index]?.selected ?? false;
      node.setAttribute(
        "aria-selected",
        String(selectedState),
      );
    });

    this.trigger.disabled = this.disabled;
    this.trigger.setAttribute(
      "aria-disabled",
      String(this.disabled),
    );
    this.trigger.setAttribute(
      "aria-readonly",
      String(this.readonly),
    );

    this.wrapper.dataset.disabled = String(this.disabled);
    this.wrapper.dataset.readonly = String(this.readonly);
  }

  setActive(index) {
    if (!this.collection.setActive(index)) return;

    this.optionNodes.forEach((node, nodeIndex) => {
      node.dataset.active = String(nodeIndex === index);
    });

    const active = this.optionNodes[index];
    this.trigger.setAttribute(
      "aria-activedescendant",
      active.id,
    );
    active.scrollIntoView({ block: "nearest" });
  }

  selectIndex(index, originalEvent = null) {
    const option = this.select.options[index];
    if (
      !option ||
      option.disabled ||
      this.disabled ||
      this.readonly
    ) {
      return;
    }

    if (this.select.multiple) {
      option.selected = !option.selected;
    } else {
      this.select.selectedIndex = index;
    }

    this.syncFromNative();

    this.select.dispatchEvent(
      new Event("input", { bubbles: true })
    );
    this.select.dispatchEvent(
      new Event("change", { bubbles: true })
    );

    this.wrapper.dispatchEvent(
      new CustomEvent("rui:change", {
        bubbles: true,
        detail: {
          value: this.value,
          select: this.select,
          option,
          originalEvent,
        },
      })
    );

    this.refreshCollectionOnly();

    if (this.select.multiple) {
      this.setActive(index);
    } else {
      this.close(true);
    }
  }

  refreshCollectionOnly() {
    this.collection.setItems(
      [...this.select.options].map(optionRecord)
    );
  }

  open(initial = "selected") {
    if (this.isOpen || this.disabled || this.readonly) return this;

    this.isOpen = true;
    this.popup.hidden = false;
    this.portal.mount();
    this.wrapper.dataset.open = "true";
    this.trigger.setAttribute("aria-expanded", "true");

    let index = this.collection.selected();
    if (initial === "last") index = this.collection.last();
    if (index < 0) index = this.collection.first();
    if (index >= 0) this.setActive(index);

    this.wrapper.dispatchEvent(
      new CustomEvent("rui:open", {
        bubbles: true,
        detail: { select: this.select },
      })
    );

    return this;
  }

  close(restoreFocus = false) {
    if (!this.isOpen) return this;

    this.isOpen = false;
    this.portal.unmount();
    this.popup.hidden = true;
    this.wrapper.dataset.open = "false";
    this.trigger.setAttribute("aria-expanded", "false");
    this.trigger.removeAttribute("aria-activedescendant");

    this.optionNodes.forEach((node) => {
      node.dataset.active = "false";
    });

    if (restoreFocus) this.trigger.focus();

    this.wrapper.dispatchEvent(
      new CustomEvent("rui:close", {
        bubbles: true,
        detail: { select: this.select },
      })
    );

    return this;
  }

  toggle() {
    return this.isOpen ? this.close() : this.open();
  }

  focus() {
    this.trigger.focus();
    return this;
  }

  refresh() {
    const wasOpen = this.isOpen;
    const activeValue =
      this.collection.items[this.collection.activeIndex]?.value;

    this.renderOptions();
    this.syncFromNative();

    if (wasOpen) {
      let index = this.collection.items.findIndex(
        (item) => item.value === activeValue && !item.disabled
      );
      if (index < 0) index = this.collection.selected();
      if (index < 0) index = this.collection.first();
      if (index >= 0) this.setActive(index);
    }

    return this;
  }

  destroy() {
    this.close();
    this.portal.destroy();
    this.abortController.abort();
    clearTimeout(this.typeaheadTimer);

    delete this.select.dataset.ruiMounted;

    if (this.originalTabIndex === null) {
      this.select.removeAttribute("tabindex");
    } else {
      this.select.setAttribute(
        "tabindex",
        this.originalTabIndex,
      );
    }

    if (this.originalAriaHidden === null) {
      this.select.removeAttribute("aria-hidden");
    } else {
      this.select.setAttribute(
        "aria-hidden",
        this.originalAriaHidden,
      );
    }

    this.wrapper.replaceWith(this.select);
    instances.delete(this.select);
  }

  get disabled() {
    return this.select.disabled;
  }

  get readonly() {
    return (
      this.select.dataset.readonly === "true" ||
      this.select.getAttribute("aria-readonly") === "true"
    );
  }

  get value() {
    return this.select.multiple
      ? [...this.select.selectedOptions].map(
          (option) => option.value
        )
      : this.select.value;
  }

  set value(nextValue) {
    const values = new Set(
      (Array.isArray(nextValue) ? nextValue : [nextValue])
        .map(String)
    );

    [...this.select.options].forEach((option) => {
      option.selected = values.has(option.value);
    });

    this.syncFromNative();
    this.refreshCollectionOnly();
  }
}

export function mountSelects(root = document) {
  return collectRoots(root).map((select) => {
    const current = instances.get(select);
    if (current) return current;

    const runtime = new SelectRuntime(select);
    instances.set(select, runtime);
    return runtime;
  });
}
