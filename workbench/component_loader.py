import importlib
from dataclasses import asdict
from django.template import Context, Template

class ComponentNotFound(LookupError):
    pass

def _module(component,suffix):
    name=f"repui.components.{component}.{suffix}"
    try:
        return importlib.import_module(name)
    except ModuleNotFoundError as exc:
        if exc.name in {name,f"repui.components.{component}"}:
            raise ComponentNotFound(component) from exc
        raise

def load_component(component):
    manifest=dict(_module(component,"manifest").COMPONENT)
    examples_module=_module(component,"examples")
    quality_module=_module(component,"quality")
    schema_module=_module(component,"schema")

    examples=[]
    for example in examples_module.EXAMPLES:
        source=example.template.strip()
        examples.append({
            **asdict(example),
            "source":source,
            "html":Template(source).render(Context({})),
        })

    return {
        "manifest":manifest,
        "schema":getattr(schema_module,"BUTTON_SCHEMA",{}),
        "examples":examples,
        "checks":[asdict(check) for check in quality_module.CHECKS],
    }
