from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)


class SearchNode(Node):
    def __init__(self, nodelist, kwargs): self.nodelist, self.kwargs = nodelist, kwargs
    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(values, {"action", "method", "name", "placeholder", "value", "aria_label", "id", "class_name", "attrs"}, component="search")
        return render_to_string("repui/components/search/search_tag.html", {
            "content": mark_safe(self.nodelist.render(context).strip()), **values,
        }, request=context.get("request"))


def _search(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endsearch",)); parser.delete_first_token()
    return SearchNode(nodelist, kwargs)


def register_tags(library): library.tag("search", _search)
