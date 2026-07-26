# Перевод `/docs` на RepUI Layout v2

## Подключение

В `<head>` после theme CSS:

```django
{% load static repui_layout %}

<link rel="stylesheet"
      href="{% static 'repui/layout/layout.css' %}">
```

Для управления разметкой из JS:

```django
<script type="module"
        src="{% static 'repui/layout/layout.js' %}"></script>
```

## Разметка `/docs`

```django
{% load repui_layout %}

{% container %}
  {% stack rows=20 %}

    {% container row=1 class_name="docs-header" %}
      <button
        type="button"
        id="sidebar-toggle"
        aria-controls="docs-sidebar"
        aria-expanded="true"
      >
        ☰
      </button>

      <strong>RepUI docs</strong>

      {% include "docs/partials/theme_mode_select.html" %}
    {% endcontainer %}

    {% container row=19 %}
      {% grid columns=5 id="docs-grid" %}

        {% container
          column=1
          id="docs-sidebar"
          class_name="docs-sidebar"
        %}
          Список компонентов
        {% endcontainer %}

        {% container
          column=4
          id="component-panel"
          class_name="docs-main"
        %}
          Выберите компонент слева.
        {% endcontainer %}

      {% endgrid %}
    {% endcontainer %}

  {% endstack %}
{% endcontainer %}
```

CSS `docs.css` должен отвечать только за оформление:

```css
.docs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 1.25rem;
  border-block-end: 1px solid var(--rui-color-border);
  background: var(--rui-color-surface);
}

.docs-sidebar {
  overflow: auto;
  padding: 1.25rem;
  border-inline-end: 1px solid var(--rui-color-border);
  background: var(--rui-color-surface);
}

.docs-main {
  overflow: auto;
  padding: 2rem;
  background: var(--rui-color-page);
}
```

Не вкладывайте `aside` и `main` с собственным фоном внутрь пустых Container.
Классы и id назначаются самому Container, чтобы область занимала всю высоту.

## Collapse sidebar

Создайте `docs-layout.js`:

```js
import {
  collapseSidebar,
} from "/static/repui/layout/layout.js";

const grid = document.querySelector("#docs-grid");
const sidebar = document.querySelector("#docs-sidebar");
const workspace = document.querySelector("#component-panel");
const button = document.querySelector("#sidebar-toggle");

button?.addEventListener("click", () => {
  const open = collapseSidebar({
    grid,
    sidebar,
    workspace,
    expandedColumns: 5,
    sidebarColumns: 1,
  });

  button.setAttribute("aria-expanded", String(open));
});
```

При скрытии:

```text
sidebar: hidden
workspace: column=5
```

При открытии:

```text
sidebar: column=1
workspace: column=4
```

## Прямое управление

```js
import {
  setColumns,
  setColumn,
  setRows,
  setRow,
  hide,
  show,
} from "/static/repui/layout/layout.js";

setColumns(grid, 8);
setColumn(workspace, 7);
hide(sidebar);

show(sidebar);
setColumn(sidebar, 2);
setColumn(workspace, 6);
```

Функции обновляют и понятные `data-*` атрибуты, и внутренние CSS variables.

## HTMX

Layout не монтируется и не размонтируется.

При удалении узла HTMX:

- listeners внутри Layout отсутствуют;
- таймеров нет;
- ссылок на элементы библиотека не хранит;
- cleanup не требуется.

Собственные listeners страницы, например кнопка sidebar, создавайте один раз на
неизменяемой оболочке `/docs`.
