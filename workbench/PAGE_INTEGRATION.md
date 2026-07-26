# Перевод `/docs` на Page

Page заменяет искусственное деление экрана через:

```django
{% stack rows=20 %}
  ...
{% endstack %}
```

Для обычной страницы приложения пропорциональные строки не нужны.

## Базовый шаблон

```django
{% load repui repui_layout %}

{% page id="docs-page" %}
  {% block appbar %}{% endblock %}
  {% block page_content %}{% endblock %}
{% endpage %}
```

Не оборачивайте переопределяемый `{% block %}` пользовательским block-tag.
Компоненты размещайте целиком в дочернем шаблоне.

## `workbench.html`

```django
{% block appbar %}
  {% appbar
    id="docs-appbar"
    position="attached"
    width="full"
  %}
    <a href="/docs/" class="docs-brand">RepUI docs</a>
    {% include "docs/partials/theme_mode_select.html" %}
  {% endappbar %}
{% endblock %}

{% block page_content %}
  {% page_content %}
    {% grid columns=5 id="docs-grid" %}

      {% container column=1 %}
        {% panel
          width="full"
          height="full"
          id="docs-sidebar"
          class_name="docs-sidebar"
        %}
          ...
        {% endpanel %}
      {% endcontainer %}

      {% container column=4 %}
        {% panel
          width="full"
          height="full"
          id="component-panel"
          class_name="docs-main"
        %}
          Выберите компонент слева.
        {% endpanel %}
      {% endcontainer %}

    {% endgrid %}
  {% endpage_content %}
{% endblock %}
```

## Что удалить

Удалите shell-разметку:

```django
{% stack rows=20 %}
{% container row=2 %}
{% container row=18 %}
```

И локальный CSS вида:

```css
body > .rui-container {
  display: flex;
  flex-direction: column;
}
```

Теперь этим занимается Page.

## Прокрутка

Page не навязывает `overflow`. Укажите его на реальных рабочих областях:

```css
.docs-sidebar,
.docs-main {
  overflow: auto;
}
```

Так AppBar остаётся на месте, а sidebar и workspace прокручиваются независимо.

## AppBar floating

Page не зависит от состояния AppBar. При смене:

```html
data-position="attached"
```

на:

```html
data-position="floating"
```

AppBar сохраняет естественную высоту, а PageContent автоматически получает
оставшееся пространство.
