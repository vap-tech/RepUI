from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Example:
    slug: str
    title: str
    description: str
    template: str


EXAMPLES = (
    Example(
        "app-shell",
        "Обычная страница приложения",
        "AppBar остаётся по содержимому, рабочая область занимает остаток.",
r"""{% load repui repui_layout %}
{% page %}
  {% appbar %}
    <strong>RepUI</strong>
  {% endappbar %}

  {% page_content %}
    {% grid columns=5 %}
      {% container column=1 %}
        {% panel width="full" height="full" %}
          Sidebar
        {% endpanel %}
      {% endcontainer %}

      {% container column=4 %}
        {% panel width="full" height="full" %}
          Workspace
        {% endpanel %}
      {% endcontainer %}
    {% endgrid %}
  {% endpage_content %}
{% endpage %}"""
    ),
    Example(
        "without-appbar",
        "Страница без AppBar",
        "PageContent занимает всю доступную высоту.",
r"""{% load repui %}
{% page %}
  {% page_content %}
    Основная область
  {% endpage_content %}
{% endpage %}"""
    ),
)
