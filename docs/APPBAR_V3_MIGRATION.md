# Переход с AppBar v2 на v3

Удалены `position`, `left`, `span`, `right`. AppBar больше не занимается внутренней геометрией.

Было:
```django
{% appbar position="floating" left=1 span=6 right=3 %}...{% endappbar %}
```

Стало:
```django
{% appbar behavior="sticky" surface="glass" %}
  {% grid columns=10 %}
    ...
  {% endgrid %}
{% endappbar %}
```

Runtime: `setAppBarPosition/setAppBarLayout` заменены на `setAppBarBehavior/setAppBarSurface`.
