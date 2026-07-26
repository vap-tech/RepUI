from pathlib import Path

from django.template import Context, Template
from django.test import SimpleTestCase


class PageTests(SimpleTestCase):
    def render(self, source):
        return Template(
            "{% load repui %}" + source
        ).render(Context())

    def test_page_renders(self):
        html = self.render(
            "{% page %}Hello{% endpage %}"
        )
        self.assertIn('class="rui-page"', html)
        self.assertIn("Hello", html)

    def test_page_content_renders_main(self):
        html = self.render(
            "{% page %}"
            "{% page_content %}Main{% endpage_content %}"
            "{% endpage %}"
        )
        self.assertIn('class="rui-page__content"', html)
        self.assertIn("<main", html)

    def test_id_and_class(self):
        html = self.render(
            '{% page id="app" class_name="docs-page" %}'
            "Hello"
            "{% endpage %}"
        )
        self.assertIn('id="app"', html)
        self.assertIn('class="rui-page docs-page"', html)

    def test_css_contract(self):
        css_path = (
            Path(__file__).resolve().parents[3]
            / "static/repui/components/page/page.css"
        )
        css = css_path.read_text(encoding="utf-8")
        self.assertIn("min-block-size: 100dvh", css)
        self.assertIn("flex-direction: column", css)
        self.assertIn("flex: 1 1 auto", css)
        self.assertIn("min-block-size: 0", css)
