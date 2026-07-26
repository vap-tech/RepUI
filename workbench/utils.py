from __future__ import annotations

from importlib import import_module
from pathlib import Path
from typing import Any

from django.apps import apps
from django.template import TemplateSyntaxError, engines


def components_root() -> Path:
    """Return the installed RepUI components directory."""
    return Path(apps.get_app_config("repui").path) / "components"


def _load_manifest(component_name: str) -> dict[str, Any]:
    """Load a component manifest without making it mandatory."""
    try:
        module = import_module(
            f"repui.components.{component_name}.manifest"
        )
    except (ImportError, ModuleNotFoundError):
        return {}

    manifest = getattr(module, "COMPONENT", {})
    return manifest if isinstance(manifest, dict) else {}


def component_template_path(component_name: str) -> Path:
    return (
        components_root()
        / component_name
        / f"{component_name}.html"
    )


def component_template_source(component_name: str) -> str:
    return component_template_path(component_name).read_text(
        encoding="utf-8"
    )


def template_state(
    component_name: str,
) -> tuple[bool, str | None]:
    path = component_template_path(component_name)

    if not path.is_file():
        return False, "Workbench-композиция пока не добавлена"

    try:
        source = path.read_text(encoding="utf-8")
        engines["django"].from_string(source)
    except (OSError, UnicodeError, TemplateSyntaxError) as exc:
        return False, str(exc)

    return True, None


def get_components() -> list[dict[str, Any]]:
    """Discover component folders and return navigation-ready dictionaries."""
    root = components_root()
    components: list[dict[str, Any]] = []

    if not root.is_dir():
        return components

    for directory in sorted(
        root.iterdir(),
        key=lambda item: item.name.casefold(),
    ):
        if not directory.is_dir():
            continue

        if directory.name.startswith("_"):
            continue

        name = directory.name
        manifest = _load_manifest(name)
        enabled, error = template_state(name)

        components.append({
            "name": name,
            "title": str(
                manifest.get(
                    "title",
                    name.replace("_", " ").title(),
                )
            ),
            "description": str(
                manifest.get("description", "")
            ),
            "category": str(
                manifest.get("category", "Components")
            ),
            "status": str(
                manifest.get("status", "experimental")
            ),
            "enabled": enabled,
            "error": error,
            "manifest": manifest,
        })

    return components


def get_component(
    component_name: str,
) -> dict[str, Any] | None:
    return next(
        (
            component
            for component in get_components()
            if component["name"] == component_name
        ),
        None,
    )
