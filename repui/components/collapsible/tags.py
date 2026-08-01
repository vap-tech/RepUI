from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)


_ALLOWED = {"label", "open", "id", "class_name", "attrs"}


class CollapsibleNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(values, _ALLOWED, component="collapsible")
        attrs = dict(values.get("attrs") or {})
        return render_to_string(
            "repui/components/collapsible/collapsible_tag.html",
            {
                "content": mark_safe(self.nodelist.render(context).strip()),
                "label": values.get("label", "Подробнее"),
                "open": resolve_bool(values.get("open", False), name="open"),
                "id": values.get("id"),
                "class_name": values.get("class_name"),
                "attrs": attrs,
            },
            request=context.get("request"),
        )


def _collapsible(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endcollapsible",))
    parser.delete_first_token()
    return CollapsibleNode(nodelist, kwargs)


def register_tags(library):
    library.tag("collapsible", _collapsible)
