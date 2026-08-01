COMPONENT = {
    "name": "dialog",
    "title": "Dialog",
    "description": "Модальное окно с focus trap и управлением Escape.",
    "styles": ("repui/components/dialog/dialog.css",),
    "scripts": ("repui/components/dialog/dialog.js",),
    "template": "repui/components/dialog/dialog.html",
    "contract_styles": (),
    "runtime": {
        "required": True,
        "mount": "mountDialogs",
        "contract": ("open", "close", "destroy"),
    },
    "status": "stable",
}
