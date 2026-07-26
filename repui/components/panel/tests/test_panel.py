from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class PanelTests(SimpleTestCase):
    def render(self, source):
        return Template(
            "{% load repui %}" + source
        ).render(Context())

    def test_defaults(self):
        html = self.render(
            "{% panel %}Hello{% endpanel %}"
        )
        self.assertIn('data-surface="default"', html)
        self.assertIn('data-width="content"', html)
        self.assertIn('data-height="content"', html)

    def test_open_surface_value(self):
        html = self.render(
            '{% panel surface="admin-glass" %}'
            "Hello"
            "{% endpanel %}"
        )
        self.assertIn(
            'data-surface="admin-glass"',
            html,
        )

    def test_full_area(self):
        html = self.render(
            '{% panel width="full" height="full" %}'
            "Hello"
            "{% endpanel %}"
        )
        self.assertIn('data-width="full"', html)
        self.assertIn('data-height="full"', html)

    def test_empty_surface_fails(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render(
                '{% panel surface="" %}{% endpanel %}'
            )

    def test_invalid_width_fails(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render(
                '{% panel width="wide" %}{% endpanel %}'
            )
