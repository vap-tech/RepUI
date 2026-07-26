# AppBar в `/docs`

Подключите токены и CSS в `<head>`:

```django
<link rel="stylesheet"
      href="{% static 'repui/theme/default/appbar-tokens.css' %}">
<link rel="stylesheet"
      href="{% static 'repui/components/appbar/appbar.css' %}">
```

Разметка:

```django
{% appbar
  id="docs-appbar"
  position="attached"
  width="full"
%}
  <a href="/docs/">RepUI docs</a>
  {% include "docs/partials/theme_mode_select.html" %}
{% endappbar %}
```

Корневая оболочка страницы:

```css
body > .rui-container {
  display: flex;
  flex-direction: column;
}

#docs-grid {
  flex: 1 1 auto;
  min-block-size: 0;
}
```

Переключатель:

```django
<button
  type="button"
  data-rui-appbar-toggle="docs-appbar"
  aria-pressed="false"
>
  Плавает
</button>
```

```js
import {
  mountAppBarControls,
} from "/static/repui/components/appbar/appbar.js";

mountAppBarControls(document);
```

JS меняет только `data-position`; внешний вид задаёт тема.

Для HTMX-заменяемой оболочки:

```js
const controller = new AbortController();

mountAppBarControls(shell, {
  signal: controller.signal,
});

// перед удалением:
controller.abort();
```
