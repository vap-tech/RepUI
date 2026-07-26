# 2. Общее ТЗ на интеграцию

## 2.1. Цель

Заменить локальные state machines RepUI контроллерами `rui-core`, сохранив:

- дизайн;
- Django templates;
- существующий `data-rui-*` API;
- native form submit;
- динамический DOM;
- работу конечного пакета без Node/npm.

Big-bang rewrite запрещён. Миграция выполняется вертикальными срезами.

## 2.2. Сборка core

В `rui-core` требуются scripts:

```json
{
  "scripts": {
    "lint": "...",
    "typecheck": "...",
    "test:unit": "...",
    "test:dom": "...",
    "test:browser": "...",
    "test:a11y": "...",
    "build:repui": "...",
    "verify:exports": "...",
    "verify:size": "..."
  }
}
```

Результат:

```text
dist/repui/rui-core.js
dist/repui/rui-core.min.js
dist/repui/rui-core.min.js.map       # optional
dist/repui/build-info.json
```

`build-info.json`:

```json
{
  "name": "rui-core",
  "version": "0.2.0",
  "commit": "abcdef123456",
  "format": "iife",
  "global": "RUICore",
  "exports": ["createCollectionController"],
  "sha256": "..."
}
```

Текущая дата не включается в JS bundle, чтобы одинаковый source давал одинаковый hash.

## 2.3. Структура RepUI

```text
js/
├── vendor/rui-core.min.js
├── adapters/
│   ├── lifecycle.js
│   ├── collection.js
│   ├── popup.js
│   ├── dialog.js
│   ├── menu.js
│   ├── tabs.js
│   ├── disclosure.js
│   └── form-control.js
└── components/
```

Если публикуется единый `repui.js`, vendor может включаться в итоговый файл на build-этапе. В Git всё равно желательно видеть отдельный generated bundle core.

## 2.4. Event contract

Core event:

```ts
{
  type,
  previousState,
  state,
  reason,
  originalEvent
}
```

При необходимости RepUI публикует:

```js
root.dispatchEvent(new CustomEvent("repui:change", {
  bubbles: true,
  detail: { state, reason }
}));
```

Для form-компонентов:

```js
input.dispatchEvent(new Event("input", { bubbles: true }));
input.dispatchEvent(new Event("change", { bubbles: true }));
```

Правила:

- initial mount не emits;
- interactive input emits `input`;
- commit/selection emits `change`;
- каждое пользовательское действие вызывает не более одного события данного типа;
- controller↔native input loop исключён.

## 2.5. ARIA

Adapter обязан гарантировать:

- уникальные ID;
- нет dangling `aria-activedescendant`;
- `aria-expanded` совпадает с popup;
- `aria-selected` не используется как active;
- disabled имеет `aria-disabled`;
- role и relationships корректны;
- focus return;
- `hidden` и `aria-hidden` не противоречат друг другу.

## 2.6. Native form

Для Select, Combobox, Checkbox, Radio, Switch, Slider:

- актуальный `FormData`;
- обычный submit;
- `form.reset()`;
- disabled не отправляется;
- required остаётся browser/server responsibility;
- server-rendered initial state считывается до render;
- HTMX error replacement не ломает instance;
- backend остаётся окончательным валидатором.

## 2.7. Floating

Позиционирование остаётся в RepUI `FloatingLayer`.

Core управляет только lifecycle:

```text
open / close / reason / focus policy
```

RepUI управляет:

- anchor;
- flip/shift;
- viewport collision;
- portal;
- resize/scroll;
- width matching;
- animation.

## 2.8. Диагностика

Development build сообщает:

- отсутствующий trigger/input/popup;
- duplicate ID;
- duplicate mount;
- несовместимую core version;
- invalid ARIA reference.

Опционально:

```js
window.RepUI.debug = true;
```

## 2.9. Performance

- нет бесконтрольного global listener на каждый instance;
- timers удаляются;
- observers disconnect;
- закрытые popup не запускают цикл;
- после 20 mount/unmount нет live instances;
- bundle size имеет budget.

Начальный ориентир:

```text
minified ≤ 60 KB
gzip     ≤ 20 KB
```

Рост >10% требует комментария в PR.

## 2.10. Feature flag

Временно допустимо:

```html
<div data-rui-combobox data-rui-engine="core">
```

Но один root не запускает legacy и core одновременно. После acceptance legacy path удаляется.
