COMPONENT = {
    "name": "dialog",
    "title": "Dialog",
    "description": "Модальное окно с focus trap и управлением Escape.",
    "styles": ("repui/components/dialog/dialog.css",),
    "scripts": ("repui/core/dialog.js",),
    "template": "repui/components/dialog/dialog.html",
    "runtime": {"mount": "mountDialogs", "contract": ("open", "close", "destroy")},
    "status": "stable",
}
