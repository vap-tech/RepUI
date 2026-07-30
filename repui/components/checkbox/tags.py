from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

register = template.Library()


class CheckboxNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        content = self.nodelist.render(context).strip()

        allowed = {
            "id", "name", "value", "class_name", "aria_label", "title",
            "checked", "disabled", "required",
        }
        unknown = set(values) - allowed
        if unknown:
            raise TemplateSyntaxError(
                "Unknown checkbox arguments: " + ", ".join(sorted(unknown))
            )

        attrs = {}
        aliases = {
            "class_name": "class",
            "aria_label": "aria-label",
        }
        for key in ("id", "name", "value", "title"):
            if values.get(key) is not None:
                attrs[key] = values[key]
        for key, html_name in aliases.items():
            if values.get(key) is not None:
                attrs[html_name] = values[key]

        return render_to_string(
            "repui/components/checkbox/checkbox_tag.html",
            {
                "content": content,
                "attrs": attrs,
                "checked": bool(values.get("checked", False)),
                "disabled": bool(values.get("disabled", False)),
                "required": bool(values.get("required", False)),
            },
            request=context.get("request"),
        )


def _checkbox(parser, token):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("checkbox arguments must use name=value")
        name, value = bit.split("=", 1)
        kwargs[name] = parser.compile_filter(value)
    nodelist = parser.parse(("endcheckbox",))
    parser.delete_first_token()
    return CheckboxNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("checkbox", _checkbox)
