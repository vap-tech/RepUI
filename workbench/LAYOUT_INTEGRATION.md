# Перевод `/docs` на RepUI Layout

## Подключение

```django
{% load static repui_layout %}
<link rel="stylesheet" href="{% static 'repui/layout/layout.css' %}">
```

## Разметка

```django
{% container %}
  {% stack rows=20 %}

    {% container row=1 %}
      <header class="docs-header">...</header>
    {% endcontainer %}

    {% container row=19 %}
      {% grid columns=5 %}

        {% container column=1 %}
          <aside class="docs-sidebar">
            Существующий список компонентов
          </aside>
        {% endcontainer %}

        {% container column=4 %}
          <main
            id="component-panel"
            class="docs-main"
            aria-live="polite"
          >
            Выберите компонент
          </main>
        {% endcontainer %}

      {% endgrid %}
    {% endcontainer %}

  {% endstack %}
{% endcontainer %}
```

HTMX оставьте как есть:

```django
<button
  hx-get="..."
  hx-target="#component-panel"
  hx-swap="innerHTML"
>
  Button
</button>
```

Layout не имеет JavaScript. После swap ничего монтировать не требуется.

Из старого CSS удалите только управление основной сеткой (`display: grid`, `grid-template-columns`). Цвета, padding, borders и typography оставьте.

Для высоты страницы:

```css
html,
body {
  min-height: 100%;
}
```
