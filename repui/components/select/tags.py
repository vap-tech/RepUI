from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string


_ALLOWED_SIZES = {"sm", "md", "lg"}
_ALLOWED_WIDTHS = {"full", "content"}


class SelectNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        resolved = {
            key: value.resolve(context)
            for key, value in self.kwargs.items()
        }
        content = self.nodelist.render(context).strip()

        name = resolved.pop("name", None)
        if not name:
            raise TemplateSyntaxError("select requires name")

        size = str(resolved.pop("size", "md"))
        if size not in _ALLOWED_SIZES:
            raise TemplateSyntaxError(
                f"Unknown select size: {size}"
            )

        width = str(resolved.pop("width", "full"))
        if width not in _ALLOWED_WIDTHS:
            raise TemplateSyntaxError(f"Unknown select width: {width}")

        attrs = dict(resolved.pop("attrs", {}) or {})
        aliases = {
            "id": "id",
            "form": "form",
            "title": "title",
            "aria_label": "aria-label",
            "aria_labelledby": "aria-labelledby",
            "hx_get": "hx-get",
            "hx_post": "hx-post",
            "hx_target": "hx-target",
            "hx_swap": "hx-swap",
            "rui_appbar_behavior_target": "data-rui-appbar-behavior-target",
            "rui_appbar_surface_target": "data-rui-appbar-surface-target",
            "rui_palette_select": "data-rui-palette-select",
        }
        for key, html_name in aliases.items():
            value = resolved.pop(key, None)
            if value is not None and value is not False:
                attrs[html_name] = value

        values = {
            "name": name,
            "content": content,
            "size": size,
            "width": width,
            "multiple": bool(resolved.pop("multiple", False)),
            "disabled": bool(resolved.pop("disabled", False)),
            "required": bool(resolved.pop("required", False)),
            "readonly": bool(resolved.pop("readonly", False)),
            "autofocus": bool(resolved.pop("autofocus", False)),
            "placeholder": resolved.pop(
                "placeholder",
                "Выберите значение",
            ),
            "empty_text": resolved.pop(
                "empty_text",
                "Нет вариантов",
            ),
            "class_name": resolved.pop("class_name", None),
            "attrs": attrs,
        }

        if resolved:
            raise TemplateSyntaxError(
                "Unknown select arguments: "
                + ", ".join(sorted(resolved))
            )

        return render_to_string(
            "repui/components/select/select_tag.html",
            values,
            request=context.get("request"),
        )


class SelectOptionNode(Node):
    def __init__(self, nodelist, kwargs):
        self.nodelist = nodelist
        self.kwargs = kwargs

    def render(self, context):
        resolved = {
            key: value.resolve(context)
            for key, value in self.kwargs.items()
        }
        content = self.nodelist.render(context).strip()

        if "value" not in resolved:
            raise TemplateSyntaxError(
                "select_option requires value"
            )

        value = resolved.pop("value")
        selected = bool(resolved.pop("selected", False))
        disabled = bool(resolved.pop("disabled", False))
        attrs = dict(resolved.pop("attrs", {}) or {})

        if resolved:
            raise TemplateSyntaxError(
                "Unknown select_option arguments: "
                + ", ".join(sorted(resolved))
            )

        return render_to_string(
            "repui/components/select/select_option_tag.html",
            {
                "content": content,
                "value": value,
                "selected": selected,
                "disabled": disabled,
                "attrs": attrs,
            },
            request=context.get("request"),
        )


def _parse_block(parser, token, node_class, end_tag):
    bits = token.split_contents()
    kwargs = {}

    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError(
                f"{bits[0]} arguments must use name=value"
            )
        name, value = bit.split("=", 1)
        kwargs[name] = parser.compile_filter(value)

    nodelist = parser.parse((end_tag,))
    parser.delete_first_token()
    return node_class(nodelist, kwargs)


def register_tags(library: template.Library):
    library.tag(
        "select",
        lambda parser, token: _parse_block(
            parser,
            token,
            SelectNode,
            "endselect",
        ),
    )
    library.tag(
        "select_option",
        lambda parser, token: _parse_block(
            parser,
            token,
            SelectOptionNode,
            "endselect_option",
        ),
    )
