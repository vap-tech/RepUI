COMPONENT = {
    "name": "menubar",
    "title": "Menubar",
    "description": "Горизонтальная строка меню с выпадающими Menu.",
    "template": "repui/components/menubar/menubar.html",
    "contract_styles": (),
    "styles": ("repui/components/menubar/menubar.css",),
    "scripts": ("repui/components/menubar/menubar.js",),
    "runtime": {
        "required": True,
        "mount": "mountMenubars",
        "contract": ("refresh", "focusFirst", "focusLast", "destroy"),
    },
    "status": "experimental",
}
