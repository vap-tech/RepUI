from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string


class BlockNode(Node):
    def __init__(self, kind, values, nodelist):
        self.kind, self.values, self.nodelist = kind, values, nodelist

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.values.items()}
        if self.kind == "command_item":
            for key in ("value", "keywords", "action", "href"):
                values.setdefault(key, None)
        return render_to_string(
            f"repui/components/command_palette/{self.kind}_tag.html",
            {**values, "content": self.nodelist.render(context).strip()},
            request=context.get("request"),
        )


def _parse(parser, token, kind, end_tag):
    values = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(f"{kind} arguments must use name=value")
        key, value = bit.split("=", 1)
        if key not in {"id", "label", "value", "keywords", "action", "href"}:
            raise TemplateSyntaxError(f"Unknown {kind} argument: {key}")
        values[key] = parser.compile_filter(value)
    if kind == "command" and "id" not in values:
        raise TemplateSyntaxError("command requires id")
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return BlockNode(kind, values, nodelist)


def register_tags(library):
    library.tag("command", lambda p, t: _parse(p, t, "command", "endcommand"))
    library.tag("command_item", lambda p, t: _parse(p, t, "command_item", "endcommand_item"))
