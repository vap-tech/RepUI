from pathlib import Path
import re

from django import template
from django.template import Node, TemplateSyntaxError
from django.utils.safestring import mark_safe


_SIZES = {"xs", "sm", "md", "lg"}
_NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _svg_path(name):
    return (
        Path(__file__).resolve().parents[2]
        / "static"
        / "repui"
        / "icons"
        / f"{name}.svg"
    )


def _render_icon(name, size="md", decorative=True, label=None, class_name=None):
    if not _NAME.fullmatch(name):
        raise TemplateSyntaxError("icon name must contain lowercase letters, numbers and hyphens")
    if size not in _SIZES:
        raise TemplateSyntaxError(f"Unknown icon size: {size}")
    path = _svg_path(name)
    if not path.is_file():
        raise TemplateSyntaxError(f"Unknown icon: {name}")

    svg = path.read_text(encoding="utf-8")
    svg = re.sub(r"\s+(?:width|height)=\"[^\"]*\"", "", svg, count=2)
    classes = f"rui-icon rui-icon--{size}"
    if class_name:
        classes += f" {class_name}"
    svg = svg.replace("<svg", f'<svg class="{classes}"', 1)
    if decorative and not label:
        svg = svg.replace("<svg", '<svg aria-hidden="true" focusable="false"', 1)
    else:
        if not label:
            raise TemplateSyntaxError("Non-decorative icon requires label")
        svg = svg.replace("<svg", f'<svg role="img" aria-label="{label}"', 1)
    return mark_safe(svg)


register = template.Library()


class IconNode(Node):
    def __init__(self, name_filter, values):
        self.name_filter = name_filter
        self.values = values

    def render(self, context):
        name = self.name_filter.resolve(context) if self.name_filter else self.values["name"].resolve(context)
        return _render_icon(
            str(name),
            size=str(self.values["size"].resolve(context)),
            decorative=bool(self.values["decorative"].resolve(context)),
            label=self.values["label"].resolve(context),
            class_name=self.values["class_name"].resolve(context),
        )


def icon(parser, token):
    """Render a trusted inline SVG by its static asset name."""
    bits = token.split_contents()
    if len(bits) > 1 and "=" not in bits[1]:
        name_filter = parser.compile_filter(bits[1])
        bits = [bits[0], "name=" + bits[1], *bits[2:]]
    else:
        name_filter = None
    values = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("icon arguments must use name=value")
        key, value = bit.split("=", 1)
        if key not in {"name", "size", "decorative", "label", "class_name"}:
            raise TemplateSyntaxError(f"Unknown icon argument: {key}")
        values[key] = parser.compile_filter(value)

    values.setdefault("size", parser.compile_filter('"md"'))
    values.setdefault("decorative", parser.compile_filter("True"))
    values.setdefault("label", parser.compile_filter('""'))
    values.setdefault("class_name", parser.compile_filter('""'))
    return IconNode(name_filter, values)


register.tag("icon", icon)


def register_tags(library: template.Library):
    library.tag("icon", icon)
