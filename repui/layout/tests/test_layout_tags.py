from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class LayoutTagTests(SimpleTestCase):
    def render(self, source):
        return Template("{% load repui_layout %}" + source).render(Context())

    def test_container(self):
        self.assertIn("rui-container", self.render("{% container %}Hi{% endcontainer %}"))

    def test_grid_and_column(self):
        html = self.render(
            "{% grid columns=5 %}"
            "{% container column=4 %}Work{% endcontainer %}"
            "{% endgrid %}"
        )
        self.assertIn("--rui-grid-columns:5", html)
        self.assertIn("--rui-layout-column:4", html)

    def test_stack_and_row(self):
        html = self.render(
            "{% stack rows=20 %}"
            "{% container row=19 %}Main{% endcontainer %}"
            "{% endstack %}"
        )
        self.assertIn("--rui-stack-rows:20", html)
        self.assertIn("--rui-layout-row:19", html)

    def test_content_mode(self):
        html = self.render(
            '{% grid columns=10 column_size="content" %}{% endgrid %}'
        )
        self.assertIn("max-content", html)

    def test_invalid_count(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render("{% grid columns=0 %}{% endgrid %}")
