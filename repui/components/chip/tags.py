from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)

class ChipNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(
            values,
            {"disabled", "deletable", "remove_on_delete", "value", "attrs", "class_name"},
            component="chip",
        )
        content = self.nodelist.render(context).strip()
        disabled = resolve_bool(values.pop("disabled", False), name="disabled")
        deletable = resolve_bool(values.pop("deletable", False), name="deletable")
        remove_on_delete = resolve_bool(
            values.pop("remove_on_delete", False),
            name="remove_on_delete",
        )
        value = values.pop("value", None)
        attrs = dict(values.pop("attrs", {}) or {})
        class_name = values.pop("class_name", None)
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
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endchip",))
    parser.delete_first_token()
    return ChipNode(nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("chip", _chip)
