# Interaction contract

## Primitive, а не базовый класс

Интерактивные компоненты используют `activation` и `roving` композиционно.
Компонент не наследуется от ButtonBase и не зависит от соседнего компонента.

## Native first

Если браузер уже предоставляет корректную семантику, используется нативный
элемент:

- Button → `<button>` / `<a>`;
- IconButton → `<button>` / `<a>`;
- MenuItem → `<button role="menuitem">`;
- Tab → `<button role="tab">`.

`createActivation()` нужен только там, где нативная семантика не покрывает
контракт компонента.

## Явный lifecycle

JavaScript подключается и монтируется явно:

```js
import { mountTabs } from ".../tabs.js";
mountTabs(document);
```

После HTMX swap mount вызывается для нового root.

## События

Публичные события используют namespace:

```text
rui:activate
rui:change
rui:delete
```

События действия должны всплывать. События, которые могут быть отменены
пользовательским кодом, создаются с `cancelable: true`.

## Идемпотентный mount

Повторный mount одного DOM-узла возвращает существующий экземпляр и не создаёт
дублированные listeners.

## Destroy

Каждый runtime-экземпляр предоставляет `destroy()`. Все listeners компонента
привязаны к одному AbortController.
