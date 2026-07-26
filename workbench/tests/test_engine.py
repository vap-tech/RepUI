from django.test import SimpleTestCase
from django.urls import reverse

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
