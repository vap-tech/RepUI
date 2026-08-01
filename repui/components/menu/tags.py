from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    resolve_arguments,
)

class BlockNode(Node):
    def __init__(self, kind, nodelist, kwargs):
        self.kind = kind
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        content = self.nodelist.render(context).strip()
        return render_to_string(
            f"repui/components/menu/{self.kind}_tag.html",
            {"content": content, **values},
            request=context.get("request"),
        )

def _parse(parser, token, kind, end_tag):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return BlockNode(kind, nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("menu", lambda p, t: _parse(p, t, "menu", "endmenu"))
    library.tag("menu_item", lambda p, t: _parse(p, t, "menu_item", "endmenu_item"))
