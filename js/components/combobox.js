import { normalize } from "../runtime/collection.js";
import { FloatingLayer } from "../runtime/floating.js";
import { Listbox } from "./listbox.js";
import { debug } from "../runtime/debug.js";

export class Combobox {
  constructor(root) {
    // Combobox связывает text input, hidden value, Listbox и floating content.
    this.root = root;
    // Combobox использует единый актуальный core-style markup contract.
    this.input = root.querySelector("[data-rui-input]");
    this.content = root.querySelector("[data-rui-popup]");
    this.list = root.querySelector("[data-rui-combobox-list]") || this.content;
    this.hidden = root.querySelector('input[type="hidden"]');
    this.empty = root.querySelector("[data-rui-combobox-empty]");
    this.clearButton = root.querySelector("[data-rui-combobox-clear]");
    this.listbox = new Listbox(this.list, {
      // Listbox отвечает за active/navigation, Combobox — за query и committed value.
      onSelect: (item) => this.choose(item),
      interactionMode: "managed",
      activeDescendantTarget: this.input,
      focusTarget: this.input,
    });
    this.floating = new FloatingLayer({
      root: this.root,
      trigger: this.input,
      panel: this.content,
      matchWidth: true,
    });
    // Outside click закрывает popup, не меняя committed value.
    this.onDoc = (event) => {
      if (!this.floating.contains(event.target)) this.close();
    };
    this.composing = false;
    this.escapeArmed = false;
    this.committedLabel = this.input.value || "";
    this.committedValue = this.hidden?.value || "";
    this.bind();
    this.root.addEventListener("rui:floatinganchorhidden", () => this.close());
  }

  get options() {
    // Options ищутся внутри content, включая panel после portal.
    return [...this.content.querySelectorAll("[data-rui-option]")];
  }

  bind() {
    // Input управляет query, keyboard и IME composition; content принимает navigation events.
    this.input.setAttribute("role", "combobox");
    this.input.setAttribute("aria-autocomplete", "list");
    this.input.setAttribute("aria-expanded", "false");
    this.input.addEventListener("focus", () => this.open());
    this.input.addEventListener("compositionstart", () => {
      this.composing = true;
    });
    this.input.addEventListener("compositionend", () => {
      this.composing = false;
      this.handleInput();
    });
    this.input.addEventListener("input", () => {
      if (!this.composing) this.handleInput();
    });
    this.input.addEventListener("keydown", (event) => this.key(event));
    this.content.addEventListener("keydown", (event) => this.key(event));
    this.clearButton?.addEventListener("click", () => this.clear());
    document.addEventListener("pointerdown", this.onDoc);
  }

  handleInput() {
    // Любой новый ввод сбрасывает прежний hidden value и запускает фильтрацию.
    this.escapeArmed = false;
    if (this.hidden) this.hidden.value = "";
    this.options.forEach((option) =>
      option.setAttribute("aria-selected", "false"),
    );
    this.filter();
    this.open();
  }

  open() {
    // Открываем popup и после layout обновляем его позицию относительно input.
    if (!this.content.hidden) {
      this.floating.position();
      return;
    }
    this.root.dataset.open = "true";
    this.input.setAttribute("aria-expanded", "true");
    this.floating.open();
    queueMicrotask(() => this.floating.position());
    debug("Combobox", "opened", { root: this.root });
  }

  close() {
    // Закрытие не сбрасывает query: восстановление значения выполняется через Escape.
    if (this.content.hidden) return;
    this.root.dataset.open = "false";
    this.input.setAttribute("aria-expanded", "false");
    this.floating.close({ restore: true });
    debug("Combobox", "closed", { root: this.root });
  }

  filter() {
    // Фильтр скрывает неподходящие options и пересобирает navigation state Listbox.
    const term = normalize(this.input.value);
    let count = 0;
    this.options.forEach((option) => {
      option.hidden = !normalize(
        `${option.dataset.keywords || ""} ${option.textContent}`,
      ).includes(term);
      if (!option.hidden) count += 1;
    });
    if (this.empty) this.empty.hidden = count > 0;
    if (this.clearButton) this.clearButton.hidden = !this.input.value;
    this.listbox.reconcile();
    this.floating.position();
    this.root.dispatchEvent(
      new CustomEvent("rui:comboboxquery", {
        bubbles: true,
        detail: { query: this.input.value },
      }),
    );
  }

  choose(item) {
    // Выбор фиксирует label/value, обновляет форму, закрывает popup и возвращает focus в input.
    const label =
      item.querySelector("[data-rui-option-label]")?.textContent.trim() ||
      item.textContent.trim();
    const value = item.dataset.value ?? label;
    this.input.value = label;
    this.committedLabel = label;
    this.committedValue = value;
    this.escapeArmed = false;
    if (this.hidden) {
      this.hidden.value = value;
      this.hidden.dispatchEvent(new Event("change", { bubbles: true }));
    }
    this.options.forEach((option) =>
      option.setAttribute("aria-selected", option === item ? "true" : "false"),
    );
    this.close();
    this.input.focus();
    this.root.dispatchEvent(
      new CustomEvent("rui:comboboxchange", {
        bubbles: true,
        detail: { value, label, item },
      }),
    );
  }

  clear() {
    // Clear сбрасывает query и hidden value, оставляя Combobox открытым для нового поиска.
    this.input.value = "";
    this.committedLabel = "";
    this.committedValue = "";
    this.escapeArmed = false;
    if (this.hidden) {
      this.hidden.value = "";
      this.hidden.dispatchEvent(new Event("change", { bubbles: true }));
    }
    this.options.forEach((option) => {
      option.hidden = false;
      option.setAttribute("aria-selected", "false");
    });
    if (this.clearButton) this.clearButton.hidden = true;
    this.input.focus();
    this.open();
    this.root.dispatchEvent(
      new CustomEvent("rui:comboboxchange", {
        bubbles: true,
        detail: { value: "", label: "", item: null },
      }),
    );
  }

  key(event) {
    // Keyboard contract: Escape restore/close, arrows navigate, Enter confirms.
    if (event.key === "Escape") {
      if (this.content.hidden) return;
      event.preventDefault();
      const queryChanged =
        this.input.value !== this.committedLabel ||
        (this.hidden?.value || "") !== this.committedValue;
      if (queryChanged && !this.escapeArmed) {
        // Первый Escape восстанавливает последний committed value.
        this.input.value = this.committedLabel;
        if (this.hidden) this.hidden.value = this.committedValue;
        this.filter();
        this.escapeArmed = true;
        this.input.select();
      } else {
        // Второй Escape закрывает popup.
        this.escapeArmed = false;
        this.close();
      }
      return;
    }
    if (event.key === "Tab") {
      this.escapeArmed = false;
      this.close();
      return;
    }

    const edgeKey =
      (event.ctrlKey && (event.key === "Home" || event.key === "End")) ||
      (event.metaKey && (event.key === "ArrowUp" || event.key === "ArrowDown"));
    if (edgeKey) {
      event.preventDefault();
      this.open();
      const key =
        event.key === "Home" || event.key === "ArrowUp" ? "Home" : "End";
      this.listbox.move(key);
      return;
    }

    if (
      ["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(event.key) &&
      !event.metaKey &&
      !event.ctrlKey
    ) {
      event.preventDefault();
      this.open();
      this.listbox.move(event.key);
      return;
    }
    // Обычные Home/End оставляем input для нативного движения text caret.
    if (event.key === "Enter" && this.listbox.active && !this.content.hidden) {
      event.preventDefault();
      this.listbox.select();
    }
  }
}

export function initComboboxes(root = document) {
  return [...root.querySelectorAll("[data-rui-combobox]")].map(
    (element) =>
      element.ruiCombobox || (element.ruiCombobox = new Combobox(element)),
  );
}
