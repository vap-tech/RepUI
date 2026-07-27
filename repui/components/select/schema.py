SELECT_SCHEMA = {
    "required": ("name",),
    "boolean": ("multiple", "disabled", "required", "readonly", "autofocus"),
    "size": {"default": "md", "choices": ("sm", "md", "lg")},
}

SELECT_OPTION_SCHEMA = {
    "required": ("value",),
    "boolean": ("selected", "disabled"),
}
