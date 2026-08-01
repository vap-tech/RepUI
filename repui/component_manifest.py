"""Canonical, deliberately small RepUI component-manifest contract."""

from __future__ import annotations

from typing import Any, TypedDict


class RuntimeManifest(TypedDict):
    required: bool
    mount: str
    contract: tuple[str, ...]


class ComponentManifest(TypedDict, total=False):
    name: str
    title: str
    description: str
    template: str
    contract_styles: tuple[str, ...]
    styles: tuple[str, ...]
    scripts: tuple[str, ...]
    runtime: RuntimeManifest | None
    status: str


REQUIRED_FIELDS = (
    "name",
    "title",
    "description",
    "template",
    "contract_styles",
    "styles",
    "scripts",
    "runtime",
    "status",
)
STATUSES = {"experimental", "stable"}
ASSET_FIELDS = ("contract_styles", "styles", "scripts")


def validate_component_manifest(
    component_name: str,
    manifest: dict[str, Any] | None,
) -> list[str]:
    """Return human-readable violations without importing Django checks."""
    if not isinstance(manifest, dict):
        return ["COMPONENT must be a dict"]

    errors: list[str] = []
    missing = [field for field in REQUIRED_FIELDS if field not in manifest]
    if missing:
        errors.append("missing fields: " + ", ".join(missing))
        return errors

    if manifest["name"] != component_name:
        errors.append("name must match the component package")

    for field in ("name", "title", "description", "template"):
        if not isinstance(manifest[field], str) or not manifest[field].strip():
            errors.append(f"{field} must be a non-empty string")

    for field in ASSET_FIELDS:
        value = manifest[field]
        if not isinstance(value, tuple) or not all(
            isinstance(path, str) and path for path in value
        ):
            errors.append(f"{field} must be a tuple of non-empty paths")

    if manifest["status"] not in STATUSES:
        allowed = ", ".join(sorted(STATUSES))
        errors.append(f"status must be one of: {allowed}")

    runtime = manifest["runtime"]
    if runtime is None:
        if manifest["scripts"]:
            errors.append("runtime must describe components with scripts")
        return errors

    if not isinstance(runtime, dict):
        errors.append("runtime must be None or a dict")
        return errors

    required = {"required", "mount", "contract"}
    missing_runtime = required - runtime.keys()
    if missing_runtime:
        errors.append(
            "runtime missing fields: "
            + ", ".join(sorted(missing_runtime))
        )
        return errors

    if not isinstance(runtime["required"], bool):
        errors.append("runtime.required must be bool")
    if not isinstance(runtime["mount"], str) or not runtime["mount"]:
        errors.append("runtime.mount must be a non-empty string")
    if not isinstance(runtime["contract"], tuple) or not all(
        isinstance(method, str) and method
        for method in runtime["contract"]
    ):
        errors.append("runtime.contract must be a tuple of method names")

    return errors
