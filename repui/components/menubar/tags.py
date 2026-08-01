from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)

register = template.Library()

_ALLOWED = {
    "menubar": {"label", "class_name", "attrs"},
    "menubar_item": {"value", "label", "class_name", "attrs"},
}


class BlockNode(Node):
    def __init__(self, name, nodelist, kwargs):
        self.name, self.nodelist, self.kwargs = name, nodelist, kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(values, _ALLOWED[self.name], component=self.name)
        if self.name == "menubar_item" and not values.get("value"):
            raise TemplateSyntaxError("menubar_item requires value")
        values["content"] = self.nodelist.render(context).strip()
        return render_to_string(
            f"repui/components/menubar/{self.name}_tag.html",
            values,
            request=context.get("request"),
        )


def parse(parser, token, name, end):
    kwargs = compile_keyword_arguments(parser, token)
    nodes = parser.parse((end,))
    parser.delete_first_token()
    return BlockNode(name, nodes, kwargs)


@register.tag("menubar")
def menubar(parser, token):
    return parse(parser, token, "menubar", "endmenubar")


@register.tag("menubar_item")
def menubar_item(parser, token):
    return parse(parser, token, "menubar_item", "endmenubar_item")


def register_tags(library):
    library.tag("menubar", menubar)
    library.tag("menubar_item", menubar_item)
