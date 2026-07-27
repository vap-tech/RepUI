COMPONENT = {
    "name": "drawer",
    "title": "Drawer",
    "description": "Модальная или постоянная боковая панель с focus trap.",
    "template": "repui/components/drawer/drawer.html",
    "styles": ("repui/components/drawer/drawer.css",),
    "scripts": ("repui/components/drawer/drawer.js",),
    "runtime": {
        "required": True,
        "mount": "mountDrawers",
        "contract": ("open", "close", "refresh", "destroy"),
    },
    "status": "experimental",
}
