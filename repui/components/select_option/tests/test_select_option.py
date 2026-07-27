from django.template import Context, Template
from django.test import SimpleTestCase

class SelectOptionTests(SimpleTestCase):
    def test_native_option_markup(self):
        html = Template('{% load repui %}{% select_option value="one" %}One{% endselect_option %}').render(Context())
        self.assertIn('<option', html)
        self.assertIn('value="one"', html)
