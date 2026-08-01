"""Small, explicit building blocks for public RepUI template tags."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

from django.template import Context, TemplateSyntaxError


def compile_keyword_arguments(parser, token) -> dict[str, Any]:
    """Compile ``name=value`` arguments and reject duplicates consistently."""
    bits = token.split_contents()
    values: dict[str, Any] = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(
                f"{bits[0]} arguments must use name=value"
            )
        name, expression = bit.split("=", 1)
        if name in values:
            raise TemplateSyntaxError(
                f"{bits[0]} received duplicate argument: {name}"
            )
        values[name] = parser.compile_filter(expression)
    return values


def resolve_arguments(
    expressions: Mapping[str, Any],
    context: Context,
) -> dict[str, Any]:
    return {
        name: expression.resolve(context)
        for name, expression in expressions.items()
    }


def reject_unknown(
    values: Mapping[str, Any],
    allowed: Iterable[str],
    *,
    component: str,
) -> None:
    unknown = set(values) - set(allowed)
    if unknown:
        raise TemplateSyntaxError(
            f"Unknown {component} arguments: "
            + ", ".join(sorted(unknown))
        )


def resolve_bool(value: Any, *, name: str) -> bool:
    """Accept real booleans only; strings such as ``'false'`` are errors."""
    if isinstance(value, bool):
        return value
    if value in (None, ""):
        return False
    raise TemplateSyntaxError(f"{name} must resolve to True or False")


def extract_html_attrs(
    values: dict[str, Any],
    aliases: Mapping[str, str],
    *,
    attrs_key: str = "attrs",
) -> dict[str, Any]:
    """Pop explicit aliases into one safe attribute mapping."""
    attrs = dict(values.pop(attrs_key, {}) or {})
    for argument, attribute in aliases.items():
        value = values.pop(argument, None)
        if value is not None and value is not False:
            attrs[attribute] = value
    return attrs
