# Panel в sidebar `/docs`

## Было

```django
{% container column=1 id="docs-sidebar" %}
  <aside class="docs-sidebar">
    ...
  </aside>
{% endcontainer %}
```

Внешний Container занимает всю колонку, но внутренний `aside` остаётся высотой
по содержимому.

## Стало

```django
{% load repui repui_layout %}

{% container column=1 %}
  {% panel
    width="full"
    height="full"
    id="docs-sidebar"
    class_name="docs-sidebar"
  %}
    <h1>RepUI</h1>
    <nav>...</nav>
  {% endpanel %}
{% endcontainer %}
```

Для рабочей области:

```django
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
```

HTMX меняет только содержимое Panel:

```django
<button
  hx-get="{% url 'docs:component-panel' component.name %}"
  hx-target="#component-panel"
  hx-swap="innerHTML"
>
  {{ component.title }}
</button>
```

Panel не имеет JavaScript, listeners, таймеров или mount/unmount lifecycle.

```css
.docs-sidebar {
  overflow: auto;
  padding: var(--rui-space-5);
}

.docs-main {
  overflow: auto;
  padding: clamp(1rem, 4vw, 3rem);
}
```

Panel намеренно не получает скругления, тень или декоративную рамку. Для этого
будет отдельный Card.

## Panel внутри Django template inheritance

Не оборачивайте переопределяемый `{% block %}` пользовательским block-tag в
базовом шаблоне. Django компилирует наследование отдельно, поэтому такая
конструкция ненадёжна:

```django
{% panel %}
  {% block sidebar %}{% endblock %}
{% endpanel %}
```

В базовом шаблоне оставляйте только точки расширения внутри Layout:

```django
{% container column=1 %}
  {% block sidebar %}{% endblock %}
{% endcontainer %}

{% container column=4 %}
  {% block workspace %}{% endblock %}
{% endcontainer %}
```

Panel размещается в дочернем шаблоне, который реализует эти блоки:

```django
{% block sidebar %}
  {% panel width="full" height="full" id="docs-sidebar" class_name="docs-sidebar" %}
    ...
  {% endpanel %}
{% endblock %}
```

Так Layout выделяет область, дочерний шаблон выбирает компонент, а Panel явно
заполняет выделенную область. HTMX-target можно оставлять на самой Panel.
