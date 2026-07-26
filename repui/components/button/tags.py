from django import template
from django.template import Node, TemplateSyntaxError
from django.template.loader import render_to_string

_ALLOWED_VARIANTS={"filled","outlined","text","soft"}
_ALLOWED_COLORS={"default","primary","secondary","success","warning","danger"}
_ALLOWED_SIZES={"xs","sm","md","lg","xl"}

class ButtonNode(Node):
    def __init__(self,nodelist,kwargs):
        self.nodelist=nodelist
        self.kwargs=kwargs

    def render(self,context):
        resolved={k:v.resolve(context) for k,v in self.kwargs.items()}
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
        disabled=bool(resolved.pop("disabled",False))
        loading=bool(resolved.pop("loading",False))
        full_width=bool(resolved.pop("full_width",False))
        icon_only=bool(resolved.pop("icon_only",False))
        attrs=dict(resolved.pop("attrs",{}) or {})

        aliases={
            "class_name":"class",
            "id":"id","name":"name","value":"value","target":"target","rel":"rel",
            "download":"download","form":"form","title":"title",
            "aria_label":"aria-label","hx_get":"hx-get","hx_post":"hx-post",
            "hx_target":"hx-target","hx_swap":"hx-swap","hx_confirm":"hx-confirm",
            "rui_appbar_toggle":"data-rui-appbar-toggle",
            "aria_pressed":"aria-pressed",
        }
        for key,html_name in aliases.items():
            value=resolved.pop(key,None)
            if value is not None and value is not False:
                attrs[html_name]=value

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
    bits=token.split_contents()
    kwargs={}
    for bit in bits[1:]:
        if "=" not in bit:
            raise TemplateSyntaxError("button arguments must use name=value")
        name,value=bit.split("=",1)
        kwargs[name]=parser.compile_filter(value)
    nodelist=parser.parse(("endbutton",))
    parser.delete_first_token()
    return ButtonNode(nodelist,kwargs)

def register_tags(library: template.Library):
    library.tag("button",_button)
