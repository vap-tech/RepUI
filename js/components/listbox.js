import {
  isTypeaheadKey,
  optionMetadata,
  OptionCollection,
  Typeahead,
} from "../runtime/collection.js";
import { InputModality } from "../runtime/input-modality.js";

const navigationKeys = new Set([
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
  "PageDown",
  "PageUp",
]);

/**
 * Публичный Listbox-адаптер поверх общей механики OptionCollection.
 * Select, Combobox и Command Palette используют его в managed mode;
 * standalone Listbox дополнительно владеет focus и keyboard events.
 */
export class Listbox {
  constructor(
    root,
    {
      onSelect,
      interactionMode = "standalone",
      activeDescendantTarget = interactionMode === "standalone" ? root : null,
      focusTarget = interactionMode === "standalone"
        ? root
        : activeDescendantTarget,
    } = {},
  ) {
    // Listbox не хранит бизнес-значение: он управляет options, active и selection.
    this.root = root;
    this.selector = "[data-rui-option]";
    this.onSelect = onSelect;
    this.interactionMode = interactionMode;
    this.activeDescendantTarget = activeDescendantTarget;
    this.focusTarget = focusTarget;
    this.modality = new InputModality(this.root);
    // OptionCollection — единый источник navigation state для всех коллекционных компонентов.
    this.collection = new OptionCollection(this.root, {
      selector: this.selector,
      activeDescendantTarget,
      focusTarget,
      onSelect: (item) => this.emitSelect(item),
    });
    this.typeahead = new Typeahead({
      // Typeahead меняет active, а режим focus зависит от того, владеет ли Listbox клавиатурой.
      getItems: () => this.items,
      getLabel: (item) => optionMetadata(item).label,
      onMatch: (item) => this.setActive(item, { focus: this.ownsKeyboard }),
    });
    this.bind();
  }

  get ownsKeyboard() {
    // В managed mode keyboard events принадлежат внешнему Select/Combobox.
    return this.interactionMode === "standalone";
  }
  get items() {
    return this.collection.items;
  }
  get active() {
    return this.collection.active;
  }
  set active(item) {
    item ? this.collection.setActive(item) : this.collection.clearActive();
  }

  bind() {
    // Standalone Listbox сам подключает tabindex, focus и keyboard handlers.
    this.root.setAttribute("role", this.root.getAttribute("role") || "listbox");
    if (this.ownsKeyboard) {
      if (!this.root.hasAttribute("tabindex")) this.root.tabIndex = 0;
    } else if (this.root.hasAttribute("tabindex")) {
      this.root.tabIndex = -1;
    }

    if (!this.ownsKeyboard) return;

    this.onFocus = () => this.reconcile();
    this.onKeydown = (event) => {
      if (navigationKeys.has(event.key)) {
        // Стрелки, Home/End и PageUp/PageDown двигают только active.
        event.preventDefault();
        this.modality.keyboard();
        this.move(event.key, { focus: true });
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        // Enter/Space подтверждают текущий active в standalone режиме.
        event.preventDefault();
        this.select();
        return;
      }
      if (isTypeaheadKey(event)) {
        this.modality.keyboard();
        const match = this.typeahead.search(event.key, this.active);
        if (match) event.preventDefault();
      }
    };
    this.root.addEventListener("focus", this.onFocus);
    this.root.addEventListener("keydown", this.onKeydown);
  }

  refresh() {
    // Refresh перечитывает DOM options после динамической подмены разметки.
    return this.collection.refresh();
  }
  reconcile(options) {
    // Reconcile исправляет active после фильтрации, скрытия или удаления options.
    return this.collection.reconcile(options);
  }
  clearActive() {
    return this.collection.clearActive();
  }
  setActive(item, options) {
    return this.collection.setActive(item, options);
  }
  move(key, options) {
    // Managed-компоненты вызывают move из собственного key handler.
    this.modality.keyboard();
    return this.collection.move(key, options);
  }
  select(item = this.active) {
    // Selection отделён от navigation: active можно двигать без выбора.
    return this.collection.select(item);
  }

  emitSelect(item) {
    // onSelect обслуживает конкретный компонент, событие остаётся общим DOM-контрактом.
    this.onSelect?.(item);
    this.root.dispatchEvent(
      new CustomEvent("rui:listboxselect", {
        bubbles: true,
        detail: optionMetadata(item),
      }),
    );
  }

  destroy() {
    // Удаляем listeners, сбрасываем Typeahead и уничтожаем shared collection.
    this.typeahead.reset();
    if (this.onFocus) this.root.removeEventListener("focus", this.onFocus);
    if (this.onKeydown)
      this.root.removeEventListener("keydown", this.onKeydown);
    this.collection.destroy();
  }
}

export function initListboxes(root = document) {
  return [...root.querySelectorAll("[data-rui-listbox]")].map(
    (el) =>
      el.ruiListbox ||
      (el.ruiListbox = new Listbox(el, {
        interactionMode: "standalone",
      })),
  );
}
