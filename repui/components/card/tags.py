from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from django import template
from django.template import Context, Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.layout import layout_attributes


_ALLOWED_SIZES = {"content", "full"}
_ALLOWED_OVERFLOW = {"visible", "auto", "hidden"}
_ALLOWED_CARD_ARGUMENTS = {
    "surface",
    "width",
    "height",
    "overflow",
    "id",
    "class_name",
    "attrs",
    "column",
    "row",
}
_ALLOWED_SECTION_ARGUMENTS = {
    "id",
    "class_name",
    "attrs",
}


@dataclass(slots=True)
class CardRenderState:
    has_header: bool = False
    has_body: bool = False
    has_footer: bool = False

    @property
    def has_sections(self) -> bool:
        return self.has_header or self.has_body or self.has_footer


class CardNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context: Context) -> str:
        values = {
            name: expression.resolve(context)
            for name, expression in self.kwargs.items()
        }

        unknown = set(values) - _ALLOWED_CARD_ARGUMENTS
        if unknown:
            names = ", ".join(sorted(unknown))
            raise TemplateSyntaxError(
                f"Unknown card arguments: {names}"
            )

        surface = str(values.pop("surface", "card")).strip()
        width = str(values.pop("width", "content"))
        height = str(values.pop("height", "content"))
        overflow = str(values.pop("overflow", "visible"))

        if not surface:
            raise TemplateSyntaxError(
                "card surface must not be empty"
            )

        if width not in _ALLOWED_SIZES:
            raise TemplateSyntaxError(
                "card width must be content or full"
            )

        if height not in _ALLOWED_SIZES:
            raise TemplateSyntaxError(
                "card height must be content or full"
            )

        if overflow not in _ALLOWED_OVERFLOW:
            raise TemplateSyntaxError(
                "card overflow must be visible, auto or hidden"
            )

        attrs = dict(values.pop("attrs", {}) or {})
        class_name = values.pop("class_name", None)
        element_id = values.pop("id", None)
        column = values.pop("column", None)
        row = values.pop("row", None)

        if element_id:
            attrs["id"] = element_id

        layout_attrs: dict[str, Any] = {}
        if column is not None or row is not None:
            layout_attrs = layout_attributes(
                column=column,
                row=row,
            )

        state = CardRenderState()

        context.push()
        try:
            context["__repui_card_state"] = state
            content = self.nodelist.render(context)
        finally:
            context.pop()

        return render_to_string(
            "repui/components/card/card.html",
            {
                "content": content,
                "surface": surface,
                "width": width,
                "height": height,
                "overflow": overflow,
                "has_sections": state.has_sections,
                "has_header": state.has_header,
                "has_body": state.has_body,
                "has_footer": state.has_footer,
                "class_name": class_name,
                "attrs": attrs,
                "layout_attrs": layout_attrs,
            },
            request=context.get("request"),
        )


class CardSectionNode(Node):
    def __init__(self, section, nodelist, kwargs):
        self.section = section
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context: Context) -> str:
        state = context.get("__repui_card_state")

        if not isinstance(state, CardRenderState):
            raise TemplateSyntaxError(
                f"card_{self.section} must be used inside card"
            )

        values = {
            name: expression.resolve(context)
            for name, expression in self.kwargs.items()
        }

        unknown = set(values) - _ALLOWED_SECTION_ARGUMENTS
        if unknown:
            names = ", ".join(sorted(unknown))
            raise TemplateSyntaxError(
                f"Unknown card_{self.section} arguments: {names}"
            )

        attrs = dict(values.pop("attrs", {}) or {})
        class_name = values.pop("class_name", None)
        element_id = values.pop("id", None)

        if element_id:
            attrs["id"] = element_id

        setattr(state, f"has_{self.section}", True)

        return render_to_string(
            f"repui/components/card/card_{self.section}.html",
            {
                "content": self.nodelist.render(context),
                "class_name": class_name,
                "attrs": attrs,
            },
            request=context.get("request"),
        )


def _compile_kwargs(parser, bits, *, tag_name):
    kwargs = {}

    for bit in bits:
        if "=" not in bit:
            raise TemplateSyntaxError(
                f"{tag_name} arguments must use name=value"
            )

        name, value = bit.split("=", 1)

        if name in kwargs:
            raise TemplateSyntaxError(
                f"{tag_name} argument {name} was provided twice"
            )

        kwargs[name] = parser.compile_filter(value)

    return kwargs


def _parse_block(parser, token, *, end_tag, node_factory):
    bits = token.split_contents()
    tag_name = bits[0]
    kwargs = _compile_kwargs(
        parser,
        bits[1:],
        tag_name=tag_name,
    )
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return node_factory(nodelist, kwargs)


def _card(parser, token):
    return _parse_block(
        parser,
        token,
        end_tag="endcard",
        node_factory=lambda nodelist, kwargs: CardNode(
            nodelist,
            kwargs,
        ),
    )


def _section_tag(section):
    def tag(parser, token):
        return _parse_block(
            parser,
            token,
            end_tag=f"endcard_{section}",
            node_factory=lambda nodelist, kwargs: CardSectionNode(
                section,
                nodelist,
                kwargs,
            ),
        )

    return tag


def register_tags(library: template.Library):
    library.tag("card", _card)
    library.tag("card_header", _section_tag("header"))
    library.tag("card_body", _section_tag("body"))
    library.tag("card_footer", _section_tag("footer"))
