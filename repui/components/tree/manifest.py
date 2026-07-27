COMPONENT = {
    "name": "tree",
    "title": "Tree",
    "description": "Иерархический treeview с roving focus и раскрытием узлов.",
    "template": "repui/components/tree/tree.html",
    "styles": ("repui/components/tree/tree.css",),
    "scripts": ("repui/components/tree/tree.js",),
    "runtime": {
        "required": True,
        "mount": "mountTrees",
        "contract": ("refresh", "focus", "toggle", "destroy"),
    },
    "status": "experimental",
}
