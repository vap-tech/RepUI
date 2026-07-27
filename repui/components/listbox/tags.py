from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string


class Block(Node):
    def __init__(self, kind, nodelist, kwargs):
        self.kind, self.nodelist, self.kwargs = kind, nodelist, kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        return render_to_string(
            f"repui/components/listbox/{self.kind}_tag.html",
            {"content": self.nodelist.render(context).strip(), **values},
            request=context.get("request"),
        )


def parse(parser, token, kind, end):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(f"{kind} arguments must use name=value")
        key, value = bit.split("=", 1)
        kwargs[key] = parser.compile_filter(value)
    node_list = parser.parse((end,))
    parser.delete_first_token()
    return Block(kind, node_list, kwargs)


def register_tags(library):
    library.tag("listbox", lambda parser, token: parse(parser, token, "listbox", "endlistbox"))
    library.tag("listbox_option", lambda parser, token: parse(parser, token, "listbox_option", "endlistbox_option"))
