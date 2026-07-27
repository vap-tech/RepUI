COMPONENT = {
    "name": "button",
    "title": "Button",
    "description": "Кнопка или ссылка, использующая semantic и component tokens.",
    "template": "repui/components/button/button.html",
    "styles": (
        "repui/components/button/button.css",
    ),
    "scripts": (
        "repui/components/button/button.js",
    ),
    "runtime": {
        "required": False,
        "mount": "mountButtons",
        "contract": ("refresh", "destroy"),
    },
    "status": "stable",
}
