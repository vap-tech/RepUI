COMPONENT = {
    "name": "select",
    "title": "Select",
    "description": "Select для Django forms с native source of truth.",
    "template": "repui/components/select/select_tag.html",
    "styles": (
        "repui/theme/default/select-tokens.css",
        "repui/components/select/select.css",
    ),
    "scripts": (
        "repui/components/select/select.js",
    ),
    "runtime": {
        "required": True,
        "mount": "mountSelects",
        "contract": (
            "open",
            "close",
            "toggle",
            "focus",
            "refresh",
            "destroy",
            "value",
        ),
    },
    "status": "stable",
}
