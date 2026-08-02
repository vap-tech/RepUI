from django.test import SimpleTestCase
from django.urls import reverse
from django.template.loader import render_to_string
from unittest.mock import patch

from repui import component_registry
from workbench import utils
from workbench.utils import get_components


class WorkbenchEngineTests(SimpleTestCase):
    def test_manifest_loader_propagates_nested_module_errors(self):
        error = ModuleNotFoundError("missing nested dependency")
        error.name = "repui.components.button.dependencies"
        with patch.object(
            component_registry,
            "import_module",
            side_effect=error,
        ):
            with self.assertRaises(ModuleNotFoundError):
                utils._load_manifest("button")

    def test_component_directories_are_discovered(self):
        components = get_components()
        self.assertIsInstance(components, list)

    def test_navigation_items_have_required_fields(self):
        for component in get_components():
            self.assertIn("name", component)
            self.assertIn("title", component)
            self.assertIn("enabled", component)
            self.assertIn("error", component)

    def test_home_url_exists(self):
        self.assertEqual(
            reverse("workbench:home"),
            "/docs/",
        )

    def test_roadmap_url_exists(self):
        self.assertEqual(
            reverse("workbench:roadmap"),
            "/docs/roadmap/",
        )

    def test_sidebar_swaps_components_without_changing_browser_url(self):
        html = render_to_string(
            "workbench/partials/sidebar.html",
            {"components": [
                {
                    "name": "button",
                    "title": "Button",
                    "enabled": True,
                    "error": "",
                    "navigation_attrs": {
                        "hx-get": "/docs/partial/button/",
                        "hx-target": "#component-panel",
                        "hx-swap": "innerHTML",
                    },
                },
            ]},
        )
        self.assertIn('class="rui-list-item-button"', html)
        self.assertIn('hx-swap="innerHTML"', html)
        self.assertNotIn("hx-push-url", html)
        self.assertNotIn("hx-replace-url", html)
