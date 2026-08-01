from dataclasses import dataclass

from django import template
from django.template import Context, Node, TemplateSyntaxError
from django.template.loader import render_to_string

register = template.Library()

_ALLOWED = {"title", "image", "image_dark", "atlas", "atlas_column", "image_alt", "image_position", "image_dark_position", "size", "media_side", "id", "class_name", "attrs"}


@dataclass
class _HeroSlots:
    eyebrow: str = ""
    description: str = ""
    actions: str = ""
    media: str = ""


class HeroNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context: Context):
        values = {key: value.resolve(context) for key, value in self.kwargs.items()}
        unknown = set(values) - _ALLOWED
        if unknown:
            raise TemplateSyntaxError("Unknown hero arguments: " + ", ".join(sorted(unknown)))
        title = str(values.get("title", "")).strip()
        if not title:
            raise TemplateSyntaxError("hero title must not be empty")
        size = str(values.get("size", "md"))
        side = str(values.get("media_side", "end"))
        if size not in {"sm", "md", "lg"}:
            raise TemplateSyntaxError("hero size must be sm, md or lg")
        if side not in {"start", "end"}:
            raise TemplateSyntaxError("hero media_side must be start or end")

        attrs = dict(values.get("attrs") or {})
        if values.get("id"):
            attrs["id"] = values["id"]
        slots = _HeroSlots()
        context.push()
        try:
            context["__repui_hero_slots"] = slots
            body = self.nodelist.render(context).strip()
        finally:
            context.pop()
        return render_to_string("repui/components/hero/hero_tag.html", {
            "title": title, "body": body, "slots": slots,
            "image": values.get("image"), "image_dark": values.get("image_dark"),
            "atlas": values.get("atlas"), "atlas_column": values.get("atlas_column", 0),
            "image_alt": values.get("image_alt", ""), "size": size, "media_side": side,
            "image_position": values.get("image_position", "center"),
            "image_dark_position": values.get("image_dark_position", values.get("image_position", "center")),
            "class_name": values.get("class_name"), "attrs": attrs,
        }, request=context.get("request"))


class HeroSlotNode(Node):
    def __init__(self, name, nodelist):
        self.name = name
        self.nodelist = nodelist

    def render(self, context):
        slots = context.get("__repui_hero_slots")
        if not isinstance(slots, _HeroSlots):
            raise TemplateSyntaxError(f"hero_{self.name} must be used inside hero")
        content = self.nodelist.render(context).strip()
        setattr(slots, self.name, content)
        return ""


def _tag(parser, token):
    bits = token.split_contents()
    kwargs = {}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("hero arguments must use name=value")
        key, value = bit.split("=", 1)
        if key in kwargs:
            raise TemplateSyntaxError(f"hero argument {key} was provided twice")
        kwargs[key] = parser.compile_filter(value)
    nodes = parser.parse(("endhero",))
    parser.delete_first_token()
    return HeroNode(nodes, kwargs)


def _slot(name):
    def tag(parser, token):
        if token.split_contents()[1:]:
            raise TemplateSyntaxError(f"hero_{name} does not accept arguments")
        nodes = parser.parse((f"endhero_{name}",))
        parser.delete_first_token()
        return HeroSlotNode(name, nodes)
    return tag


def register_tags(library):
    library.tag("hero", _tag)
    for name in ("eyebrow", "description", "actions", "media"):
        library.tag(f"hero_{name}", _slot(name))
