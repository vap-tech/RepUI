from django.template import Context, Template
from django.test import SimpleTestCase


class ThemeTemplateTagTests(SimpleTestCase):
    def test_head_script_contains_supported_modes(self):
        html = Template(
            "{% load repui_theme %}{% repui_theme_head %}"
        ).render(Context())

        self.assertIn('"light"', html)
        self.assertIn('"dark"', html)
        self.assertIn('"system"', html)
        self.assertIn("localStorage.getItem", html)
        self.assertIn("data", html)
        self.assertIn("ruiMode", html)
        self.assertIn("ruiResolvedMode", html)

    def test_head_script_is_inline_script(self):
        html = Template(
            "{% load repui_theme %}{% repui_theme_head %}"
        ).render(Context())

        self.assertIn("<script>", html)
        self.assertIn("</script>", html)
