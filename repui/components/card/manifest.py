COMPONENT = {
    "name": "card",
    "title": "Card",
    "version": "1.0",
    "description": "Оформленная поверхность с необязательными Header, Body и Footer.",
    "template": "repui/components/card/card.html",
    "styles": (
        "repui/components/card/card.css",
    ),
    "scripts": (),
    "runtime": False,
    "htmx": {
        "inner_html": True,
        "outer_html": True,
        "mount_required": False,
        "cleanup_required": False,
    },
    "api": {
        "surface": {
            "default": "card",
            "open": True,
        },
        "width": {
            "default": "content",
            "choices": ("content", "full"),
        },
        "height": {
            "default": "content",
            "choices": ("content", "full"),
        },
        "overflow": {
            "default": "visible",
            "choices": ("visible", "auto", "hidden"),
        },
    },
    "anatomy": (
        "card",
        "card_surface",
        "card_header",
        "card_body",
        "card_footer",
    ),
    "tokens": {
        "consumes": {
            "--rui-card-background": {
                "type": "color",
                "fallback": "--rui-color-surface",
            },
            "--rui-card-foreground": {
                "type": "color",
                "fallback": "--rui-color-text",
            },
            "--rui-card-border": {
                "type": "border",
                "fallback": "1px solid var(--rui-color-border)",
            },
            "--rui-card-radius": {
                "type": "length",
                "fallback": "--rui-radius-lg",
            },
            "--rui-card-shadow": {
                "type": "shadow",
                "fallback": "none",
            },
            "--rui-card-padding": {
                "type": "spacing",
                "fallback": "--rui-space-4",
            },
            "--rui-card-gap": {
                "type": "spacing",
                "fallback": "--rui-space-3",
            },
            "--rui-card-divider": {
                "type": "border-color",
                "fallback": "--rui-color-border",
            },
            "--rui-card-header-padding": {
                "type": "spacing",
                "fallback": "--rui-card-padding",
            },
            "--rui-card-body-padding": {
                "type": "spacing",
                "fallback": "--rui-card-padding",
            },
            "--rui-card-footer-padding": {
                "type": "spacing",
                "fallback": "--rui-card-padding",
            },
            "--rui-card-transition": {
                "type": "time",
                "fallback": "180ms ease",
            },
        },
        "produces": {},
    },
    "status": "stable",
}
