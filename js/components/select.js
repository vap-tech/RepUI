import {
  isTypeaheadKey,
  normalize,
  optionMetadata,
  Typeahead,
} from "../runtime/collection.js";
import { FloatingLayer } from "../runtime/floating.js";
import { Listbox } from "./listbox.js";
import { debug } from "../runtime/debug.js";

const q = (selector, root = document) => [...root.querySelectorAll(selector)];

export class Select {
  constructor(root) {
    // Select связывает DOM-контрол, Listbox из runtime и floating panel.
    this.root = root;
    this.trigger = root.querySelector("[data-rui-select-trigger]");
    this.content = root.querySelector("[data-rui-select-content]");
    this.list = root.querySelector("[data-rui-select-list]") || this.content;
    this.input = root.querySelector('input[type="hidden"]');
    this.value = root.querySelector("[data-rui-select-value]");
    this.search = root.querySelector("[data-rui-select-search]");
    this.empty = root.querySelector("[data-rui-select-empty]");
    this.placeholder = this.value?.textContent.trim() || "";
    // Typeahead ищет по label и только меняет active, не выбирая пункт.
    this.typeahead = new Typeahead({
      getItems: () => this.listbox.items,
      getLabel: (item) => optionMetadata(item).label,
      onMatch: (item) => this.listbox.setActive(item),
    });
    this.listbox = new Listbox(this.list, {
      // Listbox владеет navigation, Select — выбранным значением и событиями формы.
      onSelect: (item) => this.choose(item),
      interactionMode: "managed",
      activeDescendantTarget: this.search || this.trigger,
      focusTarget: this.search || this.trigger,
    });
    this.floating = new FloatingLayer({
      root: this.root,
      trigger: this.trigger,
      panel: this.content,
      matchWidth: true,
    });
    // Outside click закрывает Select через границу FloatingLayer.
    this.onDoc = (event) => {
      if (!this.floating.contains(event.target)) this.close();
    };
    this.bind();
    this.syncInitial();
    this.root.addEventListener("rui:floatinganchorhidden", () => this.close());
  }

  get options() {
    // Options ищутся внутри content, даже когда panel уже вынесен в portal.
    return q("[data-rui-option]", this.content);
  }

  bind() {
    // Trigger, content и search передают события в общий Select key handler.
    this.trigger?.setAttribute("aria-haspopup", "listbox");
    this.trigger?.addEventListener("click", () => this.toggle());
    this.trigger?.addEventListener("keydown", (event) => this.key(event));
    this.content?.addEventListener("keydown", (event) => this.key(event));
    this.search?.addEventListener("input", () => this.filter());
    document.addEventListener("pointerdown", this.onDoc);
  }

  syncInitial() {
    // Начальное значение восстанавливается из hidden input или aria-selected.
    const selected = this.options.find(
      (option) =>
        option.getAttribute("aria-selected") === "true" ||
        (this.input?.value && option.dataset.value === this.input.value),
    );
    if (selected) this.apply(selected, false);
  }

  open() {
    // Сначала открываем floating panel, затем после layout передаём focus search/trigger.
    if (
      this.root.matches('[data-disabled="true"], [aria-disabled="true"]') ||
      this.trigger?.disabled
    )
      return;
    if (!this.content?.hidden) return;
    this.root.dataset.open = "true";
    this.trigger?.setAttribute("aria-expanded", "true");
    this.floating.open();
    queueMicrotask(() => {
      if (this.search) {
        this.search.focus();
        this.search.select();
      }
      const selected =
        this.options.find(
          (option) => option.getAttribute("aria-selected") === "true",
        ) || this.listbox.items[0];
      // Active начинается с выбранного пункта или с первого доступного.
      if (selected) this.listbox.setActive(selected);
      this.floating.position();
    });
    debug("Select", "opened", { root: this.root });
    this.root.dispatchEvent(
      new CustomEvent("rui:selectopen", { bubbles: true }),
    );
  }

  close({ restoreFocus = false } = {}) {
    // Закрытие возвращает panel из portal и при необходимости возвращает focus на trigger.
    if (!this.content || this.content.hidden) return;
    this.root.dataset.open = "false";
    this.trigger?.setAttribute("aria-expanded", "false");
    this.floating.close({ restore: true });
    if (restoreFocus) this.trigger?.focus();
    debug("Select", "closed", { root: this.root });
    this.root.dispatchEvent(
      new CustomEvent("rui:selectclose", { bubbles: true }),
    );
  }

  toggle() {
    // Повторный клик по trigger закрывает Select с восстановлением focus.
    this.content.hidden ? this.open() : this.close({ restoreFocus: true });
  }

  apply(item, emit = true) {
    // Синхронизируем selected state, hidden input и внешнее событие.
    this.options.forEach((option) =>
      option.setAttribute("aria-selected", option === item ? "true" : "false"),
    );
    const label =
      item.querySelector("[data-rui-option-label]")?.textContent.trim() ||
      item.textContent.trim();
    const value = item.dataset.value ?? label;
    if (this.input) {
      this.input.value = value;
      if (emit)
        this.input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (this.value) {
      this.value.textContent = label;
      this.value.dataset.placeholder = "false";
    }
    if (emit)
      this.root.dispatchEvent(
        new CustomEvent("rui:selectchange", {
          bubbles: true,
          detail: { value, label, item },
        }),
      );
  }

  choose(item) {
    // Выбор — это apply плюс закрытие с возвратом focus.
    this.apply(item);
    this.close({ restoreFocus: true });
  }

  filter() {
    // Фильтрация скрывает неподходящие options и обновляет navigation state Listbox.
    const term = normalize(this.search.value);
    let count = 0;
    this.options.forEach((option) => {
      const haystack = normalize(
        `${option.dataset.keywords || ""} ${option.textContent}`,
      );
      option.hidden = !haystack.includes(term);
      if (!option.hidden) count += 1;
    });
    if (this.empty) this.empty.hidden = count > 0;
    this.listbox.reconcile();
    this.floating.position();
  }

  clear() {
    // Сбрасываем hidden value и возвращаем placeholder.
    if (this.input) {
      this.input.value = "";
      this.input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    this.options.forEach((option) =>
      option.setAttribute("aria-selected", "false"),
    );
    if (this.value) {
      this.value.textContent = this.placeholder;
      this.value.dataset.placeholder = "true";
    }
    this.root.dispatchEvent(
      new CustomEvent("rui:selectchange", {
        bubbles: true,
        detail: { value: "", label: "", item: null },
      }),
    );
  }

  key(event) {
    // Keyboard contract Select: открыть, навигировать, выбрать, закрыть.
    const open = !this.content.hidden;
    if (event.key === "Escape" && open) {
      event.preventDefault();
      this.close({ restoreFocus: true });
      return;
    }
    if (event.key === "Tab") {
      this.close();
      return;
    }
    if (
      (event.altKey && event.key === "ArrowDown") ||
      (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key))
    ) {
      // Закрытый Select открывается с основных клавиш управления.
      event.preventDefault();
      this.open();
      return;
    }
    if (!open) return;
    if (
      ["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"].includes(
        event.key,
      )
    ) {
      // Во время открытия стрелки двигают только active, без selection.
      event.preventDefault();
      this.listbox.move(event.key);
      return;
    }
    if (event.key === "Enter" && this.listbox.active) {
      // Enter подтверждает текущий active option.
      event.preventDefault();
      this.listbox.select();
      return;
    }
    const targetIsTextInput =
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target?.isContentEditable;
    if (!targetIsTextInput && isTypeaheadKey(event)) {
      const match = this.typeahead.search(event.key, this.listbox.active);
      if (match) event.preventDefault();
    }
  }
}

export function initSelects(root = document) {
  return q("[data-rui-select]", root).map(
    (element) => element.ruiSelect || (element.ruiSelect = new Select(element)),
  );
}
