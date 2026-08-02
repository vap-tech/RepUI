"""Canonical, deliberately small RepUI theme-manifest contract."""

from __future__ import annotations

from typing import Any, TypedDict


class ThemePresentationItem(TypedDict):
    alt: str
    atlas: str
    column: int


class ThemeManifest(TypedDict):
    name: str
    title: str
    description: str
    version: str
    schemes: tuple[str, ...]
    styles: tuple[str, ...]
    component_styles: dict[str, tuple[str, ...]]
    presentation: dict[str, ThemePresentationItem]


REQUIRED_FIELDS = (
    "name",
    "title",
    "description",
    "version",
    "schemes",
    "styles",
    "component_styles",
    "presentation",
)
SCHEMES = {"light", "dark"}
PRESENTATION_ITEMS = ("hero", "preview")


def _is_path_tuple(value: Any) -> bool:
    return isinstance(value, tuple) and all(
        isinstance(path, str) and path
        for path in value
    )


def validate_theme_manifest(
    theme_name: str,
    manifest: dict[str, Any] | None,
) -> list[str]:
    """Return human-readable violations without importing Django checks."""
    if not isinstance(manifest, dict):
        return ["THEME must be a dict"]

    errors: list[str] = []
    missing = [field for field in REQUIRED_FIELDS if field not in manifest]
    if missing:
        return ["missing fields: " + ", ".join(missing)]

    if manifest["name"] != theme_name:
        errors.append("name must match the theme package")

    for field in ("name", "title", "description", "version"):
        if not isinstance(manifest[field], str) or not manifest[field].strip():
            errors.append(f"{field} must be a non-empty string")

    schemes = manifest["schemes"]
    if not isinstance(schemes, tuple) or not schemes:
        errors.append("schemes must be a non-empty tuple")
    elif (
        any(not isinstance(scheme, str) or scheme not in SCHEMES for scheme in schemes)
        or len(set(schemes)) != len(schemes)
    ):
        errors.append("schemes must be a tuple of unique light/dark values")

    if not _is_path_tuple(manifest["styles"]):
        errors.append("styles must be a tuple of non-empty paths")

    component_styles = manifest["component_styles"]
    if not isinstance(component_styles, dict):
        errors.append("component_styles must be a dict of component path tuples")
    else:
        for component, paths in component_styles.items():
            if not isinstance(component, str) or not component:
                errors.append("component_styles keys must be non-empty strings")
                break
            if not _is_path_tuple(paths):
                errors.append(
                    "component_styles values must be tuples of non-empty paths"
                )
                break

    presentation = manifest["presentation"]
    if not isinstance(presentation, dict):
        errors.append("presentation must be a dict")
        return errors

    for item_name in PRESENTATION_ITEMS:
        item = presentation.get(item_name)
        if not isinstance(item, dict):
            errors.append(f"presentation.{item_name} must be a dict")
            continue
        for field in ("alt", "atlas"):
            if not isinstance(item.get(field), str) or not item[field].strip():
                errors.append(
                    f"presentation.{item_name}.{field} must be a non-empty string"
                )
        column = item.get("column")
        if isinstance(column, bool) or not isinstance(column, int) or column < 0:
            errors.append(
                f"presentation.{item_name}.column must be a non-negative integer"
            )

    return errors
