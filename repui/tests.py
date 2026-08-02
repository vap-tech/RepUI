from django.template import Context, Template, TemplateSyntaxError
from django.test import SimpleTestCase
from pathlib import Path
from unittest.mock import patch

from repui import component_registry, theme_registry
from repui.component_manifest import validate_component_manifest
from repui.theme_manifest import validate_theme_manifest
from repui.component_registry import get_component_manifest, list_component_names
from repui.templatetags.repui_css import _render_css
from repui.theme_registry import get_theme, get_theme_assets, list_themes


class ThemeRegistryTests(SimpleTestCase):
    def test_theme_bootstrap_and_registry(self):
        html = Template(
            "{% load repui_theme %}{% repui_theme_head %}"
        ).render(Context())
        self.assertIn('"default"', html)
        self.assertIn('"mineral"', html)
        self.assertIn('"ocean-deep"', html)
        self.assertIn("ruiAvailableThemes", html)
        self.assertEqual(list_themes(), ("default", "mineral", "ocean-deep"))
        self.assertEqual(get_theme("mineral")["name"], "mineral")
        self.assertEqual(get_theme("ocean-deep")["title"], "Ocean Deep")

    def test_unknown_theme_falls_back_to_default(self):
        self.assertEqual(get_theme_assets("unknown"), get_theme_assets("default"))

    def test_theme_registry_propagates_nested_module_errors(self):
        error = ModuleNotFoundError("missing nested dependency")
        error.name = "repui.themes.mineral.tokens"
        with patch.object(theme_registry, "import_module", side_effect=error):
            with self.assertRaises(ModuleNotFoundError):
                theme_registry.get_theme("mineral")

    def test_component_css_loader_propagates_nested_module_errors(self):
        error = ModuleNotFoundError("missing nested dependency")
        error.name = "repui.components.button.dependencies"
        with patch.object(
            component_registry,
            "import_module",
            side_effect=error,
        ):
            with self.assertRaises(ModuleNotFoundError):
                get_component_manifest("button")

    def test_all_component_manifests_follow_the_canonical_contract(self):
        for name in list_component_names():
            with self.subTest(component=name):
                self.assertEqual(
                    validate_component_manifest(
                        name,
                        get_component_manifest(name),
                    ),
                    [],
                )

    def test_all_theme_manifests_follow_the_canonical_contract(self):
        for name in list_themes():
            with self.subTest(theme=name):
                self.assertEqual(
                    validate_theme_manifest(name, get_theme(name)),
                    [],
                )

    def test_theme_manifest_rejects_invalid_presentation(self):
        manifest = {
            "name": "example",
            "title": "Example",
            "description": "Example theme",
            "version": "1.0",
            "schemes": ("light",),
            "styles": (),
            "component_styles": {},
            "presentation": {
                "hero": {"alt": "Hero", "atlas": "hero.webp", "column": -1},
            },
        }
        errors = validate_theme_manifest("example", manifest)
        self.assertIn(
            "presentation.hero.column must be a non-negative integer",
            errors,
        )
        self.assertIn("presentation.preview must be a dict", errors)

    def test_component_manifests_use_contract_styles_not_default_theme_paths(self):
        component_root = Path(__file__).resolve().parent / "components"
        for manifest_path in component_root.glob("*/manifest.py"):
            source = manifest_path.read_text(encoding="utf-8")
            self.assertNotIn("theme_styles", source, manifest_path)
            self.assertNotIn(
                '"repui/theme/default/',
                source,
                manifest_path,
            )

    def test_loader_uses_selected_theme_and_contract(self):
        html = _render_css(("card",), "mineral")
        self.assertIn("repui/theme/mineral/palette.css", html)
        self.assertIn("repui/theme/mineral/light.css", html)
        self.assertIn("repui/theme/mineral/dark.css", html)
        self.assertIn("repui/theme/contract/components/card-tokens.css", html)

    def test_ocean_deep_loader_includes_component_overrides(self):
        html = _render_css(("card", "tooltip"), "ocean-deep")
        self.assertIn("repui/theme/ocean-deep/palette.css", html)
        self.assertIn("repui/theme/ocean-deep/components/card.css", html)
        self.assertIn("repui/theme/ocean-deep/components/tooltip.css", html)

    def test_loader_can_include_assets_for_every_registered_theme(self):
        html = _render_css(
            ("card",),
            include_all_themes=True,
        )
        self.assertIn("repui/theme/mineral/palette.css", html)
        self.assertIn("repui/theme/ocean-deep/palette.css", html)

    def test_ocean_deep_assets_exist_and_use_theme_layer(self):
        root = Path(__file__).resolve().parent / "static"
        theme = get_theme("ocean-deep")
        assets = list(theme["styles"])
        for component_assets in theme["component_styles"].values():
            assets.extend(component_assets)

        for asset in assets:
            path = root / asset
            self.assertTrue(path.is_file(), asset)
            source = path.read_text(encoding="utf-8")
            self.assertIn("@layer repui.theme", source)
            self.assertNotIn("[data-theme=", source)
            self.assertIn('data-rui-theme="ocean-deep"', source)


class TemplateTagContractTests(SimpleTestCase):
    def test_button_rejects_duplicate_arguments(self):
        with self.assertRaisesRegex(
            TemplateSyntaxError,
            "duplicate argument: size",
        ):
            Template(
                "{% load repui %}"
                "{% button size='sm' size='lg' %}Save{% endbutton %}"
            ).render(Context())

    def test_form_controls_reject_string_booleans(self):
        for source in (
            "{% checkbox checked='false' %}Terms{% endcheckbox %}",
            "{% choice type='checkbox' checked='false' %}Terms{% endchoice %}",
            "{% select name='city' disabled='false' %}{% endselect %}",
        ):
            with self.subTest(source=source):
                with self.assertRaisesRegex(
                    TemplateSyntaxError,
                    "must resolve to True or False",
                ):
                    Template("{% load repui %}" + source).render(Context())

    def test_migrated_tags_reject_duplicate_arguments(self):
        for source in (
            "{% alert tone='info' tone='success' %}Text{% endalert %}",
            "{% badge size='sm' size='md' %}New{% endbadge %}",
            "{% chip value='a' value='b' %}Django{% endchip %}",
            "{% accordion id='first' id='second' %}{% endaccordion %}",
            "{% toast title='One' title='Two' %}Text{% endtoast %}",
            "{% dialog id='first' id='second' %}{% enddialog %}",
            "{% tooltip title='One' title='Two' %}Text{% endtooltip %}",
            "{% page id='first' id='second' %}{% endpage %}",
            "{% card width='content' width='full' %}{% endcard %}",
            "{% tabs id='first' id='second' %}{% endtabs %}",
        ):
            with self.subTest(source=source):
                with self.assertRaisesRegex(
                    TemplateSyntaxError,
                    "duplicate argument",
                ):
                    Template("{% load repui %}" + source).render(Context())

    def test_badge_and_chip_reject_string_booleans(self):
        for source in (
            "{% badge dot='false' %}New{% endbadge %}",
            "{% chip disabled='false' %}Django{% endchip %}",
        ):
            with self.subTest(source=source):
                with self.assertRaisesRegex(
                    TemplateSyntaxError,
                    "must resolve to True or False",
                ):
                    Template("{% load repui %}" + source).render(Context())

    def test_migrated_block_tags_reject_string_booleans(self):
        for source in (
            "{% code_block copy='false' %}code{% endcode_block %}",
            "{% collapsible open='false' %}Text{% endcollapsible %}",
            "{% list ordered='false' %}Text{% endlist %}",
            "{% tab panel='details' selected='false' %}Details{% endtab %}",
            "{% listbox_option value='one' disabled='false' %}One{% endlistbox_option %}",
        ):
            with self.subTest(source=source):
                with self.assertRaisesRegex(
                    TemplateSyntaxError,
                    "must resolve to True or False",
                ):
                    Template("{% load repui %}" + source).render(Context())


class HeroAndThemePreviewTests(SimpleTestCase):
    def test_hero_renders_slots_and_placeholder(self):
        html = Template(
            "{% load repui %}"
            "{% hero title='Заголовок' %}"
            "{% hero_eyebrow %}Eyebrow{% endhero_eyebrow %}"
            "{% hero_description %}Описание{% endhero_description %}"
            "{% hero_actions %}Действие{% endhero_actions %}"
            "{% endhero %}"
        ).render(Context())
        self.assertIn('class="rui-hero"', html)
        self.assertIn("Заголовок", html)
        self.assertIn("Eyebrow", html)
        self.assertIn("Описание", html)
        self.assertIn("rui-hero__placeholder", html)

    def test_hero_requires_title(self):
        with self.assertRaises(Exception):
            Template("{% load repui %}{% hero %}{% endhero %}").render(Context())

    def test_theme_preview_renders_metadata(self):
        html = Template(
            "{% load repui %}"
            "{% theme_preview name='ocean-deep' title='Ocean Deep' badge='Dark-first' %}"
            "Действие"
            "{% endtheme_preview %}"
        ).render(Context())
        self.assertIn('data-theme-name="ocean-deep"', html)
        self.assertIn("Ocean Deep", html)
        self.assertIn("Dark-first", html)
        self.assertIn("Действие", html)
