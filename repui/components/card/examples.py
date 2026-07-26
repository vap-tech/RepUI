from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Example:
    slug: str
    title: str
    description: str
    template: str


EXAMPLES = (
    Example(
        "simple",
        "Простой контент",
        "Card не требует секций.",
r"""{% load repui %}
{% card %}
  <h2>Hello World</h2>
  <p>Обычный HTML внутри Card.</p>
{% endcard %}"""
    ),
    Example(
        "structured",
        "Header, Body и Footer",
        "Все секции необязательные и создаются только явно.",
r"""{% load repui %}
{% card width="full" %}
  {% card_header %}
    <h2>Настройки</h2>
  {% endcard_header %}

  {% card_body %}
    Содержимое
  {% endcard_body %}

  {% card_footer %}
    {% button %}Сохранить{% endbutton %}
  {% endcard_footer %}
{% endcard %}"""
    ),
    Example(
        "scroll",
        "Прокручиваемый Body",
        "При наличии секций overflow=auto применяется к Body.",
r"""{% load repui %}
{% card height="full" overflow="auto" %}
  {% card_header %}
    <h2>Лог событий</h2>
  {% endcard_header %}

  {% card_body %}
    Длинное содержимое
  {% endcard_body %}

  {% card_footer %}
    Последнее обновление
  {% endcard_footer %}
{% endcard %}"""
    ),
    Example(
        "custom-surface",
        "Пользовательская поверхность",
        "Значение surface открыто для темы.",
r"""{% load repui %}
{% card surface="admin-glass" %}
  ...
{% endcard %}"""
    ),
)
