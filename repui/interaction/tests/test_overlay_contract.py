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

    def test_overlay_stack_owns_escape_for_the_topmost_layer(self):
        source = self.read("interaction/overlay-stack.js")
        self.assertIn("createOverlayStackEntry", source)
        self.assertIn('event.key !== "Escape"', source)
        self.assertIn("entries.at(-1)", source)
        self.assertIn("stopImmediatePropagation", source)

    def test_overlay_consumers_delegate_escape_to_the_stack(self):
        component_paths = (
            "components/select/select.js",
            "components/tooltip/tooltip.js",
            "components/popover/popover.js",
            "components/autocomplete/autocomplete.js",
            "components/combobox/combobox.js",
            "components/dropdown_menu/dropdown-menu.js",
            "components/menubar/menubar.js",
            "components/dialog/dialog.js",
            "components/drawer/drawer.js",
            "components/command_palette/command-palette.js",
        )
        for relative in component_paths:
            source = self.read(relative)
            self.assertIn("createOverlayStackEntry", source, relative)
        for relative in component_paths[:7]:
            self.assertIn("escape:false", self.read(relative).replace(" ", ""), relative)

    def test_overlay_consumers_no_longer_use_legacy_callback(self):
        component_paths = (
            "components/select/select.js",
            "components/tooltip/tooltip.js",
            "components/popover/popover.js",
            "components/autocomplete/autocomplete.js",
            "components/combobox/combobox.js",
            "components/dropdown_menu/dropdown-menu.js",
        )
        for relative in component_paths:
            self.assertNotIn("onRequestClose", self.read(relative), relative)

    def test_legacy_runtime_entrypoints_are_absent(self):
        legacy_paths = (
            "core/collection.js",
            "core/popup.js",
            "components/listbox/component.js",
            "components/menu/component.js",
            "components/select/component.js",
            "components/sheet/component.js",
        )
        for relative in legacy_paths:
            self.assertFalse((ROOT / relative).exists(), relative)

    def test_runtime_bootstrap_owns_htmx_lifecycle(self):
        source = self.read("runtime/bootstrap.js")
        self.assertIn("installRuntime", source)
        self.assertIn("RUNTIME_ADAPTERS", source)
        self.assertIn("const installations = new WeakMap()", source)
        self.assertIn("installations.get(root)", source)
        self.assertIn("installations.delete(root)", source)
        self.assertIn('"htmx:afterSwap"', source)
        self.assertIn('"htmx:beforeCleanupElement"', source)
        self.assertIn("destroyWithin", source)
        self.assertIn("const node = instance?.element", source)
        self.assertNotIn("function nodeFor", source)

        self_managing = (
            "components/autocomplete/autocomplete.js",
            "components/drawer/drawer.js",
            "components/navbar/navbar.js",
            "components/tooltip/tooltip.js",
            "components/tree/tree.js",
        )
        for relative in self_managing:
            self.assertNotIn("htmx:afterSwap", self.read(relative), relative)

    def test_composites_do_not_destroy_shared_menu_runtime(self):
        source = self.read("components/dropdown_menu/dropdown-menu.js")
        self.assertNotIn("this.menuRuntime.destroy()", source)
        menu = self.read("components/menu/menu.js")
        self.assertIn("must be mounted before a composite consumer", menu)

    def test_select_creates_dismiss_layer_only_while_open(self):
        source = self.read("components/select/select.js")
        self.assertIn("this.dismiss = null", source)
        self.assertIn("this.dismiss = createDismissLayer", source)
        self.assertIn("this.dismiss?.destroy()", source)
