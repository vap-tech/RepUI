from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

class BlockNode(Node):
    def __init__(self, kind, nodelist, kwargs):
        self.kind = kind
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        content = self.nodelist.render(context).strip()
        return render_to_string(
            f"repui/components/tabs/{self.kind}_tag.html",
            {"content": content, **values},
            request=context.get("request"),
        )

def _parse(parser, token, kind, end_tag):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(f"{kind} arguments must use name=value")
        key, value = bit.split("=", 1)
        kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return BlockNode(kind, nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("tabs", lambda p, t: _parse(p, t, "tabs", "endtabs"))
    library.tag("tab_list", lambda p, t: _parse(p, t, "tab_list", "endtab_list"))
    library.tag("tab", lambda p, t: _parse(p, t, "tab", "endtab"))
    library.tag("tab_panel", lambda p, t: _parse(p, t, "tab_panel", "endtab_panel"))
