from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string


class BadgeNode(Node):
    """Render a small explicit status or count label."""

    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {
            key: expression.resolve(context)
            for key, expression in self.kwargs.items()
        }
        color = values.pop("color", "default")
        size = values.pop("size", "md")
        dot = bool(values.pop("dot", False))
        class_name = values.pop("class_name", None)
        attrs = dict(values.pop("attrs", {}) or {})
        if values:
            raise TemplateSyntaxError(
                "Unknown badge arguments: " + ", ".join(sorted(values))
            )
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
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("badge arguments must use name=value")
        key, value = bit.split("=", 1)
        kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endbadge",))
    parser.delete_first_token()
    return BadgeNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("badge", _badge)
