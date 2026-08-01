COMPONENT = {
    "name": "search",
    "title": "Search",
    "version": "1.0",
    "description": "Серверная GET-форма поиска.",
    "template": "repui/components/search/search.html",
    "contract_styles": (),
    "styles": ("repui/components/search/search.css",),
    "scripts": ("repui/components/search/search.js",),
    "runtime": {
        "required": False,
        "mount": "mountSearches",
        "contract": ("refresh", "destroy"),
    },
    "status": "experimental",
}
