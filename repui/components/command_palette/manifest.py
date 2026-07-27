COMPONENT = {
    "name": "command_palette",
    "title": "Command Palette",
    "description": "Поиск и запуск команд с keyboard navigation.",
    "styles": ("repui/components/command_palette/command-palette.css",),
    "scripts": ("repui/components/command_palette/command-palette.js",),
    "template": "repui/components/command_palette/command_palette.html",
    "runtime": {"mount": "mountCommandPalettes", "contract": ("open", "close", "destroy")},
    "status": "experimental",
}
