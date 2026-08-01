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
    "tabs": {"id", "activation", "orientation", "class_name", "attrs"},
    "tab_list": {"aria_label", "orientation", "class_name", "attrs"},
    "tab": {"panel", "selected", "disabled", "class_name", "attrs"},
    "tab_panel": {"id", "selected", "class_name", "attrs"},
}

class BlockNode(Node):
    def __init__(self, kind, nodelist, kwargs):
        self.kind = kind
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(values, _ALLOWED[self.kind], component=self.kind)
        for name in {"selected", "disabled"} & set(values):
            values[name] = resolve_bool(values[name], name=name)
        content = self.nodelist.render(context).strip()
        return render_to_string(
            f"repui/components/tabs/{self.kind}_tag.html",
            {"content": content, **values},
            request=context.get("request"),
        )

def _parse(parser, token, kind, end_tag):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return BlockNode(kind, nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("tabs", lambda p, t: _parse(p, t, "tabs", "endtabs"))
    library.tag("tab_list", lambda p, t: _parse(p, t, "tab_list", "endtab_list"))
    library.tag("tab", lambda p, t: _parse(p, t, "tab", "endtab"))
    library.tag("tab_panel", lambda p, t: _parse(p, t, "tab_panel", "endtab_panel"))
