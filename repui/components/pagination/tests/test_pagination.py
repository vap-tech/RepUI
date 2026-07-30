from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class PaginationTagTests(SimpleTestCase):
    def render(self, source):
        return Template("{% load repui %}" + source).render(Context())

    def test_renders_content(self):
        html = self.render(
            "{% pagination %}<a data-page='2'>2</a>{% endpagination %}"
        )
        self.assertIn('data-rui-pagination', html)
        self.assertIn("data-page='2'", html)

    def test_rejects_unknown_argument(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render("{% pagination pages=3 %}{% endpagination %}")
