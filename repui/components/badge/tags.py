from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)


class BadgeNode(Node):
    """Render a small explicit status or count label."""

    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(
            values,
            {"color", "size", "dot", "class_name", "attrs"},
            component="badge",
        )
        color = values.pop("color", "default")
        size = values.pop("size", "md")
        dot = resolve_bool(values.pop("dot", False), name="dot")
        class_name = values.pop("class_name", None)
        attrs = dict(values.pop("attrs", {}) or {})
        return render_to_string(
            "repui/components/badge/badge_tag.html",
            {
                "content": self.nodelist.render(context).strip(),
                "color": color,
                "size": size,
                "dot": dot,
                "class_name": class_name,
                "attrs": attrs,
            },
            request=context.get("request"),
        )


def _badge(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endbadge",))
    parser.delete_first_token()
    return BadgeNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("badge", _badge)
