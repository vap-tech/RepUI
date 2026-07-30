from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe


class DropdownMenuNode(Node):
    def __init__(self, nodelist, kwargs): self.nodelist, self.kwargs = nodelist, kwargs
    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        unknown = set(values) - {"id", "class_name", "attrs"}
        if unknown: raise TemplateSyntaxError("Unknown dropdown_menu arguments: " + ", ".join(sorted(unknown)))
        if not values.get("id"): raise TemplateSyntaxError("dropdown_menu requires id")
        return render_to_string("repui/components/dropdown_menu/dropdown_menu_tag.html", {
            "content": mark_safe(self.nodelist.render(context).strip()), **values,
        }, request=context.get("request"))


def _dropdown_menu(parser, token):
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit: raise TemplateSyntaxError("dropdown_menu arguments must use name=value")
        key, value = bit.split("=", 1); kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse(("enddropdown_menu",)); parser.delete_first_token()
    return DropdownMenuNode(nodelist, kwargs)


def register_tags(library): library.tag("dropdown_menu", _dropdown_menu)
