THEME = {
    "name": "ocean-deep",
    "title": "Ocean Deep",
    "description": "Спокойная глубоководная тема с графитово-синими поверхностями, биолюминесцентным фокусом и сдержанными бирюзовыми акцентами.",
    "version": "1.0.0",
    "schemes": ("light", "dark"),
    "styles": (
        "repui/theme/ocean-deep/palette.css",
        "repui/theme/ocean-deep/light.css",
        "repui/theme/ocean-deep/dark.css",
    ),
    "component_styles": {
        name: (f"repui/theme/ocean-deep/components/{file}",)
        for name, file in {
            "appbar": "appbar.css", "badge": "badge.css", "button": "button.css",
            "card": "card.css", "choice": "choice.css", "code_block": "code.css",
            "divider": "divider.css", "inline_code": "inline-code.css",
            "menu": "overlay.css", "menubar": "overlay.css", "select": "overlay.css",
            "autocomplete": "overlay.css", "popover": "overlay.css", "tooltip": "tooltip.css",
        }.items()
    },
    "presentation": {
        "hero": {
            "alt": "Интерфейс RepUI в теме Ocean Deep",
            "atlas": "repui/theme/media/hero-atlas.webp",
            "column": 2,
        },
        "preview": {
            "alt": "Preview темы Ocean Deep",
            "atlas": "repui/theme/media/preview-atlas.webp",
            "column": 2,
        },
    },
}
