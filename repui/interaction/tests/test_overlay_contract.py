from pathlib import Path

from django.test import SimpleTestCase


ROOT = Path(__file__).resolve().parents[1].parent / "static" / "repui"


class OverlayContractTests(SimpleTestCase):
    def read(self, relative):
        return (ROOT / relative).read_text(encoding="utf-8")

    def test_portal_owns_geometry_not_dismissal(self):
        source = self.read("interaction/overlay-portal.js")
        for method in ("mount", "activate", "deactivate", "unmount", "destroy"):
            self.assertIn(f"{method}(", source)
        self.assertIn("onAnchorHidden", source)
        self.assertNotIn("onRequestClose", source)
        self.assertNotIn('document.addEventListener("keydown"', source)
        self.assertNotIn('document.addEventListener("pointerdown"', source)

    def test_dismiss_layer_owns_global_dismiss_events(self):
        source = self.read("interaction/dismiss-layer.js")
        self.assertIn("createDismissLayer", source)
        self.assertIn('reason: "outside-pointer"', source)
        self.assertIn('reason: "escape"', source)
        self.assertIn("destroy()", source)

    def test_overlay_consumers_no_longer_use_legacy_callback(self):
        component_paths = (
            "components/select/select.js",
            "components/tooltip/tooltip.js",
            "components/popover/popover.js",
            "components/autocomplete/autocomplete.js",
            "components/combobox/component.js",
            "components/dropdown_menu/dropdown-menu.js",
        )
        for relative in component_paths:
            self.assertNotIn("onRequestClose", self.read(relative), relative)
