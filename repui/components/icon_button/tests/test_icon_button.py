from django.template import Context, Template
from django.test import SimpleTestCase

class IconButtonTests(SimpleTestCase):
    def test_button(self):
        html = Template('{% load repui %}{% icon_button aria_label="Close" %}x{% endicon_button %}').render(Context())
        self.assertIn("<button", html)
        self.assertIn('aria-label="Close"', html)
