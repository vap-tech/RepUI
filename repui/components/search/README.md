# Search

Серверная GET-форма поиска. Search не знает, где искать и как фильтровать
результаты: это ответственность Django view.

```django
{% search action="/search/" name="q" placeholder="Поиск" %}{% endsearch %}
```

Можно передать `method`, `value`, `aria_label`, `id`, `class_name` и `attrs`.
Очистка поля — необязательная lightweight-функция runtime.

Для HTMX передайте `hx_get`, `hx_target` и `hx_swap` через `attrs`; URL и
результаты по-прежнему принадлежат серверу.

## Manual checks

- [ ] Enter отправляет обычный GET-запрос.
- [ ] Очистка не меняет серверное состояние.
- [ ] HTMX заменяет только указанный results target.
- [ ] Компонент не фильтрует локальные данные и не открывает popup.
