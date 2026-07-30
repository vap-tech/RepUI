from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe


class BlockNode(Node):
    def __init__(self, kind, nodelist, kwargs): self.kind, self.nodelist, self.kwargs = kind, nodelist, kwargs
    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        allowed = ({"name", "placeholder", "empty_text", "value", "disabled", "required", "id", "class_name", "attrs"}
                   if self.kind == "combobox" else {"value", "keywords", "selected", "disabled", "id", "class_name", "attrs"})
        unknown = set(values) - allowed
        if unknown: raise TemplateSyntaxError("Unknown combobox arguments: " + ", ".join(sorted(unknown)))
        return render_to_string(f"repui/components/combobox/{self.kind}_tag.html", {
            "content": mark_safe(self.nodelist.render(context).strip()), **values,
        }, request=context.get("request"))


def _parse(parser, token, kind, end):
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit: raise TemplateSyntaxError(f"{kind} arguments must use name=value")
        key, value = bit.split("=", 1); kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse((end,)); parser.delete_first_token()
    return BlockNode(kind, nodelist, kwargs)


def register_tags(library):
    library.tag("combobox", lambda p, t: _parse(p, t, "combobox", "endcombobox"))
    library.tag("combobox_option", lambda p, t: _parse(p, t, "combobox_option", "endcombobox_option"))
