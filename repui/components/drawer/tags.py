from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

_ALLOWED = {"id", "side", "variant", "open", "aria_label", "class_name", "attrs"}
_REQUIRED = {"id"}
_SIDES = {"left", "right"}
_VARIANTS = {"modal", "persistent"}


def _parse_kwargs(parser, token):
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("drawer arguments must use name=value")
        name, expression = bit.split("=", 1)
        if name not in _ALLOWED:
            raise TemplateSyntaxError(f"Unknown drawer argument: {name}")
        if name in kwargs:
            raise TemplateSyntaxError(f"Duplicate drawer argument: {name}")
        kwargs[name] = parser.compile_filter(expression)
    missing = _REQUIRED - kwargs.keys()
    if missing:
        raise TemplateSyntaxError("drawer requires id")
    return kwargs


def _validate(values):
    if not values.get("id"):
        raise TemplateSyntaxError("drawer.id cannot be empty")
    side = values.get("side", "left")
    if side not in _SIDES:
        raise TemplateSyntaxError("drawer.side must be left or right")
    variant = values.get("variant", "modal")
    if variant not in _VARIANTS:
        raise TemplateSyntaxError("drawer.variant must be modal or persistent")


class DrawerNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {name: value.resolve(context) for name, value in self.kwargs.items()}
        _validate(values)
        return render_to_string(
            "repui/components/drawer/drawer_tag.html",
            {"content": self.nodelist.render(context).strip(), **values},
            request=context.get("request"),
        )


def _drawer_tag(parser, token):
    kwargs = _parse_kwargs(parser, token)
    nodelist = parser.parse(("enddrawer",))
    parser.delete_first_token()
    return DrawerNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("drawer", _drawer_tag)
