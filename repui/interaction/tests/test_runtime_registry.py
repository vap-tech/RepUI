import re
from pathlib import Path

from django.test import SimpleTestCase

from repui.component_registry import (
    get_component_manifest,
    list_component_names,
)


BOOTSTRAP = (
    Path(__file__).resolve().parents[2]
    / "static/repui/runtime/bootstrap.js"
)


class RuntimeRegistryTests(SimpleTestCase):
    def adapter_pairs(self):
        source = BOOTSTRAP.read_text(encoding="utf-8")
        return re.findall(
            r'\["([^"]+)",\s*(mount[A-Za-z0-9]+)\]',
            source,
        )

    def test_required_component_runtimes_are_registered(self):
        adapters = dict(self.adapter_pairs())

        for component_name in list_component_names():
            manifest = get_component_manifest(component_name)
            runtime = manifest.get("runtime") if manifest else None
            if not isinstance(runtime, dict) or not runtime.get("required"):
                continue

            adapter_name = component_name.replace("_", "-")
            self.assertIn(adapter_name, adapters, component_name)
            self.assertEqual(
                adapters[adapter_name],
                runtime["mount"],
                component_name,
            )

    def test_each_global_adapter_has_the_matching_manifest(self):
        for adapter_name, mount in self.adapter_pairs():
            component_name = adapter_name.replace("-", "_")
            manifest = get_component_manifest(component_name)
            self.assertIsNotNone(manifest, adapter_name)
            self.assertEqual(
                manifest["runtime"]["mount"],
                mount,
                adapter_name,
            )

    def test_menu_mounts_before_menu_composites(self):
        names = [name for name, _ in self.adapter_pairs()]
        menu_index = names.index("menu")
        self.assertLess(menu_index, names.index("dropdown-menu"))
        self.assertLess(menu_index, names.index("menubar"))

    def test_runtime_instances_expose_element_for_lifecycle_cleanup(self):
        source = BOOTSTRAP.read_text(encoding="utf-8")
        self.assertIn("const node = instance?.element", source)
        self.assertNotIn("function nodeFor", source)

        for adapter_name, _ in self.adapter_pairs():
            component_name = adapter_name.replace("-", "_")
            manifest = get_component_manifest(component_name)
            scripts = manifest.get("scripts", ()) if manifest else ()
            for script in scripts:
                source = (
                    Path(__file__).resolve().parents[2]
                    / "static"
                    / script
                ).read_text(encoding="utf-8")
                self.assertIn("element", source, script)
