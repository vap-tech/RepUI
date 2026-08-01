from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)


class PaginationNode(Node):
    def __init__(self, nodelist, kwargs): self.nodelist, self.kwargs = nodelist, kwargs
    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(values, {"aria_label", "id", "class_name", "attrs"}, component="pagination")
        return render_to_string("repui/components/pagination/pagination_tag.html", {
            "content": mark_safe(self.nodelist.render(context).strip()), **values,
        }, request=context.get("request"))


def _pagination(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endpagination",)); parser.delete_first_token()
    return PaginationNode(nodelist, kwargs)


def register_tags(library): library.tag("pagination", _pagination)
