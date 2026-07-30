from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

register = template.Library()


class BlockNode(Node):
    def __init__(self, name, nodelist, kwargs):
        self.name, self.nodelist, self.kwargs = name, nodelist, kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        if self.name == "menubar_item" and not values.get("value"):
            raise TemplateSyntaxError("menubar_item requires value")
        values["content"] = self.nodelist.render(context).strip()
        return render_to_string(
            f"repui/components/menubar/{self.name}_tag.html",
            values,
            request=context.get("request"),
        )


def parse(parser, token, name, end):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(f"{name} arguments must use name=value")
        key, value = bit.split("=", 1)
        kwargs[key] = parser.compile_filter(value)
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
