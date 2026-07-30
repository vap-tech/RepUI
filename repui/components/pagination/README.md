# Pagination

Stateless-навигация по страницам. Компонент не меняет URL и не хранит состояние:
используйте обычные ссылки или HTMX-атрибуты.

```django
{% pagination aria_label="Страницы каталога" %}
  <a class="rui-pagination__item" href="?page=1" data-page="1">1</a>
  <a class="rui-pagination__item" href="?page=2" aria-current="page" data-page="2">2</a>
{% endpagination %}
```

`mountPaginations(root)` только отправляет `rui:pagechange`; повторный mount
идемпотентен. URL и загрузка страницы остаются ответственностью ссылки/HTMX.

## Manual checks

- [ ] Обычные ссылки меняют страницу нативно.
- [ ] `aria-current="page"` виден для текущей страницы.
- [ ] Disabled пункт не вызывает событие.
- [ ] HTMX swap не создаёт дублированный listener.
