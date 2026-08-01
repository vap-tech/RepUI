from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)


class BlockNode(Node):
    def __init__(self, kind, nodelist, kwargs):
        self.kind, self.nodelist, self.kwargs = kind, nodelist, kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(
            values,
            {"label", "open", "multiple", "id", "class_name", "attrs"},
            component="accordion",
        )
        return render_to_string(
            f"repui/components/accordion/{self.kind}_tag.html",
            {"content": mark_safe(self.nodelist.render(context).strip()), **values},
            request=context.get("request"),
        )


def _parse(parser, token, kind, end_tag):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return BlockNode(kind, nodelist, kwargs)


def _accordion(parser, token):
    return _parse(parser, token, "accordion", "endaccordion")


def _accordion_item(parser, token):
    return _parse(parser, token, "accordion_item", "endaccordion_item")


def register_tags(library):
    library.tag("accordion", _accordion)
    library.tag("accordion_item", _accordion_item)
