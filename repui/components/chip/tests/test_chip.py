from django.template import Context, Template
from django.test import SimpleTestCase

class ChipTests(SimpleTestCase):
    def test_delete_button(self):
        html = Template('{% load repui %}{% chip deletable=True %}Django{% endchip %}').render(Context())
        self.assertIn("data-rui-chip-delete", html)
