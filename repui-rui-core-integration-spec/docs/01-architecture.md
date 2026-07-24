# 1. Архитектура

## 1.1. Главный принцип

```text
rui-core = состояние и поведение
RepUI    = DOM, CSS, Django API и lifecycle
```

У любого интерактивного состояния ровно один источник истины — controller из `rui-core`.

Разрешённый поток:

```text
DOM event → controller method → state event → RepUI render → DOM
```

Запрещённый поток:

```text
DOM event → classList/ARIA напрямую
```

Исключение — чисто визуальные фазы анимации, не влияющие на семантику и accessibility.

## 1.2. Ответственность rui-core

Core отвечает за:

- state и state transitions;
- active/selected/open/expanded;
- keyboard и pointer navigation;
- disabled/hidden/selectable;
- typeahead;
- popup lifecycle;
- Escape/outside click;
- focus trap/restore focus;
- события с `reason`;
- уничтожение своих listeners и timers;
- вычисляемые ARIA-данные;
- framework-independent API.

Core не знает:

- CSS-классы RepUI;
- Django templates;
- тему, цвет и размеры;
- floating geometry;
- HTMX;
- server validation;
- структуру страницы вне переданных nodes.

## 1.3. Ответственность RepUI

RepUI отвечает за:

- HTML/Django templates;
- `data-rui-*` API;
- CSS и дизайн-токены;
- portal/floating positioning;
- DOM registry;
- `mount(root)` / `unmount(root)`;
- классы, `hidden`, `tabindex`, ARIA render;
- native form synchronization;
- HTMX bridge;
- конечный browser bundle;
- docs и demo.

## 1.4. Adapter contract

Каждый компонент RepUI имеет adapter:

```ts
interface RepUIAdapter {
  root: HTMLElement;
  controller: unknown;
  render(): void;
  syncFromDOM?(): void;
  destroy(): void;
}
```

Обязательный порядок:

1. проверить markup;
2. прочитать initial state;
3. создать controller;
4. подписаться;
5. повесить DOM listeners;
6. выполнить initial render;
7. зарегистрировать instance.

`destroy()` и повторный `mount()` идемпотентны.

## 1.5. Registry

Использовать `WeakMap<Element, Map<string, Instance>>`.

Требования:

- один component instance на root;
- повторный mount не создаёт listeners;
- `unmount(root)` уничтожает root и descendants;
- удалённый DOM не удерживается;
- после destroy root можно смонтировать снова.

## 1.6. HTMX

Core не зависит от HTMX. RepUI предоставляет lifecycle:

```js
document.body.addEventListener("htmx:beforeCleanupElement", (e) => {
  RepUI.unmount(e.detail.elt);
});

document.body.addEventListener("htmx:afterSwap", (e) => {
  RepUI.mount(e.detail.target);
});
```

## 1.7. Bundle

В RepUI:

```text
js/vendor/rui-core.min.js
```

Требования:

- IIFE или ESM, согласованный со сборкой RepUI;
- без runtime npm dependencies;
- license/version/commit banner;
- без auto-mount side effect;
- экспорт версии;
- parse/smoke test;
- воспроизводимая сборка;
- исходники core отсутствуют в RepUI.

Рекомендуемый IIFE namespace:

```js
globalThis.RUICore
```

Публичный API конечного пользователя остаётся `window.RepUI`.

## 1.8. Версии

- patch core → автоматический update PR;
- minor core → update PR + полная browser matrix;
- major core → update PR без автомержа;
- RepUI release notes указывают bundled core version.

## 1.9. Целевые controller families

```text
Collection
Listbox/Select/Combobox/Command
Popup/Popover
Dialog/AlertDialog/Sheet
Menu/Dropdown/Menubar/NavigationMenu
Tabs
Accordion/Collapsible
Tooltip
Checkbox/Radio/Switch/Toggle
Slider
TreeView
Focus utilities
```

Интеграция использует только реально экспортируемый API конкретного релиза core. CI падает при исчезновении ожидаемого export.
