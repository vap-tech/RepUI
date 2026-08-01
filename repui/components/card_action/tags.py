from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)

class NodeImpl(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        content = self.nodelist.render(context).strip()
        href = values.pop("href", None)
        disabled = resolve_bool(values.pop("disabled", False), name="disabled")
        attrs = dict(values.pop("attrs", {}) or {})
        class_name = values.pop("class_name", None)
        reject_unknown(values, set(), component="card_action")
        return render_to_string(
            "repui/components/card_action/card_action_tag.html",
            {"content": content, "href": href, "disabled": disabled, "attrs": attrs, "class_name": class_name},
            request=context.get("request"),
        )

def _tag(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endcard_action",))
    parser.delete_first_token()
    return NodeImpl(nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("card_action", _tag)
