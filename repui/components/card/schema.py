CARD_SCHEMA = {
    "card": {
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
        "arguments": (
            "id",
            "class_name",
            "attrs",
            "column",
            "row",
        ),
    },
    "card_header": {
        "arguments": ("id", "class_name", "attrs"),
    },
    "card_body": {
        "arguments": ("id", "class_name", "attrs"),
    },
    "card_footer": {
        "arguments": ("id", "class_name", "attrs"),
    },
}
