from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)


class ToastNode(Node):
    def __init__(self, values, nodelist):
        self.values, self.nodelist = values, nodelist

    def render(self, context):
        values = resolve_arguments(self.values, context)
        reject_unknown(
            values,
            {"title", "description", "duration"},
            component="toast",
        )
        return render_to_string(
            "repui/components/toast/toast.html",
            {**values, "content": self.nodelist.render(context).strip()},
            request=context.get("request"),
        )


def _toast(parser, token):
    values = compile_keyword_arguments(parser, token)
    node_list = parser.parse(("endtoast",))
    parser.delete_first_token()
    return ToastNode(values, node_list)


def register_tags(library):
    library.tag("toast", _toast)
