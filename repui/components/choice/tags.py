from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string
from uuid import uuid4

register = template.Library()


def _as_bool(value, *, name):
    if isinstance(value, bool):
        return value
    if value in (None, ""):
        return False
    raise TemplateSyntaxError(f"{name} must resolve to True or False")


class ChoiceNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        label = self.nodelist.render(context).strip()
        allowed = {"type", "name", "value", "id", "class_name", "aria_label", "description", "checked", "disabled", "required"}
        unknown = set(values) - allowed
        if unknown:
            raise TemplateSyntaxError("Unknown choice arguments: " + ", ".join(sorted(unknown)))
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
                "checked": _as_bool(values.get("checked"), name="checked"),
                "disabled": _as_bool(values.get("disabled"), name="disabled"),
                "required": _as_bool(values.get("required"), name="required"),
                "root_class": root_class,
            },
            request=context.get("request"),
        )


def _choice(parser, token):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("choice arguments must use name=value")
        name, value = bit.split("=", 1)
        kwargs[name] = parser.compile_filter(value)
    nodelist = parser.parse(("endchoice",))
    parser.delete_first_token()
    return ChoiceNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("choice", _choice)
