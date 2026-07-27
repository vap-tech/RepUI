from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

_SPECS = {
    "navbar": {
        "allowed": {"aria_label", "orientation", "roving", "class_name", "attrs"},
        "required": set(),
        "enums": {"orientation": {"horizontal", "vertical"}},
    },
    "nav_item": {
        "allowed": {"href", "current", "disabled", "class_name", "attrs"},
        "required": {"href"},
        "enums": {},
    },
}


def _parse_kwargs(parser, token, tag_name):
    spec = _SPECS[tag_name]
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(f"{tag_name} arguments must use name=value")
        name, expression = bit.split("=", 1)
        if name not in spec["allowed"]:
            raise TemplateSyntaxError(f"Unknown {tag_name} argument: {name}")
        if name in kwargs:
            raise TemplateSyntaxError(f"Duplicate {tag_name} argument: {name}")
        kwargs[name] = parser.compile_filter(expression)
    missing = spec["required"] - kwargs.keys()
    if missing:
        raise TemplateSyntaxError(f"{tag_name} requires: {', '.join(sorted(missing))}")
    return kwargs


def _validate(tag_name, values):
    for name, choices in _SPECS[tag_name]["enums"].items():
        value = values.get(name)
        if value is not None and value not in choices:
            choices_text = ", ".join(sorted(choices))
            raise TemplateSyntaxError(f"{tag_name}.{name} must be one of: {choices_text}")
    if tag_name == "nav_item" and not values.get("href") and not values.get("disabled"):
        raise TemplateSyntaxError("nav_item.href cannot be empty unless disabled=True")


class NavbarNode(Node):
    def __init__(self, tag_name, nodelist, kwargs):
        self.tag_name = tag_name
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {name: value.resolve(context) for name, value in self.kwargs.items()}
        _validate(self.tag_name, values)
        return render_to_string(
            f"repui/components/navbar/{self.tag_name}_tag.html",
            {"content": self.nodelist.render(context).strip(), **values},
            request=context.get("request"),
        )


def _parse_block(parser, token, tag_name, end_tag):
    kwargs = _parse_kwargs(parser, token, tag_name)
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return NavbarNode(tag_name, nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("navbar", lambda parser, token: _parse_block(parser, token, "navbar", "endnavbar"))
    library.tag("nav_item", lambda parser, token: _parse_block(parser, token, "nav_item", "endnav_item"))
