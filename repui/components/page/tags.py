from __future__ import annotations

from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

_ALLOWED_ARGUMENTS = {"id", "class_name", "attrs"}


class PageNode(Node):
    def __init__(self, kind, nodelist, kwargs):
        self.kind = kind
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {
            name: expression.resolve(context)
            for name, expression in self.kwargs.items()
        }

        unknown = set(values) - _ALLOWED_ARGUMENTS
        if unknown:
            names = ", ".join(sorted(unknown))
            raise TemplateSyntaxError(
                f"Unknown {self.kind} arguments: {names}"
            )

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
    bits = token.split_contents()
    kwargs = {}

    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(
                f"{kind} arguments must use name=value"
            )
        name, value = bit.split("=", 1)
        kwargs[name] = parser.compile_filter(value)

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
