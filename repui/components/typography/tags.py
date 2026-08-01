from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    reject_unknown,
    resolve_arguments,
    resolve_bool,
)


ALLOWED_TAGS = {
    "span", "p", "div", "label", "h1", "h2", "h3", "h4", "h5", "h6",
}
ALLOWED_VARIANTS = {
    "display", "heading-lg", "heading", "title-lg", "title", "title-sm",
    "body-lg", "body", "body-sm", "label", "label-sm", "caption",
}
ALLOWED_COLORS = {"primary", "secondary", "muted", "disabled", "danger"}
_MODIFIERS = {"nowrap", "truncate", "balance", "pretty", "numeric", "mono"}


class TypographyNode(Node):
    """Render explicit text semantics without changing the child content."""

    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = resolve_arguments(self.kwargs, context)
        variant = str(values.pop("variant", "body"))
        tag = str(values.pop("tag", "p"))
        color = values.pop("tone", values.pop("color", None))
        class_name = values.pop("class_name", None)
        attrs = dict(values.pop("attrs", {}) or {})

        if variant not in ALLOWED_VARIANTS:
            raise TemplateSyntaxError(
                f"Unknown typography variant: {variant}"
            )
        if tag not in ALLOWED_TAGS:
            raise TemplateSyntaxError(
                f"Unknown typography tag: {tag}"
            )
        if color is not None and str(color) not in ALLOWED_COLORS:
            raise TemplateSyntaxError(
                f"Unknown typography color: {color}"
            )
        classes = ["rui-typography", f"rui-typography--{variant}"]
        if color:
            classes.append(f"rui-typography--{color}")
        classes.extend(
            f"rui-typography--{name}"
            for name in _MODIFIERS
            if resolve_bool(values.pop(name, False), name=name)
        )
        if class_name:
            classes.append(str(class_name))
        attrs["class"] = " ".join(classes)

        reject_unknown(values, set(), component="typography")

        return render_to_string(
            "repui/components/typography/typography_tag.html",
            {
                "tag": tag,
                "content": self.nodelist.render(context).strip(),
                "attrs": attrs,
            },
            request=context.get("request"),
        )


def _typography(parser, token):
    kwargs = compile_keyword_arguments(parser, token)
    nodelist = parser.parse(("endtypography",))
    parser.delete_first_token()
    return TypographyNode(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag("typography", _typography)
