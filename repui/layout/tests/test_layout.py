from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class LayoutTests(SimpleTestCase):
    def render(self, source):
        return Template(
            "{% load repui_layout %}" + source
        ).render(Context())

    def test_root_container(self):
        html = self.render(
            "{% container %}Content{% endcontainer %}"
        )
        self.assertIn('class="rui-container"', html)

    def test_grid_has_readable_attributes(self):
        html = self.render(
            "{% grid columns=5 %}"
            "{% container column=4 %}Work{% endcontainer %}"
            "{% endgrid %}"
        )
        self.assertIn('data-columns="5"', html)
        self.assertIn('data-column="4"', html)
        self.assertIn("--rui-grid-columns:5", html)
        self.assertIn("--rui-layout-column:4", html)

    def test_stack_has_readable_attributes(self):
        html = self.render(
            "{% stack rows=20 %}"
            "{% container row=19 %}Main{% endcontainer %}"
            "{% endstack %}"
        )
        self.assertIn('data-rows="20"', html)
        self.assertIn('data-row="19"', html)

    def test_class_and_id_are_on_layout_element(self):
        html = self.render(
            '{% container id="main" class_name="docs-main" %}'
            "Content"
            "{% endcontainer %}"
        )
        self.assertIn('id="main"', html)
        self.assertIn('class="rui-container docs-main"', html)

    def test_invalid_count(self):
        with self.assertRaises(TemplateSyntaxError):
            self.render(
                "{% grid columns=0 %}{% endgrid %}"
            )
