from django.template import Context, Template
from django.test import SimpleTestCase

class MenuTests(SimpleTestCase):
    def test_roles(self):
        html = Template('{% load repui %}{% menu %}{% menu_item %}One{% endmenu_item %}{% endmenu %}').render(Context())
        self.assertIn('role="menu"', html)
        self.assertIn('role="menuitem"', html)
