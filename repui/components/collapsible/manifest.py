COMPONENT = {
    "name": "collapsible",
    "title": "Collapsible",
    "version": "1.0",
    "description": "Явно раскрываемая и сворачиваемая область.",
    "template": "repui/components/collapsible/collapsible.html",
    "contract_styles": (),
    "styles": ("repui/components/collapsible/collapsible.css",),
    "scripts": ("repui/components/collapsible/collapsible.js",),
    "runtime": {
        "required": True,
        "mount": "mountCollapsibles",
        "contract": ("refresh", "destroy"),
    },
    "status": "experimental",
}
