from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe


class PaginationNode(Node):
    def __init__(self, nodelist, kwargs): self.nodelist, self.kwargs = nodelist, kwargs
    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        unknown = set(values) - {"aria_label", "id", "class_name", "attrs"}
        if unknown: raise TemplateSyntaxError("Unknown pagination arguments: " + ", ".join(sorted(unknown)))
        return render_to_string("repui/components/pagination/pagination_tag.html", {
            "content": mark_safe(self.nodelist.render(context).strip()), **values,
        }, request=context.get("request"))


def _pagination(parser, token):
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit: raise TemplateSyntaxError("pagination arguments must use name=value")
        key, value = bit.split("=", 1); kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endpagination",)); parser.delete_first_token()
    return PaginationNode(nodelist, kwargs)


def register_tags(library): library.tag("pagination", _pagination)
