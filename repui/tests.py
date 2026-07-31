from django.template import Context, Template
from django.test import SimpleTestCase

from repui.templatetags.repui_css import _render_css
from repui.theme_registry import get_theme, get_theme_assets, list_themes


class ThemeRegistryTests(SimpleTestCase):
    def test_theme_bootstrap_and_registry(self):
        html = Template(
            "{% load repui_theme %}{% repui_theme_head %}"
        ).render(Context())
        self.assertIn('"default"', html)
        self.assertIn('"mineral"', html)
        self.assertEqual(list_themes(), ("default", "mineral"))
        self.assertEqual(get_theme("mineral")["name"], "mineral")

    def test_unknown_theme_falls_back_to_default(self):
        self.assertEqual(get_theme_assets("unknown"), get_theme_assets("default"))

    def test_loader_uses_selected_theme_and_contract(self):
        html = _render_css(("card",), "mineral")
        self.assertIn("repui/theme/mineral/palette.css", html)
        self.assertIn("repui/theme/mineral/light.css", html)
        self.assertIn("repui/theme/mineral/dark.css", html)
        self.assertIn("repui/theme/contract/components/card-tokens.css", html)
