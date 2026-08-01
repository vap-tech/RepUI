THEME = {
    "name": "default",
    "title": "RepUI Core",
    "description": "Официальная тема RepUI с графитовыми поверхностями, нефритовыми взаимодействиями и голубым фокусом.",
    "version": "1.0",
    "schemes": ("light", "dark"),
    "styles": (
        "repui/theme/default/palette.css",
        "repui/theme/default/light.css",
        "repui/theme/default/dark.css",
    ),
    "component_styles": {
        "button": ("repui/theme/default/components/button.css",),
        "appbar": ("repui/theme/default/components/appbar.css",),
        "card": ("repui/theme/default/components/card.css",),
        "choice": ("repui/theme/default/components/choice.css",),
        "inline_code": ("repui/theme/default/components/inline-code.css",),
        "menu": ("repui/theme/default/components/overlay.css", "repui/theme/default/components/menu.css"),
        "select": ("repui/theme/default/components/overlay.css", "repui/theme/default/components/select.css"),
        "popover": ("repui/theme/default/components/overlay.css",),
        "autocomplete": ("repui/theme/default/components/overlay.css",),
        "tooltip": ("repui/theme/default/components/tooltip.css",),
    },
    "presentation": {
        "hero": {
            "alt": "Интерфейс RepUI в официальной теме",
            "atlas": "repui/theme/media/hero-atlas.webp",
            "column": 0,
        },
        "preview": {
            "alt": "Preview официальной темы RepUI",
            "atlas": "repui/theme/media/preview-atlas.webp",
            "column": 0,
        },
    },
}
