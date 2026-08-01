COMPONENT = {
    "name": "pagination",
    "title": "Pagination",
    "version": "1.0",
    "description": "Навигация по страницам без владения URL.",
    "template": "repui/components/pagination/pagination.html",
    "contract_styles": (),
    "styles": ("repui/components/pagination/pagination.css",),
    "scripts": ("repui/components/pagination/pagination.js",),
    "runtime": {
        "required": False,
        "mount": "mountPaginations",
        "contract": ("refresh", "destroy"),
    },
    "status": "experimental",
}
