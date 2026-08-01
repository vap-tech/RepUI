from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)

_COMBOBOX_ALLOWED = {"name", "placeholder", "empty_text", "value", "disabled", "required", "id", "class_name", "attrs"}
_OPTION_ALLOWED = {"value", "keywords", "selected", "disabled", "id", "class_name", "attrs"}


class BlockNode(Node):
    def __init__(self, kind, nodelist, kwargs): self.kind, self.nodelist, self.kwargs = kind, nodelist, kwargs
    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        allowed = _COMBOBOX_ALLOWED if self.kind == "combobox" else _OPTION_ALLOWED
        reject_unknown(values, allowed, component=self.kind)
        for name in {"disabled", "required", "selected"} & set(values):
            values[name] = resolve_bool(values[name], name=name)
        return render_to_string(f"repui/components/combobox/{self.kind}_tag.html", {
            "content": mark_safe(self.nodelist.render(context).strip()), **values,
        }, request=context.get("request"))


def _parse(parser, token, kind, end):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse((end,)); parser.delete_first_token()
    return BlockNode(kind, nodelist, kwargs)


def register_tags(library):
    library.tag("combobox", lambda p, t: _parse(p, t, "combobox", "endcombobox"))
    library.tag("combobox_option", lambda p, t: _parse(p, t, "combobox_option", "endcombobox_option"))
