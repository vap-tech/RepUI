from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe


class BlockNode(Node):
    def __init__(self, kind, nodelist, kwargs):
        self.kind, self.nodelist, self.kwargs = kind, nodelist, kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        allowed = {"label", "open", "multiple", "id", "class_name", "attrs"}
        unknown = set(values) - allowed
        if unknown:
            raise TemplateSyntaxError("Unknown accordion arguments: " + ", ".join(sorted(unknown)))
        return render_to_string(
            f"repui/components/accordion/{self.kind}_tag.html",
            {"content": mark_safe(self.nodelist.render(context).strip()), **values},
            request=context.get("request"),
        )


def _parse(parser, token, kind, end_tag):
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(f"{kind} arguments must use name=value")
        key, value = bit.split("=", 1)
        if key in kwargs:
            raise TemplateSyntaxError(f"Duplicate {kind} argument: {key}")
        kwargs[key] = parser.compile_filter(value)
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return BlockNode(kind, nodelist, kwargs)


def _accordion(parser, token):
    return _parse(parser, token, "accordion", "endaccordion")


def _accordion_item(parser, token):
    return _parse(parser, token, "accordion_item", "endaccordion_item")


def register_tags(library):
    library.tag("accordion", _accordion)
    library.tag("accordion_item", _accordion_item)
