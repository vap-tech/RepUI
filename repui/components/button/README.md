# Button

Button рендерит нативный `<button>` или `<a>`.

```django
{% load repui %}

{% button
  variant="filled"
  color="primary"
  size="md"
  href="/download/"
%}
  Загрузить
{% endbutton %}
```

Без `href` рендерится:

```html
<button type="button">
```

С `href` рендерится:

```html
<a href="...">
```

## Публичный API

Variants:

```text
filled
outlined
soft
text
```

Colors:

```text
default
primary
secondary
success
warning
danger
```

Sizes:

```text
xs
sm
md
lg
xl
```

States:

```text
disabled
loading
full_width
icon_only
```

## Runtime

Для обычной Button JavaScript не нужен.

Enter, Space, focus, disabled, submit и link navigation обслуживаются браузером.
RepUI не дублирует эту семантику в JavaScript.

Для приложений с единым lifecycle доступен необязательный runtime handle:

```django
{% load static %}

<script type="module">
  import { mountButtons }
    from "{% static 'repui/components/button/button.js' %}";

  const buttons = mountButtons(document);
</script>
```

Каждый экземпляр содержит:

```js
{
  element,
  refresh(),
  destroy(),
}
```

`mountButtons()`:

- не добавляет listeners;
- не перехватывает click;
- не эмулирует Enter или Space;
- не меняет disabled;
- идемпотентен;
- после HTMX может быть вызван только для нового фрагмента.

```js
document.body.addEventListener("htmx:afterSwap", (event) => {
  mountButtons(event.detail.target);
});
```

Подключение runtime необязательно. Оно нужно только приложению, которое хочет
обрабатывать все компоненты через единый lifecycle-контракт.

## Theme

Глобальная тема:

```css
:root {
  --rui-color-primary: #7c3aed;
}
```

Только Button:

```css
.rui-button {
  --rui-button-radius: 999px;
  --rui-button-padding-x: 1.5rem;
}
```

Только primary Button:

```css
.rui-button[data-color="primary"] {
  --rui-button-bg: #0f766e;
}
```
