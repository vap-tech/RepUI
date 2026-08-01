COMPONENT = {
    "name": "accordion",
    "title": "Accordion",
    "version": "1.0",
    "description": "Группа явно раскрываемых секций.",
    "template": "repui/components/accordion/accordion.html",
    "contract_styles": (),
    "styles": ("repui/components/accordion/accordion.css",),
    "scripts": ("repui/components/accordion/accordion.js",),
    "runtime": {
        "required": True,
        "mount": "mountAccordions",
        "contract": ("refresh", "destroy"),
    },
    "status": "experimental",
}
