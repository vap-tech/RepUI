from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string


_ALLOWED = {"id", "open", "aria_label", "class_name", "attrs"}


def _parse(parser, token):
    values = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("dialog arguments must use name=value")
        name, expression = bit.split("=", 1)
        if name not in _ALLOWED:
            raise TemplateSyntaxError(f"Unknown dialog argument: {name}")
        if name in values:
            raise TemplateSyntaxError(f"Duplicate dialog argument: {name}")
        values[name] = parser.compile_filter(expression)
    if "id" not in values:
        raise TemplateSyntaxError("dialog requires id")
    return values


class DialogNode(Node):
    def __init__(self, nodelist, values):
        self.nodelist = nodelist
        self.values = values

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.values.items()}
        if not values.get("id"):
            raise TemplateSyntaxError("dialog.id cannot be empty")
        return render_to_string(
            "repui/components/dialog/dialog_tag.html",
            {"content": self.nodelist.render(context).strip(), **values},
            request=context.get("request"),
        )


def _dialog_tag(parser, token):
    values = _parse(parser, token)
    nodelist = parser.parse(("enddialog",))
    parser.delete_first_token()
    return DialogNode(nodelist, values)


def register_tags(library):
    library.tag("dialog", _dialog_tag)
