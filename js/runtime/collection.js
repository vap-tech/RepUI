import { CollectionController } from "./rui-core-collection.js";

export const normalize = (value = "") =>
  // Нормализация нужна для русской фильтрации и typeahead: ё/е и регистр считаются одинаковыми.
  value
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
export const visibleItems = (root, selector) =>
  // Возвращаем только видимые и доступные для выбора элементы.
  [...root.querySelectorAll(selector)].filter(
    (el) => !el.hidden && el.getAttribute("aria-disabled") !== "true",
  );
export function moveIndex(items, current, key, page = 8) {
  // Чистая функция расчёта следующего индекса без изменения DOM или state.
  if (!items.length) return -1;
  if (key === "Home") return 0;
  if (key === "End") return items.length - 1;
  if (key === "PageDown")
    return Math.min(items.length - 1, Math.max(0, current) + page);
  if (key === "PageUp") return Math.max(0, Math.max(0, current) - page);
  if (key === "ArrowDown")
    return current < 0 ? 0 : (current + 1) % items.length;
  if (key === "ArrowUp")
    return current < 0
      ? items.length - 1
      : (current - 1 + items.length) % items.length;
  return current;
}
export function ensureId(el, prefix = "rui-item") {
  // CollectionController требует стабильный уникальный id для каждого option.
  if (!el.id)
    el.id = `${prefix}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  return el.id;
}
export function scrollIntoViewIfNeeded(el) {
  // Прокручиваем ближайший scroll-контейнер только если active вышел за его границы.
  if (!el) return;
  let container = el.parentElement;
  while (container && container !== document.body) {
    const style = getComputedStyle(container);
    const scrollable =
      /(auto|scroll|overlay)/.test(`${style.overflowY}${style.overflow}`) &&
      container.scrollHeight > container.clientHeight;
    if (scrollable) break;
    container = container.parentElement;
  }
  if (!container || container === document.body) return;
  const itemRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  if (itemRect.top < containerRect.top)
    container.scrollTop -= containerRect.top - itemRect.top;
  else if (itemRect.bottom > containerRect.bottom)
    container.scrollTop += itemRect.bottom - containerRect.bottom;
}

export function optionMetadata(item) {
  // Единый способ получить label, description и value из DOM option.
  const label =
    item
      ?.querySelector?.("[data-rui-option-label], .rui-option__label")
      ?.textContent.trim() || "";
  const description =
    item
      ?.querySelector?.(
        "[data-rui-option-description], .rui-option__description",
      )
      ?.textContent.trim() || "";
  const value =
    item?.dataset?.value ?? (label || item?.textContent?.trim() || "");
  const text =
    [label, description].filter(Boolean).join(" — ") ||
    item?.textContent?.trim() ||
    "";
  return { value, label: label || text, description, text, item };
}

export function isTypeaheadKey(event) {
  // Typeahead принимает одиночные символы, но не служебные комбинации клавиш.
  return (
    event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey
  );
}

/**
 * Общая коллекция с одним active-пунктом для Listbox, Select, Combobox
 * и Command Palette. Она владеет eligibility options, active descendant,
 * pointer focus retention, navigation и selection.
 */
export class OptionCollection {
  constructor(
    root,
    {
      selector = "[data-rui-option]",
      activeDescendantTarget = null,
      focusTarget = activeDescendantTarget,
      onSelect = null,
      onActiveChange = null,
    } = {},
  ) {
    // OptionCollection — слой DOM-связки над CollectionController из runtime.
    this.root = root;
    this.selector = selector;
    this.activeDescendantTarget = activeDescendantTarget;
    this.focusTarget = focusTarget;
    this.onSelect = onSelect;
    this.onActiveChange = onActiveChange;
    this.controller = new CollectionController({ loopNavigation: true });
    // Controller хранит state, а render синхронизирует его с DOM.
    this.unsubscribe = this.controller.subscribe(({ state }) =>
      this.render(state),
    );
    this.bind();
    this.refresh();
  }

  get allItems() {
    // Все options, включая hidden и disabled.
    return [...this.root.querySelectorAll(this.selector)];
  }
  get items() {
    // Только navigable options, пригодные для active/navigation.
    return this.allItems.filter((item) => this.controller.isNavigable(item.id));
  }
  get active() {
    return (
      this.allItems.find((item) => item.id === this.controller.activeId) || null
    );
  }
  set active(item) {
    this.setActive(item);
  }

  isDisabled(item) {
    // Disabled определяется и HTML/ARIA-атрибутами, и data-состояниями RepUI.
    return (
      !item ||
      item.hidden ||
      item.getAttribute("aria-disabled") === "true" ||
      item.dataset.disabled === "true" ||
      item.dataset.selectable === "false"
    );
  }

  toModel(item) {
    // Преобразуем DOM option в модель CollectionController.
    return {
      id: ensureId(item),
      value: optionMetadata(item).value,
      label: optionMetadata(item).label,
      disabled:
        item.getAttribute("aria-disabled") === "true" ||
        item.dataset.disabled === "true",
      hidden: item.hidden,
      selectable: item.dataset.selectable !== "false",
      element: item,
    };
  }

  bind() {
    // Pointer events здесь общие для standalone и managed компонентов.
    this.onPointerMove = (event) => {
      // Наведение сразу передаёт ownership active текущему option.
      const item = event.target.closest(this.selector);
      if (!item || !this.root.contains(item) || this.isDisabled(item)) return;
      this.setActive(item, { reason: "pointer", event });
    };
    this.onPointerDown = (event) => {
      // Pointerdown удерживает focus на управляющем target и не даёт scrollbar стать selection.
      if (event.button !== 0) return;
      if (event.target === this.root) {
        const overVerticalScrollbar = event.offsetX >= this.root.clientWidth;
        const overHorizontalScrollbar = event.offsetY >= this.root.clientHeight;
        if (overVerticalScrollbar || overHorizontalScrollbar) return;
      }
      const item = event.target.closest(this.selector);
      const interactive = event.target.closest(
        'input, button, a, select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
      );
      if (!item && interactive) return;
      event.preventDefault();
      if (item && !this.isDisabled(item))
        this.setActive(item, { reason: "pointer", event });
      this.focusTarget?.focus?.({ preventScroll: true });
    };
    this.onClick = (event) => {
      // Click подтверждает конкретный доступный option.
      const item = event.target.closest(this.selector);
      if (!item || !this.root.contains(item) || this.isDisabled(item)) return;
      this.setActive(item, { reason: "pointer", event });
      this.select(item);
    };
    this.root.addEventListener("pointermove", this.onPointerMove);
    this.root.addEventListener("pointerdown", this.onPointerDown);
    this.root.addEventListener("click", this.onClick);
  }

  refresh() {
    // Refresh перечитывает DOM options после добавления или замены разметки.
    this.allItems.forEach((item) => {
      ensureId(item);
      item.setAttribute("role", item.getAttribute("role") || "option");
      item.tabIndex = -1;
    });
    this.controller.setItems(this.allItems.map((item) => this.toModel(item)));
    return this.reconcile();
  }

  render(state) {
    // Render оставляет в DOM ровно один data-active и обновляет aria-activedescendant.
    this.allItems.forEach((item) => {
      if (item.id === state.activeId) item.dataset.active = "true";
      else item.removeAttribute("data-active");
    });
    if (state.activeId)
      this.activeDescendantTarget?.setAttribute(
        "aria-activedescendant",
        state.activeId,
      );
    else this.activeDescendantTarget?.removeAttribute("aria-activedescendant");
    const active = this.active;
    if (active) scrollIntoViewIfNeeded(active);
    this.onActiveChange?.(active);
  }

  clearActive() {
    // Сбрасываем active без изменения selected value.
    this.controller.setActive(null);
    return null;
  }

  setActive(
    item,
    { focus = false, reason = "programmatic", event = null } = {},
  ) {
    // setActive меняет navigation state; selection выполняется отдельным select().
    if (!item || !this.root.contains(item) || this.isDisabled(item))
      return this.active;
    this.controller.setActive(item.id, { reason, event });
    if (focus) this.focusTarget?.focus?.({ preventScroll: true });
    return this.active;
  }

  reconcile({ preferred = null, fallback = "first" } = {}) {
    // После фильтрации или refresh восстанавливаем корректный active option.
    this.controller.setItems(this.allItems.map((item) => this.toModel(item)));
    if (this.active) return this.active;
    if (preferred && !this.isDisabled(preferred))
      return this.setActive(preferred);
    if (fallback === "none") return this.clearActive();
    const candidate = fallback === "last" ? this.items.at(-1) : this.items[0];
    return candidate ? this.setActive(candidate) : this.clearActive();
  }

  move(key, { focus = false } = {}) {
    // Двигаем active по клавише; при focus=true возвращаем focus управляющему target.
    const map = {
      ArrowDown: "next",
      ArrowUp: "previous",
      Home: "first",
      End: "last",
    };
    if (key === "PageDown" || key === "PageUp") {
      const items = this.items;
      if (!items.length) return this.clearActive();
      const current = Math.max(0, items.indexOf(this.active));
      const next =
        key === "PageDown"
          ? Math.min(items.length - 1, current + 8)
          : Math.max(0, current - 8);
      return this.setActive(items[next], { focus, reason: "keyboard" });
    }
    this.controller.move(map[key] || "next", { reason: "keyboard" });
    if (focus) this.focusTarget?.focus?.({ preventScroll: true });
    return this.active;
  }

  select(item = this.active) {
    // Selection не меняет navigation semantics и не выбирает disabled option.
    if (!item || this.isDisabled(item) || !this.root.contains(item))
      return null;
    this.onSelect?.(item);
    return item;
  }

  destroy() {
    // Снимаем pointer listeners, подписки и уничтожаем controller.
    this.root.removeEventListener("pointermove", this.onPointerMove);
    this.root.removeEventListener("pointerdown", this.onPointerDown);
    this.root.removeEventListener("click", this.onClick);
    this.unsubscribe?.();
    this.controller.destroy();
    this.render({ activeId: null });
  }
}

/**
 * Буферизированная навигация по первой букве для нетекстовых list controls.
 * Повторный ввод одной буквы циклически перебирает подходящие options.
 */
export class Typeahead {
  constructor({
    timeout = 650,
    getItems,
    getLabel = (item) => optionMetadata(item).label,
    onMatch,
  } = {}) {
    this.timeout = timeout;
    this.getItems = getItems;
    this.getLabel = getLabel;
    this.onMatch = onMatch;
    this.buffer = "";
    this.lastAt = 0;
    this.timer = 0;
  }

  reset() {
    // Сбрасываем буфер typeahead и его timeout.
    this.buffer = "";
    this.lastAt = 0;
    clearTimeout(this.timer);
    this.timer = 0;
  }

  search(key, current = null) {
    // Добавляем символ в буфер, ищем следующий подходящий option и меняем active.
    const now = performance.now();
    const normalizedKey = normalize(key);
    if (!normalizedKey) return null;
    const expired = now - this.lastAt > this.timeout;
    const repeated =
      !expired && this.buffer.length === 1 && this.buffer === normalizedKey;
    this.buffer =
      expired || repeated ? normalizedKey : `${this.buffer}${normalizedKey}`;
    this.lastAt = now;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.reset(), this.timeout);

    const items = this.getItems?.() || [];
    if (!items.length) return null;
    const start = Math.max(-1, items.indexOf(current));
    for (let offset = 1; offset <= items.length; offset += 1) {
      const item = items[(start + offset) % items.length];
      if (normalize(this.getLabel(item)).startsWith(this.buffer)) {
        this.onMatch?.(item);
        return item;
      }
    }
    return null;
  }
}
