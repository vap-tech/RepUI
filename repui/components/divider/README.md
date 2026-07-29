# Divider

`Divider` — семантический разделитель между тематическими областями.

```django
{% divider %}
{% divider orientation="vertical" %}
```

Компонент рендерит `<hr>`, не добавляет margin и не имеет runtime. Расстояние
между блоками задаёт родительский `Stack` или прикладной CSS.
