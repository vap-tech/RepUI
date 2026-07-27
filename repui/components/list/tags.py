from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

_ALLOWED = {"ordered", "dense", "disable_padding", "class_name", "attrs"}


def _parse_kwargs(parser, token, tag_name):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(f"{tag_name} arguments must use name=value")
        name, expression = bit.split("=", 1)
        if name not in _ALLOWED:
            raise TemplateSyntaxError(f"Unknown {tag_name} argument: {name}")
        if name in kwargs:
            raise TemplateSyntaxError(f"Duplicate {tag_name} argument: {name}")
        kwargs[name] = parser.compile_filter(expression)
    return kwargs


class ListNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {name: value.resolve(context) for name, value in self.kwargs.items()}
        return render_to_string(
            "repui/components/list/list_tag.html",
            {"content": self.nodelist.render(context).strip(), **values},
            request=context.get("request"),
        )


def _list_tag(parser, token):
    kwargs = _parse_kwargs(parser, token, "list")
    nodelist = parser.parse(("endlist",))
    parser.delete_first_token()
    return ListNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("list", _list_tag)
