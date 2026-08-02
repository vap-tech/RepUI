from pathlib import Path

from django.test import SimpleTestCase


class SelectSourceContractTests(SimpleTestCase):
    def test_no_auto_mount(self):
        source = (
            Path(__file__).resolve().parents[3]
            / "static/repui/components/select/select.js"
        ).read_text(encoding="utf-8")

        self.assertNotIn("DOMContentLoaded", source)
        self.assertNotIn("window.", source)
        self.assertIn("export function mountSelects", source)

    def test_native_events_are_dispatched(self):
        select_source = (
            Path(__file__).resolve().parents[3]
            / "static/repui/components/select/select.js"
        ).read_text(encoding="utf-8")
        adapter_source = (
            Path(__file__).resolve().parents[3]
            / "static/repui/interaction/native-select-adapter.js"
        ).read_text(encoding="utf-8")

        self.assertIn("NativeSelectAdapter", select_source)
        self.assertIn('"rui:change"', select_source)
        self.assertIn('new Event("input"', adapter_source)
        self.assertIn('new Event("change"', adapter_source)
