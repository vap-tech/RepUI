from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class DrawerValidationTests(SimpleTestCase):
    def test_invalid_side(self):
        template = Template('{% load repui %}{% drawer id="x" side="top" %}{% enddrawer %}')
        with self.assertRaises(TemplateSyntaxError):
            template.render(Context())
