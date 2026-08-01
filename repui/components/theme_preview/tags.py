from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

register = template.Library()
_ALLOWED = {"name", "title", "description", "image", "image_dark", "atlas", "atlas_column", "image_alt", "image_position", "image_dark_position", "href", "selected", "badge", "id", "class_name", "attrs"}


class ThemePreviewNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        unknown = set(values) - _ALLOWED
        if unknown:
            raise TemplateSyntaxError("Unknown theme_preview arguments: " + ", ".join(sorted(unknown)))
        name = str(values.get("name", "")).strip()
        title = str(values.get("title", "")).strip()
        if not name or not title:
            raise TemplateSyntaxError("theme_preview requires name and title")
        attrs = dict(values.get("attrs") or {})
        if values.get("id"):
            attrs["id"] = values["id"]
        return render_to_string("repui/components/theme_preview/theme_preview_tag.html", {
            "name": name, "title": title, "description": values.get("description", ""),
            "image": values.get("image"), "image_dark": values.get("image_dark"),
            "atlas": values.get("atlas"), "atlas_column": values.get("atlas_column", 0),
            "image_alt": values.get("image_alt", ""), "href": values.get("href"),
            "image_position": values.get("image_position", "center"),
            "image_dark_position": values.get("image_dark_position", values.get("image_position", "center")),
            "selected": bool(values.get("selected")), "badge": values.get("badge"),
            "content": self.nodelist.render(context).strip(), "class_name": values.get("class_name"), "attrs": attrs,
        }, request=context.get("request"))


def _theme_preview(parser, token):
    kwargs = {}
    for bit in token.split_contents()[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("theme_preview arguments must use name=value")
        key, value = bit.split("=", 1)
        if key in kwargs:
            raise TemplateSyntaxError(f"theme_preview argument {key} was provided twice")
        kwargs[key] = parser.compile_filter(value)
    nodes = parser.parse(("endtheme_preview",))
    parser.delete_first_token()
    return ThemePreviewNode(nodes, kwargs)


def register_tags(library):
    library.tag("theme_preview", _theme_preview)
