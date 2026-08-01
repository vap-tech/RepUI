from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    extract_html_attrs,
    resolve_arguments,
    resolve_bool,
)

class IconButtonNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        content = self.nodelist.render(context).strip()
        aria_label = values.pop("aria_label", None)
        if not aria_label:
            raise TemplateSyntaxError("icon_button requires aria_label")

        href = values.pop("href", None)
        disabled = resolve_bool(values.pop("disabled", False), name="disabled")
        attrs = extract_html_attrs(values, {
            "rui_menu_trigger": "data-rui-menu-trigger",
            "rui_menu_context": "data-rui-menu-context",
            "chat_id": "data-chat-id",
            "rui_theme_toggle": "data-rui-theme-toggle",
        })
        class_name = values.pop("class_name", None)
        element_id = values.pop("id", None)
        if values:
            raise TemplateSyntaxError("Unknown icon_button arguments: " + ", ".join(sorted(values)))

        if element_id:
            attrs["id"] = element_id

        return render_to_string(
            "repui/components/icon_button/icon_button_tag.html",
            {
                "content": content,
                "aria_label": aria_label,
                "href": href,
                "disabled": disabled,
                "attrs": attrs,
                "class_name": class_name,
            },
            request=context.get("request"),
        )

def _icon_button(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endicon_button",))
    parser.delete_first_token()
    return IconButtonNode(nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("icon_button", _icon_button)
