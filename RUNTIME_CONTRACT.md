# RepUI component runtime contract

Этот раздел предназначен для добавления в `CONTRIBUTING.md`.

## Runtime является необязательным

Наличие компонента не означает, что ему нужен JavaScript.

Нативные HTML-элементы должны сохранять браузерную семантику без runtime:

```text
Button
IconButton
CardAction
ListItemButton
```

Компонент не должен добавлять JavaScript только ради формального единообразия
поведения.

## Единый lifecycle

Если компонент предоставляет runtime-модуль, его публичная mount-функция имеет
форму:

```js
mount<Component>(root = document)
```

Она возвращает массив экземпляров.

Каждый экземпляр предоставляет:

```js
{
  element,
  refresh(),
  destroy(),
}
```

## Идемпотентность

Повторный mount одного DOM-элемента возвращает существующий экземпляр и не
создаёт дублированные listeners, observers или timers.

## Native first

Runtime не эмулирует уже существующую браузерную семантику.

Для Button запрещено повторно реализовывать:

- click;
- Enter;
- Space;
- disabled;
- submit;
- link navigation;
- focus management.

## Button как нативный no-op runtime

Button может предоставлять `mountButtons()` для приложений с единым lifecycle.

Этот runtime:

- необязателен;
- не добавляет listeners;
- не меняет DOM-семантику;
- возвращает lightweight handles;
- поддерживает `refresh()` и `destroy()`.

## Явное подключение

JavaScript не подключается и не монтируется автоматически.

```js
import { mountButtons } from ".../button.js";

mountButtons(document);
```

Это минимальная явная часть интеграции. Lifecycle интерактивных компонентов
должен быть виден разработчику.

## HTMX

Компоненты, которым mount действительно нужен, монтируются после swap для
нового root.

Для Button mount не требуется, но допустим при использовании общего lifecycle:

```js
document.body.addEventListener("htmx:afterSwap", (event) => {
  mountButtons(event.detail.target);
});
```
