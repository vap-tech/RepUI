# Grid

Grid делит ширину родителя на колонки.

```django
{% grid columns=5 %}
  {% container column=1 %}Навигация{% endcontainer %}
  {% container column=4 %}Рабочая область{% endcontainer %}
{% endgrid %}
```

Аргументы:

- `columns=N` — число колонок;
- `column_size="fill"` — честно делить ширину родителя;
- `column_size="content"` — ширина колонок по содержимому;
- `spacing="none|xs|sm|md|lg"`;
- `column=N` и `row=N`, если сам Grid вложен в другую разметку.

Для пагинации:

```django
{% grid columns=10 column_size="content" spacing="xs" %}
  ...
{% endgrid %}
```

Что проверить:

- колонки делят родителя ожидаемо;
- дочерний `column=N` занимает нужное число частей;
- лишние элементы переходят на следующую строку;
- вложенный Grid работает внутри Container.
