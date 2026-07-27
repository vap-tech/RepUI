from pathlib import Path

from django.test import SimpleTestCase

from repui.components.button.manifest import COMPONENT


class ButtonRuntimeContractTests(SimpleTestCase):
    def test_manifest_declares_optional_runtime(self):
        self.assertEqual(
            COMPONENT["scripts"],
            ("repui/components/button/button.js",),
        )
        self.assertFalse(COMPONENT["runtime"]["required"])
        self.assertEqual(
            COMPONENT["runtime"]["mount"],
            "mountButtons",
        )

    def test_runtime_does_not_emulate_native_activation(self):
        js_path = (
            Path(__file__).resolve().parents[3]
            / "static/repui/components/button/button.js"
        )
        source = js_path.read_text(encoding="utf-8")

        self.assertNotIn('addEventListener("click"', source)
        self.assertNotIn('addEventListener("keydown"', source)
        self.assertIn("refresh()", source)
        self.assertIn("destroy()", source)
