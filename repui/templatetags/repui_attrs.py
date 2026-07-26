from django import template
from django.utils.html import format_html_join
from django.utils.safestring import mark_safe
register = template.Library()
@register.simple_tag
def html_attrs(attrs):
    if not attrs: return ""
    pairs=[]
    for name,value in attrs.items():
        if value is None or value is False: continue
        pairs.append((str(name), str(name if value is True else value)))
    return mark_safe(format_html_join(" ", '{}="{}"', pairs))
