# Button

```django
{% load repui %}
{% button variant="filled" color="primary" size="md" href="/download/" %}
  Загрузить
{% endbutton %}
```

Без `href` рендерится `<button type="button">`.
С `href` рендерится `<a>`.

Variants: `filled`, `outlined`, `soft`, `text`.

Colors: `default`, `primary`, `secondary`, `success`, `warning`, `danger`.

Sizes: `xs`, `sm`, `md`, `lg`, `xl`.

Глобальная тема:

```css
:root { --rui-color-primary:#7c3aed; }
```

Только Button:

```css
.rui-button {
  --rui-button-radius:999px;
  --rui-button-padding-x:1.5rem;
}
```

Только primary Button:

```css
.rui-button[data-color="primary"] {
  --rui-button-bg:#0f766e;
}
```
