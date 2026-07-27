from django.test import SimpleTestCase

from repui.components.select.manifest import COMPONENT


class SelectManifestTests(SimpleTestCase):
    def test_runtime_contract(self):
        self.assertTrue(COMPONENT["runtime"]["required"])
        self.assertEqual(
            COMPONENT["runtime"]["mount"],
            "mountSelects",
        )

    def test_assets(self):
        self.assertIn(
            "repui/components/select/select.css",
            COMPONENT["styles"],
        )
        self.assertEqual(
            COMPONENT["scripts"],
            ("repui/components/select/select.js",),
        )
