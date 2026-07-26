from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase

class AppBarTests(SimpleTestCase):
    def render(self, source): return Template("{% load repui %}" + source).render(Context())
    def test_defaults(self):
        html=self.render("{% appbar %}Hello{% endappbar %}")
        self.assertIn('data-behavior="static"', html); self.assertIn('data-surface="default"', html); self.assertIn('<header', html)
    def test_sticky_glass(self):
        html=self.render('{% appbar behavior="sticky" surface="glass" %}Hello{% endappbar %}')
        self.assertIn('data-behavior="sticky"', html); self.assertIn('data-surface="glass"', html)
    def test_open_surface(self):
        html=self.render('{% appbar surface="admin-glass" %}Hello{% endappbar %}')
        self.assertIn('data-surface="admin-glass"', html)
    def test_invalid_behavior(self):
        with self.assertRaises(TemplateSyntaxError): self.render('{% appbar behavior="floating" %}{% endappbar %}')
    def test_empty_surface(self):
        with self.assertRaises(TemplateSyntaxError): self.render('{% appbar surface="" %}{% endappbar %}')
