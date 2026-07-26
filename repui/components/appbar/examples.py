from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Example:
    slug: str
    title: str
    description: str
    template: str


EXAMPLES = (
    Example(
        "attached",
        "Прикреплённый AppBar",
        "Всегда занимает всю ширину.",
r"""{% load repui %}
{% appbar position="attached" %}
  {% panel surface="appbar" width="full" %}
    ...
  {% endpanel %}
{% endappbar %}"""
    ),
    Example(
        "center",
        "Половина по центру",
        "Три части слева, шесть занимает AppBar, три справа.",
r"""{% load repui %}
{% appbar position="floating" left=3 span=6 right=3 %}
  {% panel surface="appbar" width="full" %}
    ...
  {% endpanel %}
{% endappbar %}"""
    ),
    Example(
        "asymmetric",
        "Смещённый AppBar",
        "Одна часть слева, шесть занимает AppBar, три справа.",
r"""{% load repui %}
{% appbar position="floating" left=1 span=6 right=3 %}
  {% panel surface="appbar" width="full" %}
    ...
  {% endpanel %}
{% endappbar %}"""
    ),
)
