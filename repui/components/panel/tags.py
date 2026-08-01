from __future__ import annotations

from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.layout import layout_attributes
from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)

_ALLOWED_SIZES = {"content", "full"}


class PanelNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)

        surface = str(values.pop("surface", "default")).strip()
        width = str(values.pop("width", "content"))
        height = str(values.pop("height", "content"))

        if not surface:
            raise TemplateSyntaxError(
                "panel surface must not be empty"
            )

        if width not in _ALLOWED_SIZES:
            raise TemplateSyntaxError(
                "panel width must be content or full"
            )

        if height not in _ALLOWED_SIZES:
            raise TemplateSyntaxError(
                "panel height must be content or full"
            )

        attrs = dict(values.pop("attrs", {}) or {})
        class_name = values.pop("class_name", None)
        element_id = values.pop("id", None)
        column = values.pop("column", None)
        row = values.pop("row", None)

        if element_id:
            attrs["id"] = element_id

        layout_attrs = {}
        if column is not None or row is not None:
            layout_attrs = layout_attributes(
                column=column,
                row=row,
            )

        reject_unknown(values, set(), component="panel")

        return render_to_string(
            "repui/components/panel/panel.html",
            {
                "content": self.nodelist.render(context),
                "surface": surface,
                "width": width,
                "height": height,
                "class_name": class_name,
                "attrs": attrs,
                "layout_attrs": layout_attrs,
            },
            request=context.get("request"),
        )


def _panel(parser, token):
    kwargs = compile_keyword_arguments(parser, token)

    nodelist = parser.parse(("endpanel",))
    parser.delete_first_token()
    return PanelNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("panel", _panel)
