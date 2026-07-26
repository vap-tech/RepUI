import importlib
import pkgutil
from django import template
import repui.components

register=template.Library()

for info in pkgutil.iter_modules(repui.components.__path__, f"{repui.components.__name__}."):
    if not info.ispkg:
        continue
    module_name=f"{info.name}.tags"
    try:
        module=importlib.import_module(module_name)
    except ModuleNotFoundError as exc:
        if exc.name==module_name:
            continue
        raise
    hook=getattr(module,"register_tags",None)
    if hook:
        hook(register)
