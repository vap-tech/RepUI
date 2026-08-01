from django.template import Context, Template
from django.test import SimpleTestCase
from pathlib import Path

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
        self.assertEqual(list_themes(), ("default", "mineral", "ocean-deep"))
        self.assertEqual(get_theme("mineral")["name"], "mineral")
        self.assertEqual(get_theme("ocean-deep")["title"], "Ocean Deep")

    def test_unknown_theme_falls_back_to_default(self):
        self.assertEqual(get_theme_assets("unknown"), get_theme_assets("default"))

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
