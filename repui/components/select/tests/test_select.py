from django.template import Context, Template
from django.test import SimpleTestCase


class SelectTemplateTests(SimpleTestCase):
    def test_single_select(self):
        html = Template(
            """
            {% load repui %}
            {% select name="city" %}
              {% select_option value="msk" selected=True %}
                Москва
              {% endselect_option %}
            {% endselect %}
            """
        ).render(Context())

        self.assertIn('name="city"', html)
        self.assertIn("data-rui-select", html)
        self.assertIn('value="msk"', html)
        self.assertIn("selected", html)

    def test_multiple_select(self):
        html = Template(
            """
            {% load repui %}
            {% select name="skills" multiple=True %}
              {% select_option value="python" %}Python{% endselect_option %}
            {% endselect %}
            """
        ).render(Context())

        self.assertIn("multiple", html)
        self.assertIn('name="skills"', html)
