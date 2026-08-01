COMPONENT = {
    "name": "chip",
    "title": "Chip",
    "description": "Компактный интерактивный маркер с необязательным удалением.",
    "template": "repui/components/chip/chip.html",
    "contract_styles": (),
    "styles": (
        "repui/interaction/interaction.css",
        "repui/components/chip/chip.css",
    ),
    "scripts": ("repui/components/chip/chip.js",),
    "runtime": {
        "required": False,
        "mount": "mountChips",
        "contract": ("destroy",),
    },
    "status": "experimental",
}
