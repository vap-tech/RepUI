from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)


class DropdownMenuNode(Node):
    def __init__(self, nodelist, kwargs): self.nodelist, self.kwargs = nodelist, kwargs
    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(values, {"id", "class_name", "attrs"}, component="dropdown_menu")
        if not values.get("id"): raise TemplateSyntaxError("dropdown_menu requires id")
        return render_to_string("repui/components/dropdown_menu/dropdown_menu_tag.html", {
            "content": mark_safe(self.nodelist.render(context).strip()), **values,
        }, request=context.get("request"))


def _dropdown_menu(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("enddropdown_menu",)); parser.delete_first_token()
    return DropdownMenuNode(nodelist, kwargs)


def register_tags(library): library.tag("dropdown_menu", _dropdown_menu)
