from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string


class ToastNode(Node):
    def __init__(self, values, nodelist):
        self.values, self.nodelist = values, nodelist

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.values.items()}
        return render_to_string(
            "repui/components/toast/toast.html",
            {**values, "content": self.nodelist.render(context).strip()},
            request=context.get("request"),
        )


def _toast(parser, token):
    values = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("toast arguments must use name=value")
        key, value = bit.split("=", 1)
        if key not in {"title", "description", "duration"}:
            raise TemplateSyntaxError(f"Unknown toast argument: {key}")
        values[key] = parser.compile_filter(value)
    node_list = parser.parse(("endtoast",))
    parser.delete_first_token()
    return ToastNode(values, node_list)


def register_tags(library):
    library.tag("toast", _toast)
