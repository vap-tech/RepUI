COMPONENT = {
    "name": "toast",
    "title": "Toast",
    "description": "Временное всплывающее уведомление.",
    "styles": ("repui/components/toast/toast.css",),
    "scripts": ("repui/components/toast/toast.js",),
    "template": "repui/components/toast/toast.html",
    "contract_styles": (),
    "runtime": {
        "required": True,
        "mount": "mountToasts",
        "contract": ("show", "close", "destroy"),
    },
    "status": "stable",
}
