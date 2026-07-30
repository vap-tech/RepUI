# Collapsible

Явно раскрываемая область для дополнительного содержимого.

## Public API

```django
{% collapsible label="Дополнительные настройки" open=True %}
  Дополнительная информация
{% endcollapsible %}
```

Параметры: `label`, `open`, `id`, `class_name`, `attrs`.

## Runtime API

`mountCollapsibles(root)` возвращает handles с `setOpen()`, `toggle()`,
`refresh()` и `destroy()`. Автоматического mount нет.

## Composition

Триггер создаётся компонентом явно, содержимое передаётся в body. Внутри можно
использовать публичные RepUI-компоненты и Layout.

## HTMX contract

После swap нужно вызвать `mountCollapsibles(target)`. Повторный mount
идемпотентен.

## Manual checks

- [ ] Открытие и закрытие работают мышью и клавиатурой.
- [ ] `aria-expanded` и `hidden` синхронны.
- [ ] После HTMX swap нет дублированного события.
