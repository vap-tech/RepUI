from django.template import Context,Template
from django.test import SimpleTestCase

class ButtonTemplateTagTests(SimpleTestCase):
    def render(self,source,context=None):
        return Template("{% load repui %}"+source).render(Context(context or {}))

    def test_native_button_and_safe_default_type(self):
        html=self.render("{% button %}Save{% endbutton %}")
        self.assertIn("<button",html)
        self.assertIn('type="button"',html)

    def test_anchor_when_href_present(self):
        html=self.render('{% button href="/docs/" %}Docs{% endbutton %}')
        self.assertIn("<a",html)
        self.assertIn('href="/docs/"',html)

    def test_disabled_anchor_has_no_href(self):
        html=self.render('{% button href="/docs/" disabled=True %}Docs{% endbutton %}')
        self.assertIn('aria-disabled="true"',html)
        self.assertIn('tabindex="-1"',html)
        self.assertNotIn('href="/docs/"',html)

    def test_loading_is_busy_and_disabled(self):
        html=self.render("{% button loading=True %}Load{% endbutton %}")
        self.assertIn('aria-busy="true"',html)
        self.assertIn("disabled",html)
        self.assertIn("rui-button__spinner",html)

    def test_htmx_attributes(self):
        html=self.render('{% button hx_get="/fragment/" hx_target="#main" %}Load{% endbutton %}')
        self.assertIn('hx-get="/fragment/"',html)
        self.assertIn('hx-target="#main"',html)

    def test_invalid_variant_raises(self):
        with self.assertRaisesMessage(Exception,"Unknown button variant"):
            self.render('{% button variant="wat" %}Bad{% endbutton %}')
