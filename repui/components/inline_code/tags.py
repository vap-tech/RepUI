from django import template
from django.template import Node
from django.template.loader import render_to_string
from django.utils.html import conditional_escape


class InlineCodeNode(Node):
    """Render escaped inline code without accepting arbitrary HTML."""

    def __init__(self, nodelist):
        self.nodelist = nodelist

    def render(self, context):
        content = conditional_escape(self.nodelist.render(context).strip())
        return render_to_string(
            "repui/components/inline_code/inline_code_tag.html",
            {"content": content},
            request=context.get("request"),
        )


def _inline_code(parser, token):
    nodelist = parser.parse(("endinline_code",))
    parser.delete_first_token()
    return InlineCodeNode(nodelist)


def register_tags(library: template.Library):
    library.tag("inline_code", _inline_code)
