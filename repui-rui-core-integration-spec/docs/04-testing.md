# 4. Автоматическое тестирование

## 4.1. Уровни

```text
unit controller
→ DOM adapter
→ real browser
→ RepUI integration
→ automated a11y
→ manual screen-reader smoke
```

Unit tests не заменяют browser focus tests.

## 4.2. Unit — rui-core

Проверять:

- initial state;
- idempotent setters;
- event reason;
- navigation;
- single/multiple selection;
- disabled/hidden/selectable;
- reorder/removal;
- typeahead timeout;
- popup reasons;
- nested overlay stack;
- tabs modes;
- accordion constraints;
- destroy из любого состояния.

Инварианты:

```text
activeId == null либо существует
single selected count ≤ 1
destroyed controller больше не emits
aria active target не вычисляется для отсутствующего item
```

Для Collection/Tree рекомендуется property/fuzz testing.

## 4.3. DOM tests

JSDOM/happy-dom:

- parsing;
- classes/attributes;
- ARIA;
- native input;
- `input/change`;
- duplicate mount;
- destroy;
- replacement;
- observer disconnect;
- form reset;
- diagnostics.

Focus-sensitive результат подтверждается real browser.

## 4.4. Playwright

Projects:

```text
chromium
firefox
webkit
```

Viewports:

```text
1280×800
390×844
```

Touch smoke — Chromium mobile emulation.

Общие assertions:

- active count 0/1;
- `aria-activedescendant` ссылается на существующий ID;
- DOM совпадает с controller state;
- `document.activeElement` ожидаемый;
- нет console/page errors;
- `aria-expanded` совпадает с popup visibility;
- duplicate IDs отсутствуют.

## 4.5. Collection regressions

### Mixed input

```text
open → Down×3 → hover другой → Down → Enter
```

Ожидается один active, правильный selection, input focus, одно change event.

### Filter

- active item остаётся;
- active item исчезает;
- empty results;
- results возвращаются;
- stale async result игнорируется.

### Dynamic DOM

- reorder;
- remove active;
- disable active;
- hide active;
- add item;
- replace popup;
- HTMX swap.

## 4.6. Overlay tests

- Tab/Shift+Tab cycle;
- initial focus;
- Escape only top;
- inside/outside click;
- nested popover/dialog;
- restore focus;
- removed trigger;
- HTMX removes open overlay;
- scroll-lock count;
- interrupted animation;
- 50 open/close cycles.

## 4.7. Menu tests

- arrows/Home/End;
- typeahead;
- disabled;
- activation once;
- checkbox/radio item;
- keyboard submenu;
- pointer grace;
- Escape level by level;
- Tab exits;
- RTL;
- menubar switching.

## 4.8. Tabs/disclosure

Tabs: auto/manual, vertical, RTL, disabled, removal.

Accordion: single non-collapsible, single collapsible, multiple, disabled, keyboard, dynamic item.

## 4.9. Form

Для каждого значения:

```js
const data = new FormData(form);
expect(data.get("field")).toBe(expected);
```

Проверять submit/reset/disabled/required/server initial/HTMX error.

## 4.10. Accessibility

Axe на состояниях:

```text
closed/open/focused/selected/error/disabled/nested
```

Проверять роли и accessible names.

Manual перед minor release:

- NVDA + Firefox/Chrome;
- VoiceOver + Safari;
- keyboard only;
- 200% zoom;
- reduced motion;
- forced colors, если заявлено.

## 4.11. Visual regression

Screenshots:

- demo index;
- combobox active/selected;
- dropdown;
- dialog/sheet;
- tabs/accordion;
- validation;
- mobile.

Анимации отключаются. Pixel test не заменяет behavior assertions.

## 4.12. Leak smoke

20 компонентов × 20 mount/unmount cycles.

Debug counters:

```js
RepUI.__debug.instances
RepUI.__debug.overlays
RepUI.__debug.globalListeners
```

После cleanup — ноль.

## 4.13. Bundle tests

- parse;
- expected exports;
- no unexpected globals;
- license banner;
- version;
- min/gzip size;
- SHA256;
- no `eval`;
- no local paths/secrets;
- empty-page smoke;
- optional double-build hash comparison.

## 4.14. CI matrix

Core PR:

```text
lint, typecheck, unit, DOM, build, bundle-check, Chromium
```

Core main/release:

```text
+ Firefox, WebKit, axe, demo
```

RepUI core-update PR:

```text
bundle integrity
DOM
Chromium/Firefox/WebKit
axe
visual smoke
Django template smoke
Pages build
```

Test fixtures и публичное demo должны использовать одну разметку.
