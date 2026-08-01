COMPONENT = {
    "name": "navbar",
    "title": "Navbar",
    "description": "Навигационная область с нативными ссылками и опциональным roving focus.",
    "template": "repui/components/navbar/navbar.html",
    "contract_styles": (),
    "styles": ("repui/components/navbar/navbar.css",),
    "scripts": ("repui/components/navbar/navbar.js",),
    "runtime": {
        "required": False,
        "mount": "mountNavbars",
        "contract": ("refresh", "destroy"),
    },
    "status": "experimental",
}
