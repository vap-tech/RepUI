THEME = {
    "name": "ocean-deep",
    "title": "Ocean Deep",
    "description": "A calm deep-sea theme with graphite-blue surfaces, bioluminescent cyan focus and restrained teal interactions.",
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
}

