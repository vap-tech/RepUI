from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class CollapsibleTagTests(SimpleTestCase):
    def render(self, source):
        return Template("{% load repui %}" + source).render(Context())

    def test_renders_label_and_content(self):
        html = self.render(
            '{% collapsible label="Options" %}Details{% endcollapsible %}'
        )
        self.assertIn("Options", html)
        self.assertIn("Details", html)
        self.assertIn('aria-expanded="false"', html)
        self.assertIn(" hidden", html)

    def test_rejects_unknown_argument(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render("{% collapsible unknown=True %}x{% endcollapsible %}")
