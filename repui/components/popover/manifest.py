COMPONENT = {
    "name": "popover",
    "title": "Popover",
    "version": "1.0",
    "description": "Произвольное всплывающее содержимое, привязанное к trigger.",
    "template": "repui/components/popover/popover.html",
    "contract_styles": (),
    "styles": ("repui/components/popover/popover.css",),
    "scripts": ("repui/components/popover/popover.js",),
    "runtime": {
        "required": True,
        "mount": "mountPopovers",
        "contract": ("open", "close", "refresh", "destroy"),
    },
    "status": "experimental",
}
