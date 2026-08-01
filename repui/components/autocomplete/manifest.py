COMPONENT = {
    "name": "autocomplete",
    "title": "Autocomplete",
    "description": "HTMX-friendly autocomplete: сервер рендерит options, runtime управляет listbox.",
    "template": "repui/components/autocomplete/autocomplete.html",
    "contract_styles": (),
    "styles": ("repui/components/autocomplete/autocomplete.css",),
    "scripts": ("repui/components/autocomplete/autocomplete.js",),
    "runtime": {
        "required": True,
        "mount": "mountAutocompletes",
        "contract": ("open", "close", "refresh", "choose", "destroy"),
    },
    "status": "experimental",
}
