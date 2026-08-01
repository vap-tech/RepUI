from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

_TONES = {"neutral", "info", "success", "warning", "danger"}


class AlertNode(Node):
    def __init__(self, values, nodelist):
        self.values, self.nodelist = values, nodelist

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.values.items()}
        tone = values.get("tone")
        legacy_variant = values.get("variant")
        if tone is not None and legacy_variant is not None:
            raise TemplateSyntaxError(
                "alert accepts either tone or variant, not both"
            )
        tone = tone or legacy_variant or "neutral"
        if tone not in _TONES:
            allowed = ", ".join(sorted(_TONES))
            raise TemplateSyntaxError(
                f"alert.tone must be one of: {allowed}"
            )
        return render_to_string(
            "repui/components/alert/alert.html",
            {
                **values,
                "tone": tone,
                "content": self.nodelist.render(context).strip(),
            },
            request=context.get("request"),
        )


def _alert(parser, token):
    values = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("alert arguments must use name=value")
        key, value = bit.split("=", 1)
        if key not in {"tone", "variant", "title", "description", "icon", "dismissible"}:
            raise TemplateSyntaxError(f"Unknown alert argument: {key}")
        values[key] = parser.compile_filter(value)
    node_list = parser.parse(("endalert",))
    parser.delete_first_token()
    return AlertNode(values, node_list)


def register_tags(library):
    library.tag("alert", _alert)
