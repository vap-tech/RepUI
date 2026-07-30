from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string


_ALLOWED = {"label", "open", "id", "class_name", "attrs"}


class CollapsibleNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {key: expression.resolve(context) for key, expression in self.kwargs.items()}
        unknown = set(values) - _ALLOWED
        if unknown:
            raise TemplateSyntaxError(
                "Unknown collapsible arguments: " + ", ".join(sorted(unknown))
            )
        attrs = dict(values.get("attrs") or {})
        return render_to_string(
            "repui/components/collapsible/collapsible_tag.html",
            {
                "content": self.nodelist.render(context).strip(),
                "label": values.get("label", "Подробнее"),
                "open": bool(values.get("open", False)),
                "id": values.get("id"),
                "class_name": values.get("class_name"),
                "attrs": attrs,
            },
            request=context.get("request"),
        )


def _collapsible(parser, token):
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("collapsible arguments must use name=value")
        key, value = bit.split("=", 1)
        if key in kwargs:
            raise TemplateSyntaxError(f"Duplicate collapsible argument: {key}")
        kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endcollapsible",))
    parser.delete_first_token()
    return CollapsibleNode(nodelist, kwargs)


def register_tags(library):
    library.tag("collapsible", _collapsible)
