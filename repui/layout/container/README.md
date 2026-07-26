# Container

Container — крупная область разметки.

Без параметров занимает всё пространство, которое отдал родитель:

```django
{% container %}
  Содержимое
{% endcontainer %}
```

Внутри Grid:

```django
{% container column=4 %}
  Рабочая область
{% endcontainer %}
```

Внутри Stack:

```django
{% container row=19 %}
  Основная часть
{% endcontainer %}
```

Полезные аргументы:

- `column=N` — занять N колонок родительского Grid;
- `row=N` — занять N строк родительского Stack;
- `id="..."`;
- `class_name="..."`;
- `attrs=my_attrs`.

Что проверить:

- занимает всю выделенную область;
- длинный контент не расталкивает соседей;
- вложенный Grid или Stack занимает Container;
- HTMX может заменить содержимое.
