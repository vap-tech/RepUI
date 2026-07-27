# IconButton

```django
{% icon_button aria_label="Закрыть" %}
  ×
{% endicon_button %}
```

Всегда требуется `aria_label`. JavaScript не нужен: компонент использует
нативный `<button>` или `<a>`.
