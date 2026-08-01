from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)

_ALLOWED = {
    "listbox": {"aria_label", "id", "class_name", "attrs"},
    "listbox_option": {"value", "selected", "disabled", "id", "class_name", "attrs"},
}


class Block(Node):
    def __init__(self, kind, nodelist, kwargs):
        self.kind, self.nodelist, self.kwargs = kind, nodelist, kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(values, _ALLOWED[self.kind], component=self.kind)
        for name in {"selected", "disabled"} & set(values):
            values[name] = resolve_bool(values[name], name=name)
        return render_to_string(
            f"repui/components/listbox/{self.kind}_tag.html",
            {"content": self.nodelist.render(context).strip(), **values},
            request=context.get("request"),
        )


def parse(parser, token, kind, end):
    kwargs = compile_keyword_arguments(parser, token)
    node_list = parser.parse((end,))
    parser.delete_first_token()
    return Block(kind, node_list, kwargs)


def register_tags(library):
    library.tag("listbox", lambda parser, token: parse(parser, token, "listbox", "endlistbox"))
    library.tag("listbox_option", lambda parser, token: parse(parser, token, "listbox_option", "endlistbox_option"))
