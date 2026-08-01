from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from uuid import uuid4

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)

register = template.Library()


class CheckboxNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        content = self.nodelist.render(context).strip()

        allowed = {
            "id", "name", "value", "class_name", "aria_label", "title",
            "checked", "disabled", "required",
        }
        reject_unknown(values, allowed, component="checkbox")

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

        choice_id = attrs.pop("id", None) or f"rui-checkbox-{uuid4().hex}"
        root_class = attrs.pop("class", "")
        return render_to_string(
            "repui/components/choice/choice_tag.html",
            {
                "type": "checkbox",
                "id": choice_id,
                "name": attrs.pop("name", None),
                "value": attrs.pop("value", None),
                "label": content,
                "aria_label": attrs.pop("aria-label", None),
                "description": "",
                "description_id": None,
                "attrs": attrs,
                "checked": resolve_bool(values.get("checked"), name="checked"),
                "disabled": resolve_bool(values.get("disabled"), name="disabled"),
                "required": resolve_bool(values.get("required"), name="required"),
                "root_class": root_class,
            },
            request=context.get("request"),
        )


def _checkbox(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endcheckbox",))
    parser.delete_first_token()
    return CheckboxNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("checkbox", _checkbox)
