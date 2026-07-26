from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Example:
    slug: str
    title: str
    description: str
    template: str


EXAMPLES = (
    Example(
        "default",
        "Обычная Panel",
        "Поверхность default, размер по содержимому.",
r"""{% load repui %}
{% panel %}
  Обычная поверхность
{% endpanel %}"""
    ),
    Example(
        "sidebar",
        "Sidebar surface",
        "Полная рабочая область sidebar.",
r"""{% load repui %}
{% panel
  surface="sidebar"
  width="full"
  height="full"
%}
  ...
{% endpanel %}"""
    ),
    Example(
        "custom",
        "Пользовательская поверхность",
        "Любая тема может определить собственное значение surface.",
r"""{% load repui %}
{% panel surface="admin-glass" %}
  ...
{% endpanel %}"""
    ),
)
