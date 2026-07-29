from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string


_ALLOWED = {"title", "class_name", "attrs"}


class TooltipNode(Node):
    """Render a trigger and explicit tooltip content."""

    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {
            key: value.resolve(context)
            for key, value in self.kwargs.items()
        }
        unknown = set(values) - _ALLOWED
        if unknown:
            raise TemplateSyntaxError(
                "Unknown tooltip arguments: " + ", ".join(sorted(unknown))
            )
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
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("tooltip arguments must use name=value")
        name, value = bit.split("=", 1)
        kwargs[name] = parser.compile_filter(value)
    nodelist = parser.parse(("endtooltip",))
    parser.delete_first_token()
    return TooltipNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("tooltip", _tooltip)
