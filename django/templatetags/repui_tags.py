"""Django template tags RepUI.

Модуль предоставляет безопасный HTML pass-through для arbitrary attributes
и block tags для компонентов со сложным вложенным content.
"""

from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.html import conditional_escape
from django.utils.safestring import mark_safe

from django import template

register = template.Library()

_RESERVED_PREFIXES = ("data-rui-",)
_RESERVED_NAMES = {"role", "aria-activedescendant", "aria-controls"}


def _attribute_name(name):
    """Преобразует Python-friendly имя kwarg в HTML attribute name."""
    name = "class" if name == "class_" else name
    return name.replace("_", "-")


def render_attrs(attrs):
    """Безопасно превращает произвольные kwargs в HTML attributes.

    ``class_`` становится ``class``, underscores заменяются дефисами,
    ``True`` рендерится как boolean attribute, а ``None`` и ``False``
    пропускаются. Служебные RepUI attributes нельзя перезаписать снаружи.
    """
    rendered = []
    for raw_name, value in attrs.items():
        name = _attribute_name(str(raw_name))
        if name in _RESERVED_NAMES or name.startswith(_RESERVED_PREFIXES):
            continue
        if value is None or value is False:
            continue
        if value is True:
            rendered.append(name)
        else:
            rendered.append(f'{name}="{conditional_escape(value)}"')
    return mark_safe(" ".join(rendered))


@register.inclusion_tag("card.html", takes_context=True)
def repui_card(context, title=None, description=None, **kwargs):
    """Рендерит простой Card с arbitrary HTML attributes.

    Поддерживает вызов вида ``{% repui_card title="..." hx_get="..." %}``.
    Для вложенного body используйте ``repui_card_block``.
    """
    return {
        "title": title,
        "description": description,
        "html_attrs": render_attrs(kwargs),
        "request": context.get("request"),
    }


class RepUIComboboxNode(Node):
    """Рендерит Combobox block tag и передаёт body как options content."""

    def __init__(self, values, nodelist):
        """Сохраняет compiled kwargs и вложенный template nodelist."""
        self.values = values
        self.nodelist = nodelist

    def render(self, context):
        """Разрешает kwargs, рендерит body и собирает Combobox template."""
        values = {key: value.resolve(context) for key, value in self.values.items()}
        body = self.nodelist.render(context)
        known = {"name", "value", "selected_label", "placeholder", "empty_text"}
        attrs = {key: value for key, value in values.items() if key not in known}
        return mark_safe(
            render_to_string(
                "combobox_block.html",
                {
                    "name": values.get("name", ""),
                    "value": values.get("value", ""),
                    "selected_label": values.get("selected_label", ""),
                    "placeholder": values.get("placeholder", "Начните вводить…"),
                    "empty_text": values.get("empty_text", "Ничего не найдено"),
                    "html_attrs": render_attrs(attrs),
                    "body_html": mark_safe(body),
                },
                request=context.get("request"),
            )
        )


@register.tag("repui_combobox")
def repui_combobox(parser, token):
    """Парсит ``repui_combobox ...`` до парного end tag."""
    bits = token.split_contents()
    values = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("repui_combobox arguments must use key=value")
        key, value = bit.split("=", 1)
        values[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endrepui_combobox",))
    parser.delete_first_token()
    return RepUIComboboxNode(values, nodelist)


class RepUICardNode(Node):
    """Рендерит Card block tag с arbitrary attributes и вложенным body."""

    def __init__(self, values, nodelist):
        """Сохраняет compiled kwargs и вложенный template nodelist."""
        self.values = values
        self.nodelist = nodelist

    def render(self, context):
        """Разрешает kwargs и передаёт отрендеренный body в Card template."""
        values = {key: value.resolve(context) for key, value in self.values.items()}
        body = self.nodelist.render(context)
        title = values.pop("title", None)
        description = values.pop("description", None)
        return render_to_string(
            "card.html",
            {
                "title": title,
                "description": description,
                "html_attrs": render_attrs(values),
                "body": mark_safe(body),
            },
            request=context.get("request"),
        )


@register.tag("repui_card_block")
def repui_card_block(parser, token):
    """Парсит ``repui_card_block ...`` до парного end tag."""
    bits = token.split_contents()
    values = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("repui_card_block arguments must use key=value")
        key, value = bit.split("=", 1)
        values[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endrepui_card_block",))
    parser.delete_first_token()
    return RepUICardNode(values, nodelist)
