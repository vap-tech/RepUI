COMPONENT = {
    "name": "combobox",
    "title": "Combobox",
    "description": "Ввод с фильтрацией и выбором одного значения.",
    "contract_styles": (),
    "styles": (
        "repui/components/combobox/component.css",
    ),
    "scripts": ("repui/components/combobox/component.js",),
    "template": "repui/components/combobox/combobox.html",
    "runtime": {
        "required": True,
        "mount": "mountComboboxes",
        "contract": ("refresh", "destroy"),
    },
    "status": "experimental",
}
