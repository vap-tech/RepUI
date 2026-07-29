COMPONENT = {
    "name": "tooltip",
    "title": "Tooltip",
    "description": "Всплывающая подсказка для hover и keyboard focus.",
    "template": "repui/components/tooltip/tooltip.html",
    "styles": ("repui/components/tooltip/tooltip.css",),
    "scripts": ("repui/components/tooltip/tooltip.js",),
    "runtime": {
        "required": True,
        "mount": "mountTooltips",
        "contract": ("open", "close", "destroy"),
    },
    "status": "experimental",
}
