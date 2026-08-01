COMPONENT = {
    "name": "code_block",
    "title": "CodeBlock",
    "version": "1.0",
    "description": "Многострочная поверхность исходного кода с copy action.",
    "template": "repui/components/code_block/code_block.html",
    "styles": ("repui/components/code_block/code-block.css",),
    "contract_styles": ("repui/theme/contract/components/code-block-tokens.css",),
    "scripts": ("repui/components/code_block/code-block.js",),
    "runtime": {
        "required": False,
        "mount": "mountCodeBlocks",
        "contract": ("refresh", "destroy"),
    },
    "status": "experimental",
}
