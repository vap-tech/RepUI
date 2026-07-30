from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe


class PopoverNode(Node):
    def __init__(self, nodelist, kwargs): self.nodelist, self.kwargs = nodelist, kwargs
    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        allowed = {"label", "id", "class_name", "attrs"}
        unknown = set(values) - allowed
        if unknown: raise TemplateSyntaxError("Unknown popover arguments: " + ", ".join(sorted(unknown)))
        return render_to_string("repui/components/popover/popover_tag.html", {
            "content": mark_safe(self.nodelist.render(context).strip()), **values,
        }, request=context.get("request"))


def _popover(parser, token):
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit: raise TemplateSyntaxError("popover arguments must use name=value")
        key, value = bit.split("=", 1)
        kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endpopover",)); parser.delete_first_token()
    return PopoverNode(nodelist, kwargs)


def register_tags(library): library.tag("popover", _popover)
