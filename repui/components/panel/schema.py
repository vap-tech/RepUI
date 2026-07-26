PANEL_SCHEMA = {
    "surface": {
        "default": "default",
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
    "layout": ("column", "row"),
}
