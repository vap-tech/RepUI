# Stack

Stack делит высоту родителя на строки.

```django
{% stack rows=20 %}
  {% container row=1 %}Заголовок{% endcontainer %}
  {% container row=19 %}Основная часть{% endcontainer %}
{% endstack %}
```

Аргументы:

- `rows=N` — число строк;
- `row_size="fill"` — честно делить высоту родителя;
- `row_size="content"` — высота строк по содержимому;
- `spacing="none|xs|sm|md|lg"`;
- `column=N` и `row=N`, если сам Stack вложен в другую разметку.

Что проверить:

- строки получают ожидаемую высоту;
- корневой Stack занимает высоту окна;
- вложенный Stack занимает выделенную область;
- HTMX-замена не требует инициализации.
