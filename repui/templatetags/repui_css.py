"""Django tag for the public RepUI CSS loading contract."""

from importlib import import_module

from django import template
from django.conf import settings
from django.templatetags.static import static
from django.utils.safestring import mark_safe

from repui.theme_registry import get_theme, get_theme_assets

register = template.Library()

_FOUNDATION = (
    "repui/foundation/critical.css",
    "repui/theme/default/layers.css",
    "repui/foundation/tokens.css",
    "repui/foundation/fonts.css",
    "repui/foundation/controls.css",
    "repui/theme/contract/metrics.css",
    "repui/theme/contract/semantic-fallbacks.css",
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


def _render_css(component_names, theme_name="default"):
    """Build the ordered stylesheet markup for selected components."""
    theme = get_theme(theme_name) or get_theme("default")
    paths = list(_FOUNDATION)
    paths.extend(get_theme_assets(theme["name"], component_names))
    for name in component_names:
        manifest = _manifest(str(name))
        paths.extend(_assets(
            manifest.get("contract_styles")
            or manifest.get("theme_styles")
        ))
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

    def __init__(self, component_names, theme_expression=None):
        self.component_names = component_names
        self.theme_expression = theme_expression

    def render(self, context):
        theme_name = "default"
        if self.theme_expression is not None:
            theme_name = self.theme_expression.resolve(context)
        elif context.get("repui_theme"):
            theme_name = context["repui_theme"]
        else:
            theme_name = (
                getattr(settings, "REPUI", {}) or {}
            ).get("THEME", "default")
        return _render_css(self.component_names, theme_name)


@register.tag("repui_css")
def repui_css(parser, token):
    """Render infrastructure CSS and assets for named components."""
    bits = token.split_contents()
    component_names = []
    theme_expression = None
    for bit in bits[1:]:
        if bit.startswith("theme="):
            theme_expression = parser.compile_filter(bit.split("=", 1)[1])
        else:
            component_names.append(bit)
    return RepUICssNode(component_names, theme_expression)
