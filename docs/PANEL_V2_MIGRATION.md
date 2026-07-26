# Переход на Panel v2.0

Изменение совместимо с существующими Panel.

Старый код:

```django
{% panel
  width="full"
  height="full"
  class_name="docs-sidebar"
%}
  ...
{% endpanel %}
```

продолжит работать и автоматически получит:

```html
data-surface="default"
```

## Sidebar

Добавьте назначение поверхности:

```django
{% panel
  surface="sidebar"
  width="full"
  height="full"
  id="docs-sidebar"
  class_name="docs-sidebar"
%}
  ...
{% endpanel %}
```

`docs-sidebar` оставьте для прикладных правил:

```css
.docs-sidebar {
  overflow: auto;
}
```

Фон, границу и прочее лучше задавать теме через:

```css
.rui-panel[data-surface="sidebar"] {
  --rui-panel-background: ...;
  --rui-panel-border: ...;
}
```

## Workspace

```django
{% panel
  surface="workspace"
  width="full"
  height="full"
  id="component-panel"
  class_name="docs-main"
%}
  ...
{% endpanel %}
```

Если тема не знает `workspace`, используются базовые токены Panel.

## AppBar

AppBar может размещать внутри себя Panel:

```django
{% appbar
  position="floating"
  width="two-thirds"
%}
  {% panel
    surface="appbar"
    width="full"
  %}
    ...
  {% endpanel %}
{% endappbar %}
```

AppBar отвечает за положение и размер. Panel отвечает за поверхность.
Тема решает, как выглядит `surface="appbar"`.

## HTMX

HTMX может заменить Panel целиком:

```html
<div
  id="component-panel"
  class="rui-panel"
  data-surface="card"
  data-width="full"
  data-height="full"
>
  ...
</div>
```

или только её содержимое через `hx-swap="innerHTML"`.

Panel не имеет JS, listeners, timers или mount/unmount.

## Пользовательская поверхность

В шаблоне:

```django
{% panel surface="admin-glass" %}
  ...
{% endpanel %}
```

В пользовательской теме:

```css
.rui-panel[data-surface="admin-glass"] {
  --rui-panel-background: rgb(20 24 32 / 0.8);
  --rui-panel-radius: var(--rui-radius-lg);
  --rui-panel-shadow: 0 1rem 3rem rgb(0 0 0 / 0.2);
  --rui-panel-backdrop-filter: blur(1rem);
}
```

Изменять Python-компонент или пересобирать RepUI не требуется.
