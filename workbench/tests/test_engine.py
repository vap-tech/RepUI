from django.test import SimpleTestCase
from django.urls import reverse
from django.template.loader import render_to_string

from workbench.utils import get_components


class WorkbenchEngineTests(SimpleTestCase):
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

    def test_sidebar_swaps_components_without_changing_browser_url(self):
        html = render_to_string(
            "workbench/partials/sidebar.html",
            {"components": [
                {"name": "button", "title": "Button", "enabled": True, "error": ""},
            ]},
        )
        self.assertIn('hx-swap="innerHTML"', html)
        self.assertNotIn("hx-push-url", html)
        self.assertNotIn("hx-replace-url", html)
