COMPONENT = {
    "name": "dropdown_menu",
    "title": "DropdownMenu",
    "version": "1.0",
    "description": "Открывает Menu по явному trigger.",
    "template": "repui/components/dropdown_menu/dropdown_menu.html",
    "contract_styles": (),
    "styles": ("repui/components/dropdown_menu/dropdown-menu.css",),
    "scripts": ("repui/components/dropdown_menu/dropdown-menu.js",),
    "runtime": {
        "required": True,
        "mount": "mountDropdownMenus",
        "contract": ("open", "close", "destroy"),
    },
    "status": "experimental",
}
