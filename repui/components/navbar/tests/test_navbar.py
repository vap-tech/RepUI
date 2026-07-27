from pathlib import Path

from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase

from repui.components.navbar.manifest import COMPONENT


class NavbarTests(SimpleTestCase):
    def test_render(self):
        html = Template('{% load repui %}{% navbar orientation="vertical" %}{% nav_item href="/" %}Home{% endnav_item %}{% endnavbar %}').render(Context())
        self.assertIn('data-rui-navbar', html)

    def test_required_arguments(self):
        with self.assertRaises(TemplateSyntaxError):
            Template('{% load repui %}{% navbar %}{% nav_item %}Missing{% endnav_item %}{% endnavbar %}')

    def test_assets_and_runtime_contract(self):
        root = Path(__file__).resolve().parents[3]
        for asset in (*COMPONENT["styles"], *COMPONENT["scripts"]):
            self.assertTrue((root / "static" / asset).is_file(), asset)
        self.assertEqual(COMPONENT["runtime"]["mount"], "mountNavbars")
        source = (root / "static/repui/components/navbar/navbar.js").read_text(encoding="utf-8")
        self.assertIn("export function mountNavbars", source)
        self.assertIn("refresh()", source)
        self.assertIn("destroy()", source)
        self.assertIn('htmx:afterSwap', source)
