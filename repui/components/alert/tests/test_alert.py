from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase


class AlertTests(SimpleTestCase):
    def test_tone_renders_semantic_role_and_data_attribute(self):
        html = Template(
            '{% load repui %}{% alert tone="warning" %}Check{% endalert %}'
        ).render(Context())

        self.assertIn('role="alert"', html)
        self.assertIn('data-tone="warning"', html)

    def test_defaults_to_neutral_status(self):
        html = Template(
            '{% load repui %}{% alert %}Note{% endalert %}'
        ).render(Context())

        self.assertIn('role="status"', html)
        self.assertIn('data-tone="neutral"', html)

    def test_variant_remains_a_compatibility_alias(self):
        html = Template(
            '{% load repui %}{% alert variant="success" %}Done{% endalert %}'
        ).render(Context())

        self.assertIn('data-tone="success"', html)

    def test_tone_and_variant_cannot_be_combined(self):
        template = Template(
            '{% load repui %}{% alert tone="info" variant="success" %}'
            'Text{% endalert %}'
        )

        with self.assertRaises(TemplateSyntaxError):
            template.render(Context())

    def test_unknown_tone_is_rejected(self):
        template = Template(
            '{% load repui %}{% alert tone="magic" %}'
            'Text{% endalert %}'
        )

        with self.assertRaises(TemplateSyntaxError):
            template.render(Context())
