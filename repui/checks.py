"""Django system checks for RepUI contracts."""

from pathlib import Path

from django.core.checks import Error, register

from repui.component_manifest import validate_component_manifest
from repui.component_registry import (
    get_component_manifest,
    list_component_names,
)
from repui.theme_manifest import validate_theme_manifest
from repui.theme_registry import get_theme, list_themes


STATIC_ROOT = Path(__file__).resolve().parent / "static"


@register()
def check_component_manifests(app_configs, **kwargs):
    errors = []
    for name in list_component_names():
        manifest = get_component_manifest(name)
        for message in validate_component_manifest(name, manifest):
            errors.append(Error(
                f"{name}: {message}",
                id="repui.E001",
            ))
        if not isinstance(manifest, dict):
            continue

        assets = (
            *manifest.get("contract_styles", ()),
            *manifest.get("styles", ()),
            *manifest.get("scripts", ()),
        )
        for asset in assets:
            if not (STATIC_ROOT / asset).is_file():
                errors.append(Error(
                    f"{name}: declared asset does not exist: {asset}",
                    id="repui.E002",
                ))

        runtime = manifest.get("runtime")
        if not isinstance(runtime, dict):
            continue
        mount = runtime.get("mount")
        script_sources = []
        for script in manifest.get("scripts", ()):
            path = STATIC_ROOT / script
            if path.is_file():
                script_sources.append(path.read_text(encoding="utf-8"))
        if not any(f"export function {mount}" in source for source in script_sources):
            errors.append(Error(
                f"{name}: runtime mount is not exported by a declared script: {mount}",
                id="repui.E003",
            ))
    return errors


@register()
def check_theme_manifests(app_configs, **kwargs):
    errors = []
    for name in list_themes():
        manifest = get_theme(name)
        for message in validate_theme_manifest(name, manifest):
            errors.append(Error(
                f"{name}: {message}",
                id="repui.E004",
            ))
        if not isinstance(manifest, dict):
            continue

        assets = list(manifest.get("styles", ()))
        for component_assets in manifest.get("component_styles", {}).values():
            assets.extend(component_assets)
        for presentation in manifest.get("presentation", {}).values():
            if isinstance(presentation, dict):
                assets.append(presentation.get("atlas"))

        for asset in assets:
            if not isinstance(asset, str) or not asset:
                continue
            if not (STATIC_ROOT / asset).is_file():
                errors.append(Error(
                    f"{name}: declared asset does not exist: {asset}",
                    id="repui.E005",
                ))
    return errors
