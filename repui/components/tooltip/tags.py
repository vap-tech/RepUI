from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)


_ALLOWED = {"title", "class_name", "attrs"}


class TooltipNode(Node):
    """Render a trigger and explicit tooltip content."""

    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(values, _ALLOWED, component="tooltip")
        title = str(values.get("title", "")).strip()
        if not title:
            raise TemplateSyntaxError("tooltip.title cannot be empty")
        return render_to_string(
            "repui/components/tooltip/tooltip_tag.html",
            {
                "title": title,
                "content": self.nodelist.render(context).strip(),
                "class_name": values.get("class_name"),
                "attrs": values.get("attrs", {}),
            },
            request=context.get("request"),
        )


def _tooltip(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endtooltip",))
    parser.delete_first_token()
    return TooltipNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("tooltip", _tooltip)
