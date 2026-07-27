from django.template import Context, Template
from django.test import SimpleTestCase

class Tests(SimpleTestCase):
    def test_render(self):
        html = Template('{% load repui %}{% card_action %}Item{% endcard_action %}').render(Context())
        self.assertIn("<button", html)
