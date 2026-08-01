from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
)

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
    kwargs = compile_keyword_arguments(parser, token)
    reject_unknown(kwargs, spec["allowed"], component=tag_name)
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
        values = resolve_arguments(self.kwargs, context)
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
