from django.template import Context, Template
from django.test import SimpleTestCase

class Tests(SimpleTestCase):
    def test_render(self):
        html = Template('{% load repui %}{% list_item_button %}Item{% endlist_item_button %}').render(Context())
        self.assertIn("<button", html)
