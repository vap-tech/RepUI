from pathlib import Path

from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase

from repui.components.drawer.manifest import COMPONENT


class DrawerTests(SimpleTestCase):
    def test_render(self):
        html = Template('{% load repui %}{% drawer id="main" side="right" %}Body{% enddrawer %}').render(Context())
        self.assertIn('data-rui-drawer', html)

    def test_required_arguments(self):
        with self.assertRaises(TemplateSyntaxError):
            Template('{% load repui %}{% drawer %}Body{% enddrawer %}')

    def test_assets_and_runtime_contract(self):
        root = Path(__file__).resolve().parents[3]
        for asset in (*COMPONENT["styles"], *COMPONENT["scripts"]):
            self.assertTrue((root / "static" / asset).is_file(), asset)
        self.assertEqual(COMPONENT["runtime"]["mount"], "mountDrawers")
        source = (root / "static/repui/components/drawer/drawer.js").read_text(encoding="utf-8")
        self.assertIn("export function mountDrawers", source)
        self.assertIn("refresh()", source)
        self.assertIn("destroy()", source)
        self.assertIn('htmx:afterSwap', source)
