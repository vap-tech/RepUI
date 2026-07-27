# Interaction primitives

Это не компоненты и не публичные Django tags. Это маленький общий JavaScript
слой для компонентов, которым нужна ненативная interaction-механика.

Runtime-файлы находятся в static-каталоге:

- [`activation.js`](../static/repui/interaction/activation.js);
- [`roving.js`](../static/repui/interaction/roving.js);
- [`interaction.css`](../static/repui/interaction/interaction.css).

Подключение и lifecycle всегда явные: primitives не используют `autoInit`.
Повторный вызов конструктора для того же элемента возвращает существующий
instance, а `destroy()` снимает обработчики через `AbortController`.

## activation.js

Нормализует активацию ненативного интерактивного элемента:

- role/tabindex;
- disabled;
- Enter/Space;
- pointer active state;
- `rui:activate`;
- destroy через AbortController.

Для нативного button/link primitive не эмулирует клавиатуру.

Основной API: `createActivation(element, options)`. Возвращаемый instance
имеет `refresh()`, свойство `disabled` и `destroy()`.

## roving.js

Управляет одним `tabindex="0"` внутри группы:

- вертикальная/горизонтальная навигация;
- Home/End;
- loop;
- disabled items исключаются;
- refresh после изменения DOM.

Primitives не знают о Menu, Tabs или SelectOption.

Основной API: `createRovingGroup(root, options)`. Возвращаемый instance
имеет `refresh()`, `setCurrent()`, `move()`, свойства `items` и `index`, а
также `destroy()`.

## Native first

Если задачу уже решает нативный `<button>`, `<a>`, `<input>` или другой
семантический HTML-элемент, primitive не добавляется. Interaction-слой
обслуживает только тот контракт, которого не хватает конкретному компоненту.
