Да. Я бы сейчас не латал `DropdownMenu` отдельно, а разделил систему на четыре слоя:

```text
OverlayPortal     — только перенос и позиционирование
DismissLayer      — outside click, Escape, скрытие anchor
Menu              — клавиатура и активация пунктов
DropdownMenu      — связывает trigger + overlay + Menu
```

Сейчас `OverlayPortal` знает слишком много:

* переносит DOM;
* позиционирует;
* слушает outside click;
* слушает `Escape`;
* решает, когда закрываться;
* частично управляет фокусом.

Из-за этого потом `Tooltip`, `Select`, `Popover` и `Menu` неизбежно начнут спорить за одно поведение.

## 1. Какими должны быть ответственности

### `OverlayPortal`

Только:

* перенести overlay в portal container;
* вернуть его обратно;
* позиционировать относительно anchor;
* реагировать на scroll/resize;
* сообщать, что anchor исчез из viewport.

Он **не должен**:

* слушать `Escape`;
* закрывать overlay;
* возвращать фокус;
* знать, меню это, tooltip или select.

### `DismissLayer`

Общее поведение закрытия:

* клик вне overlay;
* `Escape`;
* необязательно focus outside;
* необязательно anchor hidden.

У разных компонентов конфигурация будет разная.

### `Menu`

Самостоятельный виджет:

* знает свои пункты;
* управляет roving tabindex;
* обрабатывает `ArrowUp`, `ArrowDown`, `Home`, `End`;
* генерирует единое событие активации;
* не знает, находится ли он в Dropdown, Menubar или ContextMenu.

### `DropdownMenu`

Координатор:

* открывает overlay;
* решает, какой пункт сфокусировать;
* закрывает меню после выбора;
* возвращает фокус в trigger;
* обновляет `aria-expanded`.

---

# 2. Исправить `OverlayPortal`

Из него нужно удалить глобальный обработчик клавиатуры и outside pointer.

Сейчас внутри `activate()` есть:

```js
document.addEventListener("pointerdown", ...);
document.addEventListener("keydown", ...);
```

Этого там быть не должно.

Пример итогового API:

```js
const portal = new OverlayPortal(anchor, overlay, {
  offset: 8,
  align: "end",
  matchAnchorWidth: false,
  onAnchorHidden: () => close(),
});

portal.mount();      // переносит в body
portal.activate();   // включает позиционирование
portal.deactivate(); // отключает observers/listeners
portal.unmount();    // возвращает DOM назад
portal.destroy();
```

Из конструктора удалить:

```js
restoreFocus
onRequestClose
```

Добавить только:

```js
onAnchorHidden
```

Фрагмент:

```js
this.options = {
  container: document.body,
  offset: 4,
  viewportPadding: 8,
  matchAnchorWidth: true,
  align: "start",
  horizontalFlip: false,
  arrow: null,
  flip: true,
  onAnchorHidden: null,
  ...options,
};
```

IntersectionObserver:

```js
this.intersectionObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        const entry = entries[0];

        if (entry && !entry.isIntersecting) {
          this.options.onAnchorHidden?.({
            reason: "anchor-hidden",
          });
        }
      })
    : null;
```

В `mount()` также не надо сохранять `document.activeElement`:

```js
mount() {
  if (this.mounted) return this;

  this.overlay.before(this.placeholder);
  this.options.container.append(this.overlay);

  this.overlay.dataset.ruiPortal = "true";
  this.overlay.style.position = "fixed";
  this.overlay.style.inset = "auto";
  this.overlay.style.margin = "0";

  if (this.options.arrow) {
    this.options.arrow.dataset.ruiOverlayArrow = "true";
  }

  this.mounted = true;
  return this;
}
```

То есть `mount()` и `activate()` теперь реально разные операции.

```js
activate() {
  if (!this.mounted || this.abortController) {
    return this;
  }

  this.abortController = new AbortController();
  const { signal } = this.abortController;

  this.scrollParents = getScrollParents(this.anchor);

  this.scrollParents.forEach((parent) => {
    parent.addEventListener(
      "scroll",
      this.schedulePosition,
      {
        signal,
        passive: true,
        capture: parent === window,
      },
    );
  });

  window.addEventListener(
    "resize",
    this.schedulePosition,
    { signal, passive: true },
  );

  window.visualViewport?.addEventListener(
    "resize",
    this.schedulePosition,
    { signal, passive: true },
  );

  window.visualViewport?.addEventListener(
    "scroll",
    this.schedulePosition,
    { signal, passive: true },
  );

  this.resizeObserver?.observe(this.anchor);
  this.resizeObserver?.observe(this.overlay);
  this.intersectionObserver?.observe(this.anchor);

  this.position();
  return this;
}
```

И `unmount()` больше не управляет фокусом.

---

# 3. Добавить общий `dismiss-layer.js`

Например:

```text
repui/static/repui/interaction/dismiss-layer.js
```

```js
export function createDismissLayer(options) {
  const {
    anchor,
    overlay,
    onDismiss,
    escape = true,
    outsidePointer = true,
    focusOutside = false,
  } = options;

  if (!(overlay instanceof HTMLElement)) {
    throw new TypeError(
      "createDismissLayer requires an overlay HTMLElement",
    );
  }

  const abort = new AbortController();
  const { signal } = abort;

  if (outsidePointer) {
    document.addEventListener(
      "pointerdown",
      (event) => {
        const path = event.composedPath();

        if (anchor && path.includes(anchor)) return;
        if (path.includes(overlay)) return;

        onDismiss?.({
          reason: "outside-pointer",
          originalEvent: event,
        });
      },
      {
        signal,
        capture: true,
      },
    );
  }

  if (escape) {
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape") return;

        onDismiss?.({
          reason: "escape",
          originalEvent: event,
        });
      },
      {
        signal,
        capture: true,
      },
    );
  }

  if (focusOutside) {
    document.addEventListener(
      "focusin",
      (event) => {
        const path = event.composedPath();

        if (anchor && path.includes(anchor)) return;
        if (path.includes(overlay)) return;

        onDismiss?.({
          reason: "focus-outside",
          originalEvent: event,
        });
      },
      {
        signal,
        capture: true,
      },
    );
  }

  return {
    destroy() {
      abort.abort();
    },
  };
}
```

Обрати внимание: здесь нет безусловного `preventDefault()` на `Escape`.

Решение принимает сам компонент.

Это важно, потому что:

* `Menu` обычно поглощает `Escape`;
* `Tooltip` вообще не должен мешать клавиатуре;
* `Select` может закрываться по `Escape`, но не обязан одинаково вести себя с Menu;
* вложенный `Popover` должен иметь возможность закрыть только верхний слой.

В будущем сюда можно добавить overlay stack, но сейчас это необязательно.

---

# 4. Усилить `roving.js`

Текущая идея правильная, но API слишком низкоуровневый. Добавь методы:

```js
focusFirst()
focusLast()
focusCurrent()
setCurrentByElement()
```

И обязательно проверяй, что событие пришло от элемента текущей группы, а не от вложенного submenu.

Итоговый вариант:

```js
import { isInteractionDisabled } from "./activation.js";

const instances = new WeakMap();

export function createRovingGroup(root, options = {}) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError(
      "createRovingGroup requires an HTMLElement",
    );
  }

  const existing = instances.get(root);
  if (existing) return existing;

  const config = {
    itemSelector: "[data-rui-roving-item]",
    orientation: "vertical",
    loop: true,
    ...options,
  };

  const abort = new AbortController();
  const { signal } = abort;

  let items = [];
  let index = -1;

  function ownsItem(item) {
    if (!(item instanceof HTMLElement)) return false;

    const owner = item.closest("[data-rui-roving-root]");

    return !owner || owner === root;
  }

  function collectItems() {
    return [...root.querySelectorAll(config.itemSelector)]
      .filter((item) => item instanceof HTMLElement)
      .filter(ownsItem)
      .filter((item) => !isInteractionDisabled(item));
  }

  function setCurrent(next, { focus = true } = {}) {
    if (!items.length) {
      index = -1;
      return api;
    }

    const bounded = Math.max(
      0,
      Math.min(next, items.length - 1),
    );

    items.forEach((item, itemIndex) => {
      item.tabIndex = itemIndex === bounded ? 0 : -1;
    });

    index = bounded;

    if (focus) {
      items[index].focus({ preventScroll: true });
    }

    return api;
  }

  function refresh() {
    const activeElement = document.activeElement;
    const previousItem = items[index];

    items = collectItems();

    let next = previousItem
      ? items.indexOf(previousItem)
      : -1;

    if (next < 0 && activeElement instanceof HTMLElement) {
      next = items.indexOf(activeElement);
    }

    if (next < 0) {
      next = items.findIndex((item) => item.tabIndex === 0);
    }

    if (next < 0) {
      next = items.findIndex(
        (item) =>
          item.getAttribute("aria-selected") === "true" ||
          item.getAttribute("aria-checked") === "true",
      );
    }

    if (next < 0 && items.length) {
      next = 0;
    }

    return setCurrent(next, { focus: false });
  }

  function move(delta) {
    if (!items.length) return api;

    let next = index + delta;

    if (config.loop) {
      next = (next + items.length) % items.length;
    } else {
      next = Math.max(
        0,
        Math.min(next, items.length - 1),
      );
    }

    return setCurrent(next);
  }

  function focusFirst() {
    refresh();
    return setCurrent(0);
  }

  function focusLast() {
    refresh();
    return setCurrent(items.length - 1);
  }

  function focusCurrent() {
    refresh();

    if (index >= 0) {
      items[index]?.focus({ preventScroll: true });
    }

    return api;
  }

  root.dataset.ruiRovingRoot = "";

  root.addEventListener(
    "focusin",
    (event) => {
      const item = event.target.closest(config.itemSelector);

      if (!ownsItem(item)) return;

      const next = items.indexOf(item);

      if (next >= 0) {
        setCurrent(next, { focus: false });
      }
    },
    { signal },
  );

  root.addEventListener(
    "keydown",
    (event) => {
      const item = event.target.closest(config.itemSelector);

      if (!ownsItem(item)) return;

      const horizontal =
        config.orientation === "horizontal";

      const previousKey = horizontal
        ? "ArrowLeft"
        : "ArrowUp";

      const nextKey = horizontal
        ? "ArrowRight"
        : "ArrowDown";

      switch (event.key) {
        case previousKey:
          event.preventDefault();
          move(-1);
          break;

        case nextKey:
          event.preventDefault();
          move(1);
          break;

        case "Home":
          event.preventDefault();
          focusFirst();
          break;

        case "End":
          event.preventDefault();
          focusLast();
          break;
      }
    },
    { signal },
  );

  const api = {
    root,
    refresh,
    move,
    setCurrent,
    focusFirst,
    focusLast,
    focusCurrent,

    get items() {
      return [...items];
    },

    get index() {
      return index;
    },

    destroy() {
      abort.abort();
      delete root.dataset.ruiRovingRoot;
      instances.delete(root);
    },
  };

  instances.set(root, api);
  refresh();

  return api;
}
```

## Почему проверка ownership важна

В будущем появится:

```text
Menu
└── MenuItem
    └── Submenu
        └── MenuItem
```

Без проверки ближайшего roving root стрелка внутри submenu может одновременно двигать:

* пункт submenu;
* пункт родительского menu.

---

# 5. Сделать Menu полноценным API

Сейчас `mountMenus()` возвращает runtime, но `DropdownMenu` не умеет надёжно получить конкретный runtime.

Экспортируй:

```js
export function mountMenu(root)
export function getMenu(root)
export function mountMenus(root)
```

Пример:

```js
import { createRovingGroup } from "../../interaction/roving.js";

const instances = new WeakMap();

export function mountMenu(root) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError("mountMenu requires HTMLElement");
  }

  const existing = instances.get(root);
  if (existing) return existing;

  const roving = createRovingGroup(root, {
    itemSelector: "[data-rui-menu-item]",
    orientation:
      root.dataset.orientation || "vertical",
    loop: root.dataset.loop !== "false",
  });

  const abort = new AbortController();
  const { signal } = abort;

  root.addEventListener(
    "click",
    (originalEvent) => {
      const item = originalEvent.target.closest(
        "[data-rui-menu-item]",
      );

      if (!item || !root.contains(item)) return;
      if (item.disabled) return;
      if (item.getAttribute("aria-disabled") === "true") {
        return;
      }

      const activationEvent = new CustomEvent(
        "rui:menuactivate",
        {
          bubbles: true,
          cancelable: true,
          detail: {
            item,
            value: item.dataset.value ?? null,
            originalEvent,
          },
        },
      );

      item.dispatchEvent(activationEvent);
    },
    { signal },
  );

  const api = {
    root,

    refresh() {
      roving.refresh();
      return api;
    },

    focusFirst() {
      roving.focusFirst();
      return api;
    },

    focusLast() {
      roving.focusLast();
      return api;
    },

    focusCurrent() {
      roving.focusCurrent();
      return api;
    },

    get items() {
      return roving.items;
    },

    destroy() {
      abort.abort();
      roving.destroy();
      instances.delete(root);
    },
  };

  instances.set(root, api);
  return api;
}

export function getMenu(root) {
  return instances.get(root) ?? null;
}

export function mountMenus(root = document) {
  const elements = [];

  if (root.matches?.("[data-rui-menu]")) {
    elements.push(root);
  }

  elements.push(
    ...(root.querySelectorAll?.("[data-rui-menu]") || []),
  );

  return [...new Set(elements)].map(mountMenu);
}
```

Я бы переименовал событие:

```text
rui:activate
```

в:

```text
rui:menuactivate
```

Иначе потом `Button`, `Listbox`, `Tabs` и `Tree` начнут генерировать одно слишком абстрактное событие с разной семантикой.

---

# 6. DropdownMenu должен искать ровно один Menu

Разметка у тебя сейчас такая:

```html
<div data-rui-dropdown-menu>
  <div data-rui-menu>
    ...
  </div>
</div>
```

`DropdownMenu` должен явно найти внутренний menu root:

```js
this.menuRoot = this.overlay.matches("[data-rui-menu]")
  ? this.overlay
  : this.overlay.querySelector("[data-rui-menu]");
```

И упасть с понятной ошибкой, если его нет.

```js
if (!this.menuRoot) {
  throw new Error(
    "DropdownMenu requires a descendant [data-rui-menu]",
  );
}
```

Это лучше, чем вызывать `mountMenus(this.menu)` и хранить массив runtime.

У DropdownMenu по контракту должно быть одно меню.

---

# 7. Полный `dropdown-menu.js`

```js
import {
  mountMenu,
} from "../menu/menu.js";

import {
  OverlayPortal,
} from "../../interaction/overlay-portal.js";

import {
  createDismissLayer,
} from "../../interaction/dismiss-layer.js";

const instances = new WeakMap();

function collect(root) {
  const triggers = [];

  if (
    root instanceof HTMLElement &&
    root.matches("[data-rui-menu-trigger]")
  ) {
    triggers.push(root);
  }

  triggers.push(
    ...(root.querySelectorAll?.(
      "[data-rui-menu-trigger]",
    ) || []),
  );

  return [...new Set(triggers)];
}

class DropdownMenuRuntime {
  constructor(trigger) {
    this.trigger = trigger;

    this.overlay = document.getElementById(
      trigger.dataset.ruiMenuTrigger,
    );

    if (!this.overlay) {
      throw new Error(
        "DropdownMenu trigger target not found",
      );
    }

    this.menuRoot = this.overlay.matches(
      "[data-rui-menu]",
    )
      ? this.overlay
      : this.overlay.querySelector("[data-rui-menu]");

    if (!this.menuRoot) {
      throw new Error(
        "DropdownMenu requires [data-rui-menu]",
      );
    }

    this.menu = mountMenu(this.menuRoot);

    this.opened = false;
    this.dismissLayer = null;

    this.portal = new OverlayPortal(
      this.trigger,
      this.overlay,
      {
        offset: 8,
        matchAnchorWidth: false,
        align: "end",
        onAnchorHidden: () => {
          this.close({
            restoreFocus: false,
            reason: "anchor-hidden",
          });
        },
      },
    );

    this.onTriggerClick = () => {
      if (this.opened) {
        this.close({
          restoreFocus: false,
          reason: "trigger-click",
        });
      } else {
        this.open({
          focus: null,
          reason: "trigger-click",
        });
      }
    };

    this.onTriggerKeyDown = (event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();

          this.open({
            focus: "first",
            reason: "keyboard",
          });
          break;

        case "ArrowUp":
          event.preventDefault();

          this.open({
            focus: "last",
            reason: "keyboard",
          });
          break;

        case "Enter":
        case " ":
          event.preventDefault();

          this.open({
            focus: "first",
            reason: "keyboard",
          });
          break;

        case "Escape":
          if (!this.opened) return;

          event.preventDefault();
          event.stopPropagation();

          this.close({
            restoreFocus: true,
            reason: "escape",
          });
          break;
      }
    };

    this.onOverlayKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          event.stopPropagation();

          this.close({
            restoreFocus: true,
            reason: "escape",
          });
          break;

        case "Tab":
          this.close({
            restoreFocus: false,
            reason: "tab",
          });
          break;

        /*
         * ArrowLeft/ArrowRight намеренно не обрабатываются.
         * Они понадобятся DropdownMenu только после появления
         * вложенных submenu.
         */
      }
    };

    this.onMenuActivate = (event) => {
      const {
        item,
        value,
        originalEvent,
      } = event.detail;

      if (!this.menuRoot.contains(item)) return;

      const context = this.trigger.closest(
        "[data-rui-menu-context]",
      );

      const selectEvent = new CustomEvent(
        "rui:dropdownselect",
        {
          bubbles: true,
          cancelable: true,
          detail: {
            action: value,
            item,
            trigger: this.trigger,
            context,
            contextData: context
              ? { ...context.dataset }
              : null,
            originalEvent,
          },
        },
      );

      this.overlay.dispatchEvent(selectEvent);

      if (selectEvent.defaultPrevented) {
        return;
      }

      this.close({
        restoreFocus: true,
        reason: "selection",
      });
    };

    this.trigger.setAttribute(
      "aria-haspopup",
      "menu",
    );

    this.trigger.setAttribute(
      "aria-expanded",
      "false",
    );

    this.trigger.addEventListener(
      "click",
      this.onTriggerClick,
    );

    this.trigger.addEventListener(
      "keydown",
      this.onTriggerKeyDown,
    );

    this.overlay.addEventListener(
      "keydown",
      this.onOverlayKeyDown,
    );

    this.menuRoot.addEventListener(
      "rui:menuactivate",
      this.onMenuActivate,
    );

    this.overlay.hidden = true;
  }

  createDismissLayer() {
    this.dismissLayer?.destroy();

    this.dismissLayer = createDismissLayer({
      anchor: this.trigger,
      overlay: this.overlay,
      escape: false,
      outsidePointer: true,

      onDismiss: ({ reason }) => {
        this.close({
          restoreFocus: false,
          reason,
        });
      },
    });
  }

  open({
    focus = null,
    reason = "programmatic",
  } = {}) {
    if (this.opened) {
      if (focus === "first") {
        this.menu.focusFirst();
      } else if (focus === "last") {
        this.menu.focusLast();
      }

      return this;
    }

    this.portal.mount();

    this.overlay.hidden = false;
    this.opened = true;

    this.trigger.setAttribute(
      "aria-expanded",
      "true",
    );

    this.menu.refresh();
    this.portal.activate();
    this.portal.position();
    this.createDismissLayer();

    this.overlay.dispatchEvent(
      new CustomEvent("rui:dropdownopen", {
        bubbles: true,
        detail: {
          trigger: this.trigger,
          reason,
        },
      }),
    );

    if (focus) {
      queueMicrotask(() => {
        if (!this.opened) return;

        if (focus === "last") {
          this.menu.focusLast();
        } else {
          this.menu.focusFirst();
        }
      });
    }

    return this;
  }

  close({
    restoreFocus = false,
    reason = "programmatic",
  } = {}) {
    if (!this.opened) return this;

    /*
     * Сначала скрываем визуально, чтобы при возврате
     * DOM в исходное место не было мерцания в карточке.
     */
    this.overlay.hidden = true;
    this.opened = false;

    this.dismissLayer?.destroy();
    this.dismissLayer = null;

    this.portal.deactivate();
    this.portal.unmount();

    this.trigger.setAttribute(
      "aria-expanded",
      "false",
    );

    this.overlay.dispatchEvent(
      new CustomEvent("rui:dropdownclose", {
        bubbles: true,
        detail: {
          trigger: this.trigger,
          reason,
        },
      }),
    );

    if (restoreFocus && this.trigger.isConnected) {
      this.trigger.focus({
        preventScroll: true,
      });
    }

    return this;
  }

  destroy() {
    this.close({
      restoreFocus: false,
      reason: "destroy",
    });

    this.trigger.removeEventListener(
      "click",
      this.onTriggerClick,
    );

    this.trigger.removeEventListener(
      "keydown",
      this.onTriggerKeyDown,
    );

    this.overlay.removeEventListener(
      "keydown",
      this.onOverlayKeyDown,
    );

    this.menuRoot.removeEventListener(
      "rui:menuactivate",
      this.onMenuActivate,
    );

    /*
     * Важное решение:
     * DropdownMenu владеет runtime Menu, потому что сам
     * его смонтировал. Если Menu глобально монтируется
     * другим bootstrap-процессом, лучше использовать
     * acquire/release registry с reference counting.
     */
    this.menu.destroy();
    this.portal.destroy();

    instances.delete(this.trigger);
  }
}

export function mountDropdownMenus(root = document) {
  return collect(root).map((trigger) => {
    let instance = instances.get(trigger);

    if (!instance) {
      instance = new DropdownMenuRuntime(trigger);
      instances.set(trigger, instance);
    }

    return instance;
  });
}
```

---

# 8. Важный вопрос владения runtime

В приведённом коде есть потенциальная архитектурная проблема:

```js
this.menu = mountMenu(this.menuRoot);
```

`mountMenu()` может вернуть уже существующий runtime, созданный глобальным bootstrap. Тогда `DropdownMenu.destroy()` не должен безусловно делать:

```js
this.menu.destroy();
```

Иначе он уничтожит Menu, которым владеет другая система.

Лучше сделать registry с `acquire/release`.

## Универсальный вариант

```js
const instances = new WeakMap();

export function acquireMenu(root) {
  let record = instances.get(root);

  if (!record) {
    record = {
      runtime: createMenuRuntime(root),
      owners: 0,
    };

    instances.set(root, record);
  }

  record.owners += 1;

  let released = false;

  return {
    runtime: record.runtime,

    release() {
      if (released) return;
      released = true;

      record.owners -= 1;

      if (record.owners <= 0) {
        record.runtime.destroy();
        instances.delete(root);
      }
    },
  };
}
```

В Dropdown:

```js
this.menuHandle = acquireMenu(this.menuRoot);
this.menu = this.menuHandle.runtime;
```

В destroy:

```js
this.menuHandle.release();
```

Это уже действительно нормальная архитектура для библиотеки с частичным remount и HTMX.

Но можно начать проще: договориться, что компоненты монтируются ровно одним центральным bootstrap, а Dropdown только вызывает `getMenu()`.

---

# 9. Как это отразится на Select

Select не должен использовать `Menu`.

У него другая семантика:

```text
Select
└── Listbox
    └── Option
```

Различия принципиальные:

| Menu                               | Select/Listbox             |
| ---------------------------------- | -------------------------- |
| `role="menu"`                      | `role="listbox"`           |
| `role="menuitem"`                  | `role="option"`            |
| выполняет действие                 | выбирает значение          |
| после активации обычно закрывается | single/multiple selection  |
| нет выбранного значения            | есть `aria-selected`       |
| фокус обычно на пунктах            | возможен active descendant |

При этом Select переиспользует:

```text
OverlayPortal
DismissLayer
RovingGroup
```

Но не `Menu`.

Пример архитектуры:

```text
SelectRuntime
├── OverlayPortal
├── DismissLayer
└── ListboxRuntime
    └── RovingGroup
```

Для single select:

```js
const listbox = createRovingGroup(listboxRoot, {
  itemSelector: "[role='option']",
  orientation: "vertical",
  loop: true,
});
```

Открытие:

```js
listbox.refresh();

const selectedIndex = listbox.items.findIndex(
  (item) =>
    item.getAttribute("aria-selected") === "true",
);

if (selectedIndex >= 0) {
  listbox.setCurrent(selectedIndex);
} else {
  listbox.focusFirst();
}
```

То есть общая механика переиспользуется, семантика остаётся отдельной.

---

# 10. Как это отразится на Tooltip

Tooltip вообще не использует:

* `DismissLayer` для outside click;
* roving focus;
* возврат фокуса;
* `Escape` как основной механизм;
* interactive focus management.

Его архитектура:

```text
TooltipRuntime
└── OverlayPortal
```

Открывается по:

```text
pointerenter
focusin
```

Закрывается по:

```text
pointerleave
focusout
Escape — опционально
```

Пример:

```js
this.portal = new OverlayPortal(
  this.trigger,
  this.tooltip,
  {
    offset: 6,
    align: "center",
    arrow: this.arrow,
    onAnchorHidden: () => this.close(),
  },
);
```

При открытии:

```js
this.portal.mount();
this.tooltip.hidden = false;
this.portal.activate();
```

При закрытии:

```js
this.tooltip.hidden = true;
this.portal.deactivate();
this.portal.unmount();
```

Tooltip не должен получать фокус и не должен мешать `Tab`.

---

# 11. Что делать с Popover

Popover ближе к Dropdown, но без Menu:

```text
PopoverRuntime
├── OverlayPortal
├── DismissLayer
└── Focus management — опционально
```

Он закрывается:

* outside pointer;
* Escape;
* явной кнопкой закрытия.

Но внутри может быть форма, ссылки и кнопки, поэтому никаких roving-стрелок.

---

# 12. Menubar тоже нужно перевести на Menu API

Текущий `Menubar` вручную ищет:

```js
"[data-rui-menu-item], a, button"
```

Это хрупко.

Вместо:

```js
menu.querySelector(
  "[data-rui-menu-item], a, button",
)?.focus();
```

нужно:

```js
const menuRoot = menu.querySelector("[data-rui-menu]");
const menuRuntime = mountMenu(menuRoot);

menuRuntime.focusFirst();
```

Тогда:

* вертикальные стрелки внутри открытого меню работают через `Menu`;
* горизонтальные стрелки между верхними trigger — через `Menubar`;
* обязанности не пересекаются.

Для Menubar:

```text
ArrowLeft / ArrowRight
    → переключают верхние trigger

ArrowDown
    → открывает текущее меню и фокусирует первый пункт

ArrowUp
    → открывает и фокусирует последний пункт

Внутри menu:
ArrowUp / ArrowDown
    → перемещают пункты

ArrowLeft / ArrowRight
    → позже могут переключать соседнее верхнее меню
```

Последний пункт лучше реализовывать именно в `Menubar`, потому что простое DropdownMenu не должно переключать соседние меню.

---

# 13. Почему сейчас не работают Left/Right

Для вертикального Menu это нормально.

Ожидаемая модель:

```text
ArrowUp
ArrowDown
Home
End
Enter
Space
Escape
```

`ArrowLeft` и `ArrowRight` получают смысл только в двух случаях:

### Submenu

```text
ArrowRight → открыть вложенное меню
ArrowLeft  → закрыть вложенное меню
```

### Menubar

```text
ArrowRight → следующее меню верхнего уровня
ArrowLeft  → предыдущее меню верхнего уровня
```

Не стоит добавлять в обычный DropdownMenu горизонтальную навигацию просто ради того, чтобы все четыре стрелки что-то делали.

---

# 14. Порядок внедрения

Я бы внедрял именно так:

1. Убрать dismiss и focus restore из `OverlayPortal`.
2. Добавить `DismissLayer`.
3. Расширить API `RovingGroup`.
4. Сделать `mountMenu()` публичным и однозначным.
5. Перевести DropdownMenu на `MenuRuntime`.
6. Перевести Menubar на тот же `MenuRuntime`.
7. Только потом делать Select как `Listbox`, а не как Menu.
8. Tooltip оставить пользователем только `OverlayPortal`.

Итоговая зависимость получится такой:

```text
interaction/
├── overlay-portal.js
├── dismiss-layer.js
├── roving.js
└── activation.js

components/
├── menu/
│   └── menu.js
├── dropdown_menu/
│   └── dropdown-menu.js
├── menubar/
│   └── menubar.js
├── listbox/
│   └── listbox.js
├── select/
│   └── select.js
├── popover/
│   └── popover.js
└── tooltip/
    └── tooltip.js
```

Главный принцип: **не переиспользовать DropdownMenu внутри Select или Tooltip**. Переиспользовать нужно низкоуровневые механизмы — portal, dismiss и roving. Тогда изменение клавиатуры Menu не сломает Select, а изменение закрытия Tooltip не повлияет на DropdownMenu.
