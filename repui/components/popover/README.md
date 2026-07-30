# Popover

Произвольное содержимое, открываемое явным trigger и размещаемое через
`OverlayPortal`.

```django
{% popover label="Подробности" %}
  Дополнительная информация.
{% endpopover %}
```

Runtime: `mountPopovers(root)` возвращает `open()`, `close()`, `toggle()`,
`refresh()` и `destroy()`. Escape и outside click обрабатывает OverlayPortal.
После HTMX swap вызовите mount для нового root.

## Manual checks

- [ ] Открывается и закрывается по кнопке.
- [ ] Не обрезается родительским overflow.
- [ ] Закрывается по Escape и outside click.
- [ ] Переворачивается при нехватке места.
