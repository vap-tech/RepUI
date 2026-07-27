from pathlib import Path

from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase

from repui.components.list.manifest import COMPONENT


class ListTests(SimpleTestCase):
    def test_render(self):
        html = Template('{% load repui %}{% list ordered=True dense=True %}<li>A</li>{% endlist %}').render(Context())
        self.assertIn('<ol', html)
        self.assertIn('data-dense="true"', html)

    def test_rejects_unknown_argument(self):
        with self.assertRaises(TemplateSyntaxError):
            Template('{% load repui %}{% list wat=True %}{% endlist %}')

    def test_manifest_asset_exists(self):
        root = Path(__file__).resolve().parents[3]
        for asset in COMPONENT["styles"]:
            self.assertTrue((root / "static" / asset).is_file(), asset)
