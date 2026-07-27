from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

class IconButtonNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        content = self.nodelist.render(context).strip()
        aria_label = values.pop("aria_label", None)
        if not aria_label:
            raise TemplateSyntaxError("icon_button requires aria_label")

        href = values.pop("href", None)
        disabled = bool(values.pop("disabled", False))
        attrs = dict(values.pop("attrs", {}) or {})
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
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("icon_button arguments must use name=value")
        name, value = bit.split("=", 1)
        kwargs[name] = parser.compile_filter(value)
    nodelist = parser.parse(("endicon_button",))
    parser.delete_first_token()
    return IconButtonNode(nodelist, kwargs)

def register_tags(library: template.Library):
    library.tag("icon_button", _icon_button)
