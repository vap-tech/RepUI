COMPONENT = {
    "name": "tabs",
    "title": "Tabs",
    "description": "Tablist с roving tabindex, selection и tabpanel.",
    "template": "repui/components/tabs/tabs.html",
    "contract_styles": (),
    "styles": (
        "repui/interaction/interaction.css",
        "repui/components/tabs/tabs.css",
    ),
    "scripts": ("repui/components/tabs/tabs.js",),
    "runtime": {
        "required": True,
        "mount": "mountTabs",
        "contract": ("refresh", "destroy"),
    },
    "status": "experimental",
}
