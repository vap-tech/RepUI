"""Django tag for the public RepUI CSS loading contract."""

from importlib import import_module

from django import template
from django.templatetags.static import static
from django.utils.safestring import mark_safe

register = template.Library()

_FOUNDATION = (
    "repui/foundation/critical.css",
    "repui/theme/default/layers.css",
    "repui/foundation/tokens.css",
    "repui/foundation/fonts.css",
    "repui/foundation/controls.css",
    "repui/theme/default/metrics.css",
    "repui/theme/default/theme.css",
)
_LAYOUT = "repui/layout/layout.css"


def _manifest(name):
    """Load a component manifest without making it part of the public API."""
    try:
        module = import_module(f"repui.components.{name}.manifest")
    except (ImportError, ModuleNotFoundError):
        return {}
    value = getattr(module, "COMPONENT", {})
    return value if isinstance(value, dict) else {}


def _assets(value):
    """Normalize one manifest asset field to a tuple of paths."""
    if isinstance(value, str):
        return (value,)
    return tuple(value or ())


def _render_css(component_names):
    """Build the ordered stylesheet markup for selected components."""
    paths = list(_FOUNDATION)
    for name in component_names:
        manifest = _manifest(str(name))
        paths.extend(_assets(manifest.get("theme_styles")))
    paths.append(_LAYOUT)
    for name in component_names:
        manifest = _manifest(str(name))
        paths.extend(_assets(manifest.get("styles")))

    unique_paths = list(dict.fromkeys(path for path in paths if path))
    return mark_safe("\n".join(
        f'<link rel="stylesheet" href="{static(path)}">'
        for path in unique_paths
    ))


class RepUICssNode(template.Node):
    """Render literal component names from the ``repui_css`` tag."""

    def __init__(self, component_names):
        self.component_names = component_names

    def render(self, context):
        return _render_css(self.component_names)


@register.tag("repui_css")
def repui_css(parser, token):
    """Render infrastructure CSS and assets for named components."""
    bits = token.split_contents()
    return RepUICssNode(bits[1:])
