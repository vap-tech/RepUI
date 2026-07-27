from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

_SPECS = {
    "tree": {
        "allowed": {"aria_label", "multiselectable", "class_name", "attrs"},
        "required": set(),
    },
    "tree_item": {
        "allowed": {"label", "expanded", "selected", "disabled", "class_name", "attrs"},
        "required": {"label"},
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


class TreeNode(Node):
    def __init__(self, tag_name, nodelist, kwargs):
        self.tag_name = tag_name
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {name: value.resolve(context) for name, value in self.kwargs.items()}
        if self.tag_name == "tree_item" and not values.get("label"):
            raise TemplateSyntaxError("tree_item.label cannot be empty")
        return render_to_string(
            f"repui/components/tree/{self.tag_name}_tag.html",
            {"content": self.nodelist.render(context).strip(), **values},
            request=context.get("request"),
        )


def _parse_block(parser, token, tag_name, end_tag):
    kwargs = _parse_kwargs(parser, token, tag_name)
    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return TreeNode(tag_name, nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("tree", lambda parser, token: _parse_block(parser, token, "tree", "endtree"))
    library.tag("tree_item", lambda parser, token: _parse_block(parser, token, "tree_item", "endtree_item"))
