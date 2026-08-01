from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.html import conditional_escape

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)


class CodeBlockNode(Node):
    """Render escaped multiline source for the CodeBlock runtime."""

    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        language = values.pop("language", "text")
        title = values.pop("title", None)
        copy = resolve_bool(values.pop("copy", True), name="copy")
        width = values.pop("width", "full")
        height = values.pop("height", "md")
        class_name = values.pop("class_name", None)
        attrs = dict(values.pop("attrs", {}) or {})
        reject_unknown(values, set(), component="code_block")
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
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endcode_block",))
    parser.delete_first_token()
    return CodeBlockNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("code_block", _code_block)
