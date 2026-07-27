from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

class ChipNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        content = self.nodelist.render(context).strip()
        disabled = bool(values.pop("disabled", False))
        deletable = bool(values.pop("deletable", False))
        remove_on_delete = bool(values.pop("remove_on_delete", False))
        value = values.pop("value", None)
        attrs = dict(values.pop("attrs", {}) or {})
        class_name = values.pop("class_name", None)
        if values:
            raise TemplateSyntaxError("Unknown chip arguments: " + ", ".join(sorted(values)))
        return render_to_string(
            "repui/components/chip/chip_tag.html",
            {
                "content": content,
                "disabled": disabled,
                "deletable": deletable,
                "remove_on_delete": remove_on_delete,
                "value": value,
                "attrs": attrs,
                "class_name": class_name,
            },
            request=context.get("request"),
        )

def _chip(parser, token):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("chip arguments must use name=value")
        key, value = bit.split("=", 1)
        kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endchip",))
    parser.delete_first_token()
    return ChipNode(nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("chip", _chip)
