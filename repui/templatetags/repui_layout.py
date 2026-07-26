from __future__ import annotations

from django import template
from django.template import Node, TemplateSyntaxError
from django.utils.html import conditional_escape
from django.utils.safestring import mark_safe

from repui.layout.attributes import layout_attributes, positive_int

register = template.Library()

_SPACING = {"none", "xs", "sm", "md", "lg"}
_SIZE_MODES = {"fill", "content"}


def _render_attrs(attrs: dict[str, object]) -> str:
    chunks: list[str] = []

    for name, value in attrs.items():
        if value is None or value is False:
            continue
        rendered = name if value is True else str(value)
        chunks.append(
            f' {conditional_escape(name)}="{conditional_escape(rendered)}"'
        )

    return "".join(chunks)


class LayoutNode(Node):
    def __init__(self, kind: str, nodelist, kwargs):
        self.kind = kind
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {
            name: expression.resolve(context)
            for name, expression in self.kwargs.items()
        }
        content = self.nodelist.render(context)

        attrs = dict(values.pop("attrs", {}) or {})
        classes = [f"rui-{self.kind}"]

        class_name = values.pop("class_name", None)
        if class_name:
            classes.append(str(class_name))

        element_id = values.pop("id", None)
        if element_id:
            attrs["id"] = element_id

        placement = layout_attributes(
            column=values.pop("column", None),
            row=values.pop("row", None),
        )
        attrs.update({k: v for k, v in placement.items() if k != "style"})
        style_parts = [placement.get("style", "")]

        if self.kind == "grid":
            columns = positive_int(
                values.pop("columns", 1),
                name="columns",
            )
            column_size = str(values.pop("column_size", "fill"))
            spacing = str(values.pop("spacing", "none"))

            if column_size not in _SIZE_MODES:
                raise TemplateSyntaxError(
                    "column_size must be fill or content"
                )
            if spacing not in _SPACING:
                raise TemplateSyntaxError(
                    "spacing must be none, xs, sm, md or lg"
                )

            attrs["data-columns"] = columns
            attrs["data-column-size"] = column_size
            attrs["data-spacing"] = spacing

            style_parts.extend((
                f"--rui-grid-columns:{columns}",
                "--rui-grid-column-size:"
                + (
                    "max-content"
                    if column_size == "content"
                    else "minmax(0,1fr)"
                ),
                f"--rui-layout-spacing:var(--rui-spacing-{spacing})",
            ))

        elif self.kind == "stack":
            rows = positive_int(
                values.pop("rows", 1),
                name="rows",
            )
            row_size = str(values.pop("row_size", "fill"))
            spacing = str(values.pop("spacing", "none"))

            if row_size not in _SIZE_MODES:
                raise TemplateSyntaxError(
                    "row_size must be fill or content"
                )
            if spacing not in _SPACING:
                raise TemplateSyntaxError(
                    "spacing must be none, xs, sm, md or lg"
                )

            attrs["data-rows"] = rows
            attrs["data-row-size"] = row_size
            attrs["data-spacing"] = spacing

            style_parts.extend((
                f"--rui-stack-rows:{rows}",
                "--rui-stack-row-size:"
                + (
                    "max-content"
                    if row_size == "content"
                    else "minmax(0,1fr)"
                ),
                f"--rui-layout-spacing:var(--rui-spacing-{spacing})",
            ))

        if values:
            unknown = ", ".join(sorted(values))
            raise TemplateSyntaxError(
                f"Unknown {self.kind} arguments: {unknown}"
            )

        styles = ";".join(part for part in style_parts if part)
        if styles:
            existing = str(attrs.get("style", "")).strip().rstrip(";")
            attrs["style"] = ";".join(
                part for part in (existing, styles) if part
            )

        attrs["class"] = " ".join(classes)

        return mark_safe(
            f"<div{_render_attrs(attrs)}>{content}</div>"
        )


def _parse(parser, token, *, kind: str, end_tag: str):
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
    return LayoutNode(kind, nodelist, kwargs)


@register.tag("container")
def container_tag(parser, token):
    return _parse(
        parser,
        token,
        kind="container",
        end_tag="endcontainer",
    )


@register.tag("grid")
def grid_tag(parser, token):
    return _parse(
        parser,
        token,
        kind="grid",
        end_tag="endgrid",
    )


@register.tag("stack")
def stack_tag(parser, token):
    return _parse(
        parser,
        token,
        kind="stack",
        end_tag="endstack",
    )
