from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class NavbarValidationTests(SimpleTestCase):
    def test_invalid_orientation(self):
        template = Template('{% load repui %}{% navbar orientation="diagonal" %}{% endnavbar %}')
        with self.assertRaises(TemplateSyntaxError):
            template.render(Context())
