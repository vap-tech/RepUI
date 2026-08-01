from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)

_TONES = {"neutral", "info", "success", "warning", "danger"}


class AlertNode(Node):
    def __init__(self, values, nodelist):
        self.values, self.nodelist = values, nodelist

    def render(self, context):
        values = resolve_arguments(self.values, context)
        reject_unknown(
            values,
            {"tone", "variant", "title", "description", "icon", "dismissible"},
            component="alert",
        )
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
    values = compile_keyword_arguments(parser, token)
    node_list = parser.parse(("endalert",))
    parser.delete_first_token()
    return AlertNode(values, node_list)


def register_tags(library):
    library.tag("alert", _alert)
