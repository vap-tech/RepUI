from pathlib import Path

from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class CardTests(SimpleTestCase):
    def render(self, source):
        return Template(
            "{% load repui %}" + source
        ).render(Context())

    def test_simple_card_defaults(self):
        html = self.render(
            "{% card %}<h1>Hello</h1>{% endcard %}"
        )

        self.assertIn('class="rui-card"', html)
        self.assertIn('data-surface="card"', html)
        self.assertIn('data-width="content"', html)
        self.assertIn('data-height="content"', html)
        self.assertIn('data-overflow="visible"', html)
        self.assertIn('data-sections="false"', html)
        self.assertIn('class="rui-card__content"', html)
        self.assertIn("<h1>Hello</h1>", html)

    def test_all_sections_render(self):
        html = self.render(
            "{% card %}"
            "{% card_header %}Header{% endcard_header %}"
            "{% card_body %}Body{% endcard_body %}"
            "{% card_footer %}Footer{% endcard_footer %}"
            "{% endcard %}"
        )

        self.assertIn('data-sections="true"', html)
        self.assertIn('class="rui-card__header"', html)
        self.assertIn('class="rui-card__body"', html)
        self.assertIn('class="rui-card__footer"', html)

    def test_sections_are_not_created_implicitly(self):
        html = self.render(
            "{% card %}"
            "<h2>Title</h2>"
            "<p>Body</p>"
            "{% endcard %}"
        )

        self.assertNotIn("rui-card__header", html)
        self.assertNotIn("rui-card__body", html)
        self.assertNotIn("rui-card__footer", html)

    def test_open_surface(self):
        html = self.render(
            '{% card surface="admin-glass" %}'
            "Hello"
            "{% endcard %}"
        )

        self.assertIn(
            'data-surface="admin-glass"',
            html,
        )

    def test_full_size_and_auto_overflow(self):
        html = self.render(
            '{% card width="full" height="full" overflow="auto" %}'
            "Hello"
            "{% endcard %}"
        )

        self.assertIn('data-width="full"', html)
        self.assertIn('data-height="full"', html)
        self.assertIn('data-overflow="auto"', html)

    def test_card_attributes(self):
        html = self.render(
            '{% card id="demo" class_name="docs-card" %}'
            "Hello"
            "{% endcard %}"
        )

        self.assertIn('id="demo"', html)
        self.assertIn(
            'class="rui-card docs-card"',
            html,
        )

    def test_section_attributes(self):
        html = self.render(
            "{% card %}"
            '{% card_header id="title" class_name="custom-header" %}'
            "Header"
            "{% endcard_header %}"
            "{% endcard %}"
        )

        self.assertIn('id="title"', html)
        self.assertIn(
            'class="rui-card__header custom-header"',
            html,
        )

    def test_section_outside_card_fails(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render(
                "{% card_body %}Body{% endcard_body %}"
            )

    def test_invalid_width_fails(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render(
                '{% card width="wide" %}{% endcard %}'
            )

    def test_invalid_height_fails(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render(
                '{% card height="screen" %}{% endcard %}'
            )

    def test_invalid_overflow_fails(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render(
                '{% card overflow="scroll" %}{% endcard %}'
            )

    def test_empty_surface_fails(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render(
                '{% card surface="" %}{% endcard %}'
            )

    def test_css_preserves_overlay_contract(self):
        css_path = (
            Path(__file__).resolve().parents[3]
            / "static/repui/components/card/card.css"
        )
        css = css_path.read_text(encoding="utf-8")

        self.assertIn("position: relative", css)
        self.assertIn("overflow: visible", css)
        self.assertIn(".rui-card__surface", css)
        self.assertIn("overflow: hidden", css)

    def test_css_scroll_contract(self):
        css_path = (
            Path(__file__).resolve().parents[3]
            / "static/repui/components/card/card.css"
        )
        css = css_path.read_text(encoding="utf-8")

        self.assertIn(
            '[data-sections="false"][data-overflow="auto"]',
            css,
        )
        self.assertIn(
            '[data-sections="true"][data-overflow="auto"]',
            css,
        )
