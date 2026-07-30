from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.html import conditional_escape


class CodeBlockNode(Node):
    """Render escaped multiline source for the CodeBlock runtime."""

    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {
            key: expression.resolve(context)
            for key, expression in self.kwargs.items()
        }
        language = values.pop("language", "text")
        title = values.pop("title", None)
        copy = bool(values.pop("copy", True))
        width = values.pop("width", "full")
        height = values.pop("height", "md")
        class_name = values.pop("class_name", None)
        attrs = dict(values.pop("attrs", {}) or {})
        if values:
            raise TemplateSyntaxError(
                "Unknown code_block arguments: " + ", ".join(sorted(values))
            )
        content = self.nodelist.render(context).strip("\n")
        return render_to_string(
            "repui/components/code_block/code_block_tag.html",
            {
                "content": conditional_escape(content),
                "language": language,
                "title": title,
                "copy": copy,
                "width": width,
                "height": height,
                "class_name": class_name,
                "attrs": attrs,
            },
            request=context.get("request"),
        )


def _code_block(parser, token):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(
                "code_block arguments must use name=value"
            )
        key, value = bit.split("=", 1)
        kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse(("endcode_block",))
    parser.delete_first_token()
    return CodeBlockNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("code_block", _code_block)
