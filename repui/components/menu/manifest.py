COMPONENT = {
    "name": "menu",
    "title": "Menu",
    "description": "Группа menuitem с roving tabindex и явным mount.",
    "template": "repui/components/menu/menu.html",
    "contract_styles": (
        "repui/theme/contract/components/menu-tokens.css",
    ),
    "styles": (
        "repui/interaction/interaction.css",
        "repui/components/menu/menu.css",
    ),
    "scripts": ("repui/components/menu/menu.js",),
    "runtime": {
        "required": True,
        "mount": "mountMenus",
        "contract": ("refresh", "destroy"),
    },
    "status": "experimental",
}
