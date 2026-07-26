BUTTON_SCHEMA = {
    "variant": {"default": "filled", "choices": ("filled", "outlined", "text", "soft")},
    "color": {"default": "default", "choices": ("default", "primary", "secondary", "success", "warning", "danger")},
    "size": {"default": "md", "choices": ("xs", "sm", "md", "lg", "xl")},
    "boolean": ("disabled", "loading", "full_width", "icon_only"),
}
