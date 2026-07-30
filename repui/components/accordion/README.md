# Accordion

Группа раскрываемых секций. Секции создаются только явным тегом
`{% accordion_item %}`.

## Public API

```django
{% accordion %}
  {% accordion_item label="Описание" open=True %}
    Текст секции.
  {% endaccordion_item %}
{% endaccordion %}
```

`accordion` принимает `id`, `class_name`, `attrs`, `multiple`. Item принимает
`label`, `open`, `id`, `class_name`, `attrs`.

## Runtime API

`mountAccordions(root)` возвращает handles с `set(index, open)`, `toggle(index)`,
`refresh()` и `destroy()`. Событие `rui:accordionchange` содержит `index` и
`open`.

## HTMX contract

После swap вызовите `mountAccordions(target)`. Повторный mount идемпотентен.

## Manual checks

- [ ] В single-режиме открыта только одна секция.
- [ ] `multiple=True` разрешает несколько открытых секций.
- [ ] ArrowUp/Down и Home/End перемещают фокус между trigger.
- [ ] `aria-expanded` и `hidden` синхронны.
