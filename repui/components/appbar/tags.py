from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)

_ALLOWED_BEHAVIORS = {"static", "sticky"}

class AppBarNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        behavior = str(values.pop("behavior", "static"))
        surface = str(values.pop("surface", "default")).strip()
        if behavior not in _ALLOWED_BEHAVIORS:
            raise TemplateSyntaxError("appbar behavior must be static or sticky")
        if not surface:
            raise TemplateSyntaxError("appbar surface must not be empty")
        attrs = dict(values.pop("attrs", {}) or {})
        class_name = values.pop("class_name", None)
        element_id = values.pop("id", None)
        if element_id:
            attrs["id"] = element_id
        reject_unknown(values, set(), component="appbar")
        return render_to_string(
            "repui/components/appbar/appbar.html",
            {"content": self.nodelist.render(context), "behavior": behavior, "surface": surface, "class_name": class_name, "attrs": attrs},
            request=context.get("request"),
        )

def _appbar(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endappbar",)); parser.delete_first_token()
    return AppBarNode(nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("appbar", _appbar)
