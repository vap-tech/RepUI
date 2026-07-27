from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

class NodeImpl(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        content = self.nodelist.render(context).strip()
        href = values.pop("href", None)
        disabled = bool(values.pop("disabled", False))
        attrs = dict(values.pop("attrs", {}) or {})
        class_name = values.pop("class_name", None)
        if values:
            raise TemplateSyntaxError("Unknown card_action arguments: " + ", ".join(sorted(values)))
        return render_to_string(
            "repui/components/card_action/card_action_tag.html",
            {"content": content, "href": href, "disabled": disabled, "attrs": attrs, "class_name": class_name},
            request=context.get("request"),
        )

def _tag(parser, token):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("card_action arguments must use name=value")
        key, value = bit.split("=", 1)
        kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endcard_action",))
    parser.delete_first_token()
    return NodeImpl(nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("card_action", _tag)
