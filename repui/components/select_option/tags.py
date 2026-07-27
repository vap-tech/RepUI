from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

class SelectOptionNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        if "value" not in values:
            raise TemplateSyntaxError("select_option requires value")
        content = self.nodelist.render(context).strip()
        return render_to_string(
            "repui/components/select_option/select_option_tag.html",
            {"content": content, **values},
            request=context.get("request"),
        )

def _select_option(parser, token):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("select_option arguments must use name=value")
        key, value = bit.split("=", 1)
        kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endselect_option",))
    parser.delete_first_token()
    return SelectOptionNode(nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("select_option", _select_option)
