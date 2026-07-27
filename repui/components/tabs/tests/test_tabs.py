from django.template import Context, Template
from django.test import SimpleTestCase

class TabsTests(SimpleTestCase):
    def test_roles(self):
        source = '{% load repui %}{% tabs %}{% tab_list %}{% tab panel="one" selected=True %}One{% endtab %}{% endtab_list %}{% tab_panel id="one" selected=True %}Panel{% endtab_panel %}{% endtabs %}'
        html = Template(source).render(Context())
        self.assertIn('role="tablist"', html)
        self.assertIn('role="tab"', html)
        self.assertIn('role="tabpanel"', html)
