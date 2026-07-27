# SelectOption

Это option-level API компонента Select, а не самостоятельный popup.

```django
{% select_option value="ru" selected=True %}Русский{% endselect_option %}
```

`select_option` рендерит нативный `<option>`. Keyboard, selection, события и
синхронизация формы принадлежат родительскому Select и его `mountSelects()`.
