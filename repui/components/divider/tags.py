from django import template
from django.template import TemplateSyntaxError
from django.utils.safestring import mark_safe

register = template.Library()

_ORIENTATIONS = {"horizontal", "vertical"}


@register.simple_tag
def divider(orientation="horizontal"):
    """Render a semantic horizontal or vertical divider."""
    if orientation not in _ORIENTATIONS:
        raise TemplateSyntaxError(
            "divider orientation must be horizontal or vertical"
        )
    modifier = "" if orientation == "horizontal" else " rui-divider--vertical"
    return mark_safe(
        f'<hr class="rui-divider{modifier}" '
        f'aria-orientation="{orientation}">'
    )


def register_tags(library: template.Library):
    library.simple_tag(divider, name="divider")
