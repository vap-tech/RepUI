from pathlib import Path

from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase

from repui.components.autocomplete.manifest import COMPONENT


class AutocompleteTests(SimpleTestCase):
    def test_render(self):
        html = Template('{% load repui %}{% autocomplete name="city" %}{% autocomplete_option value="1" %}One{% endautocomplete_option %}{% endautocomplete %}').render(Context())
        self.assertIn('data-rui-autocomplete', html)

    def test_required_arguments(self):
        with self.assertRaises(TemplateSyntaxError):
            Template('{% load repui %}{% autocomplete %}{% endautocomplete %}')

    def test_assets_and_runtime_contract(self):
        root = Path(__file__).resolve().parents[3]
        for asset in (*COMPONENT["styles"], *COMPONENT["scripts"]):
            self.assertTrue((root / "static" / asset).is_file(), asset)
        self.assertEqual(COMPONENT["runtime"]["mount"], "mountAutocompletes")
        source = (root / "static/repui/components/autocomplete/autocomplete.js").read_text(encoding="utf-8")
        self.assertIn("export function mountAutocompletes", source)
        self.assertIn("refresh()", source)
        self.assertIn("destroy()", source)
        self.assertIn('htmx:afterSwap', source)
