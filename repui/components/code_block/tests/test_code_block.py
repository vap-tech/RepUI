from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class CodeBlockTagTests(SimpleTestCase):
    def render(self, source):
        return Template("{% load repui %}" + source).render(Context())

    def test_renders_defaults(self):
        html = self.render("{% code_block %}hello{% endcode_block %}")

        self.assertIn('data-language="text"', html)
        self.assertNotIn('data-copy="false"', html)
        self.assertIn("hello", html)

    def test_escapes_source(self):
        html = self.render(
            "{% code_block %}<script>alert(1)</script>{% endcode_block %}"
        )

        self.assertIn("&lt;script&gt;alert(1)&lt;/script&gt;", html)
        self.assertNotIn("<script>alert(1)</script>", html)

    def test_rejects_unknown_argument(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render(
                "{% code_block unsupported=True %}x{% endcode_block %}"
            )
