COMPONENT = {
    "name": "listbox",
    "title": "Listbox",
    "description": "Standalone список options с active/selected и keyboard navigation.",
    "styles": ("repui/interaction/interaction.css", "repui/components/listbox/listbox.css"),
    "scripts": ("repui/components/listbox/listbox.js",),
    "template": "repui/components/listbox/listbox.html",
    "runtime": {"mount": "mountListboxes", "contract": ("refresh", "select", "destroy")},
    "status": "stable",
}
