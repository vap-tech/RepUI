from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

from repui.template_support.arguments import (
    compile_keyword_arguments,
    extract_html_attrs,
    resolve_arguments,
    resolve_bool,
)

_ALLOWED_VARIANTS={"filled","outlined","text","soft"}
_ALLOWED_COLORS={"default","primary","secondary","success","warning","danger"}
_ALLOWED_SIZES={"xs","sm","md","lg","xl"}

class ButtonNode(Node):
    def __init__(self,nodelist,kwargs):
        self.nodelist=nodelist
        self.kwargs=kwargs

    def render(self,context):
        resolved=resolve_arguments(self.kwargs, context)
        content=self.nodelist.render(context).strip()

        variant=str(resolved.pop("variant","filled"))
        color=str(resolved.pop("color","default"))
        size=str(resolved.pop("size","md"))
        if variant not in _ALLOWED_VARIANTS:
            raise TemplateSyntaxError(f"Unknown button variant: {variant}")
        if color not in _ALLOWED_COLORS:
            raise TemplateSyntaxError(f"Unknown button color: {color}")
        if size not in _ALLOWED_SIZES:
            raise TemplateSyntaxError(f"Unknown button size: {size}")

        href=resolved.pop("href",None)
        button_type=str(resolved.pop("type","button"))
        disabled=resolve_bool(resolved.pop("disabled", False), name="disabled")
        loading=resolve_bool(resolved.pop("loading", False), name="loading")
        full_width=resolve_bool(resolved.pop("full_width", False), name="full_width")
        icon_only=resolve_bool(resolved.pop("icon_only", False), name="icon_only")

        aliases={
            "class_name":"class",
            "id":"id","name":"name","value":"value","target":"target","rel":"rel",
            "download":"download","form":"form","title":"title",
            "aria_label":"aria-label","hx_get":"hx-get","hx_post":"hx-post",
            "hx_target":"hx-target","hx_swap":"hx-swap","hx_confirm":"hx-confirm",
            "rui_appbar_toggle":"data-rui-appbar-toggle",
            "data-rui-drawer-open":"data-rui-drawer-open",
            "data-rui-drawer-close":"data-rui-drawer-close",
            "data-rui-command-trigger":"data-rui-command-trigger",
            "data-rui-toast":"data-rui-toast",
            "data-rui-toast-description":"data-rui-toast-description",
            "data-rui-dialog-open":"data-rui-dialog-open",
            "data-rui-dialog-close":"data-rui-dialog-close",
            "aria_pressed":"aria-pressed",
        }
        attrs=extract_html_attrs(resolved, aliases)

        if resolved:
            raise TemplateSyntaxError("Unknown button arguments: "+", ".join(sorted(resolved)))
        if button_type not in {"button","submit","reset"}:
            raise TemplateSyntaxError("button type must be button, submit or reset")

        return render_to_string(
            "repui/components/button/button.html",
            {
                "content":content,
                "variant":variant,
                "color":color,
                "size":size,
                "href":href,
                "button_type":button_type,
                "disabled":disabled,
                "loading":loading,
                "full_width":full_width,
                "icon_only":icon_only,
                "attrs":attrs,
            },
            request=context.get("request"),
        )

def _button(parser,token):
    kwargs=compile_keyword_arguments(parser, token)
    nodelist=parser.parse(("endbutton",))
    parser.delete_first_token()
    return ButtonNode(nodelist,kwargs)

def register_tags(library: template.Library):
    library.tag("button",_button)
