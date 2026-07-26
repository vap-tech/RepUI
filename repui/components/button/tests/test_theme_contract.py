from pathlib import Path
from django.test import SimpleTestCase

class ButtonThemeContractTests(SimpleTestCase):
    def test_button_css_contains_no_hex_colors(self):
        css_path = (
            Path(__file__).resolve().parents[3]
            / "static/repui/components/button/button.css"
        )
        css = css_path.read_text(encoding="utf-8")
        self.assertNotIn("#", css)

    def test_button_uses_semantic_tokens(self):
        css_path = (
            Path(__file__).resolve().parents[3]
            / "static/repui/components/button/button.css"
        )
        css = css_path.read_text(encoding="utf-8")
        self.assertIn("--rui-color-primary", css)
        self.assertIn("--rui-button-bg", css)
        self.assertIn("--rui-button-bg-hover", css)
        self.assertNotIn("filter:brightness", css.replace(" ", ""))
