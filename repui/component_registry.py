"""Discovery and loading for RepUI component manifests."""

from __future__ import annotations

from importlib import import_module
from functools import lru_cache
from pathlib import Path
from typing import Any


def components_root() -> Path:
    return Path(__file__).resolve().parent / "components"


def get_component_manifest(name: str) -> dict[str, Any] | None:
    """Return one manifest, or ``None`` when the component package is absent.

    A missing dependency *inside* an existing manifest is deliberately allowed
    to propagate: treating it as an absent component hides broken releases.
    """
    normalized = str(name).strip()
    package_name = f"repui.components.{normalized}"
    module_name = f"{package_name}.manifest"
    try:
        module = import_module(module_name)
    except ModuleNotFoundError as exc:
        if exc.name in {package_name, module_name}:
            return None
        raise

    manifest = getattr(module, "COMPONENT", None)
    return manifest if isinstance(manifest, dict) else None


@lru_cache(maxsize=1)
def list_component_names() -> tuple[str, ...]:
    root = components_root()
    if not root.is_dir():
        return ()
    return tuple(
        directory.name
        for directory in sorted(root.iterdir(), key=lambda item: item.name)
        if directory.is_dir()
        and not directory.name.startswith("_")
        and (directory / "manifest.py").is_file()
    )
