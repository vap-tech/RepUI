"""Discoverable RepUI theme manifests."""

from importlib import import_module
from functools import lru_cache
from pathlib import Path


def get_theme(name="default"):
    normalized = str(name or "default").strip().lower()
    module_name = normalized.replace("-", "_")
    package_name = f"repui.themes.{module_name}"
    manifest_module = f"repui.themes.{module_name}.manifest"
    try:
        module = import_module(manifest_module)
    except ModuleNotFoundError as exc:
        if exc.name in {package_name, manifest_module}:
            return None
        raise

    value = getattr(module, "THEME", None)
    return value if isinstance(value, dict) else None


@lru_cache(maxsize=1)
def list_themes():
    root = Path(__file__).resolve().parent / "themes"
    names = []
    for directory in sorted(root.iterdir(), key=lambda item: item.name):
        if (directory / "manifest.py").is_file():
            theme = get_theme(directory.name)
            if theme and theme.get("name"):
                names.append(theme["name"])
    return tuple(names)


def get_theme_assets(name="default", components=()):
    theme = get_theme(name) or get_theme("default")
    paths = list(theme.get("styles", ()))
    component_styles = theme.get("component_styles", {})
    for component in components:
        paths.extend(component_styles.get(str(component), ()))
    return tuple(dict.fromkeys(paths))
