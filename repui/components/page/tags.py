from __future__ import annotations

from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)

_ALLOWED_ARGUMENTS = {"id", "class_name", "attrs"}


class PageNode(Node):
    def __init__(self, kind, nodelist, kwargs):
        self.kind = kind
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        reject_unknown(values, _ALLOWED_ARGUMENTS, component=self.kind)

        attrs = dict(values.get("attrs") or {})
        element_id = values.get("id")
        class_name = values.get("class_name")

        if element_id:
            attrs["id"] = element_id

        return render_to_string(
            f"repui/components/page/{self.kind}.html",
            {
                "content": self.nodelist.render(context),
                "class_name": class_name,
                "attrs": attrs,
            },
            request=context.get("request"),
        )


def _parse(parser, token, *, kind, end_tag):
    kwargs = compile_keyword_arguments(parser, token)

    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return PageNode(kind, nodelist, kwargs)


def _page(parser, token):
    return _parse(
        parser,
        token,
        kind="page",
        end_tag="endpage",
    )


def _page_content(parser, token):
    return _parse(
        parser,
        token,
        kind="page_content",
        end_tag="endpage_content",
    )


def _page_sidebar(parser, token):
    return _parse(
        parser,
        token,
        kind="page_sidebar",
        end_tag="endpage_sidebar",
    )


def _page_body(parser, token):
    return _parse(
        parser,
        token,
        kind="page_body",
        end_tag="endpage_body",
    )


def register_tags(library: template.Library):
    library.tag("page", _page)
    library.tag("page_content", _page_content)
    library.tag("page_sidebar", _page_sidebar)
    library.tag("page_body", _page_body)
