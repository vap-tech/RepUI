from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)

_ALLOWED = {"ordered", "dense", "disable_padding", "class_name", "attrs"}


def _parse_kwargs(parser, token, tag_name):
    kwargs = compile_keyword_arguments(parser, token)
    reject_unknown(kwargs, _ALLOWED, component=tag_name)
    return kwargs


class ListNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        for name in {"ordered", "dense", "disable_padding"} & set(values):
            values[name] = resolve_bool(values[name], name=name)
        return render_to_string(
            "repui/components/list/list_tag.html",
            {"content": self.nodelist.render(context).strip(), **values},
            request=context.get("request"),
        )


def _list_tag(parser, token):
    kwargs = _parse_kwargs(parser, token, "list")
    nodelist = parser.parse(("endlist",))
    parser.delete_first_token()
    return ListNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("list", _list_tag)
