"""Discoverable RepUI theme manifests."""

from importlib import import_module


def get_theme(name="default"):
    normalized = str(name or "default").strip().lower()
    try:
        module = import_module(f"repui.themes.{normalized}.manifest")
    except (ImportError, ModuleNotFoundError):
        return None

    value = getattr(module, "THEME", None)
    return value if isinstance(value, dict) else None


def list_themes():
    return ("default", "mineral")


def get_theme_assets(name="default", components=()):
    theme = get_theme(name) or get_theme("default")
    paths = list(theme.get("styles", ()))
    component_styles = theme.get("component_styles", {})
    for component in components:
        paths.extend(component_styles.get(str(component), ()))
    return tuple(dict.fromkeys(paths))
