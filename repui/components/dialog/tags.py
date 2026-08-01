from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)


_ALLOWED = {"id", "open", "aria_label", "class_name", "attrs"}


def _parse(parser, token):
    values = compile_keyword_arguments(parser, token)
    reject_unknown(values, _ALLOWED, component="dialog")
    if "id" not in values:
        raise TemplateSyntaxError("dialog requires id")
    return values


class DialogNode(Node):
    def __init__(self, nodelist, values):
        self.nodelist = nodelist
        self.values = values

    def render(self, context):
        values = resolve_arguments(self.values, context)
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
