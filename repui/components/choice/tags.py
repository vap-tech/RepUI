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


class ChoiceNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        label = self.nodelist.render(context).strip()
        allowed = {"type", "name", "value", "id", "class_name", "aria_label", "description", "checked", "disabled", "required"}
        reject_unknown(values, allowed, component="choice")
        choice_type = str(values.get("type", "radio"))
        if choice_type not in {"radio", "checkbox"}:
            raise TemplateSyntaxError("choice type must be radio or checkbox")
        if not label and not values.get("aria_label"):
            raise TemplateSyntaxError("choice requires label content or aria_label")
        attrs = {}
        root_class = values.get("class_name", "")
        choice_id = values.get("id") or f"rui-choice-{uuid4().hex}"
        name = values.get("name")
        if choice_type == "radio" and not name:
            raise TemplateSyntaxError("radio choice requires a non-empty name")
        if values.get("description"):
            attrs["aria-describedby"] = f"{choice_id}-description"
        return render_to_string(
            "repui/components/choice/choice_tag.html",
            {
                "type": choice_type,
                "id": choice_id,
                "name": name,
                "value": values.get("value"),
                "aria_label": values.get("aria_label"),
                "label": label,
                "description": values.get("description", ""),
                "description_id": f"{choice_id}-description",
                "attrs": attrs,
                "checked": resolve_bool(values.get("checked"), name="checked"),
                "disabled": resolve_bool(values.get("disabled"), name="disabled"),
                "required": resolve_bool(values.get("required"), name="required"),
                "root_class": root_class,
            },
            request=context.get("request"),
        )


def _choice(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endchoice",))
    parser.delete_first_token()
    return ChoiceNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("choice", _choice)
