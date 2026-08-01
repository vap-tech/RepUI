from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)

_SPECS = {
    "autocomplete": {
        "allowed": {
            "name", "value", "label", "placeholder", "required", "disabled",
            "readonly", "aria_label", "input_attrs", "class_name", "attrs",
        },
        "required": {"name"},
    },
    "autocomplete_option": {
        "allowed": {"value", "selected", "disabled", "keywords", "class_name", "attrs"},
        "required": {"value"},
    },
}


def _parse_kwargs(parser, token, tag_name):
    spec = _SPECS[tag_name]
    kwargs = compile_keyword_arguments(parser, token)
    reject_unknown(kwargs, spec["allowed"], component=tag_name)
    missing = spec["required"] - kwargs.keys()
    if missing:
        raise TemplateSyntaxError(f"{tag_name} requires: {', '.join(sorted(missing))}")
    return kwargs


class AutocompleteNode(Node):
    def __init__(self, tag_name, nodelist, kwargs):
        self.tag_name = tag_name
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        required_name = "name" if self.tag_name == "autocomplete" else "value"
        if values.get(required_name) in (None, ""):
            raise TemplateSyntaxError(f"{self.tag_name}.{required_name} cannot be empty")
        return render_to_string(
            f"repui/components/autocomplete/{self.tag_name}_tag.html",
            {"content": self.nodelist.render(context).strip(), **values},
            request=context.get("request"),
        )


def _parse_block(parser, token, tag_name, end_tag):
    kwargs = _parse_kwargs(parser, token, tag_name)
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return AutocompleteNode(tag_name, nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("autocomplete", lambda parser, token: _parse_block(parser, token, "autocomplete", "endautocomplete"))
    library.tag("autocomplete_option", lambda parser, token: _parse_block(parser, token, "autocomplete_option", "endautocomplete_option"))
