from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class AccordionTagTests(SimpleTestCase):
    def render(self, source):
        return Template("{% load repui %}" + source).render(Context())

    def test_renders_items(self):
        html = self.render(
            "{% accordion %}{% accordion_item label='One' %}Body{% endaccordion_item %}{% endaccordion %}"
        )
        self.assertIn('data-rui-accordion', html)
        self.assertIn('data-rui-accordion-item', html)
        self.assertIn("One", html)
        self.assertIn("Body", html)

    def test_multiple_is_explicit(self):
        html = self.render("{% accordion multiple=True %}{% endaccordion %}")
        self.assertIn("data-multiple", html)

    def test_rejects_unknown_argument(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render("{% accordion nope=True %}{% endaccordion %}")
