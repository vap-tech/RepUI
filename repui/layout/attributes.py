from __future__ import annotations

from django.template import TemplateSyntaxError


def positive_int(value, *, name: str, maximum: int = 100) -> int:
    try:
        number = int(value)
    except (TypeError, ValueError) as exc:
        raise TemplateSyntaxError(f"{name} must be an integer") from exc

    if not 1 <= number <= maximum:
        raise TemplateSyntaxError(f"{name} must be between 1 and {maximum}")

    return number


def layout_attributes(*, column=None, row=None) -> dict[str, str]:
    """
    Public helper for future RepUI components.

    It returns both readable data attributes and CSS variables required by
    the current layout implementation.
    """
    attrs: dict[str, str] = {}
    styles: list[str] = []

    if column is not None:
        value = positive_int(column, name="column")
        attrs["data-column"] = str(value)
        styles.append(f"--rui-layout-column:{value}")

    if row is not None:
        value = positive_int(row, name="row")
        attrs["data-row"] = str(value)
        styles.append(f"--rui-layout-row:{value}")

    if styles:
        attrs["style"] = ";".join(styles)

    return attrs
