from __future__ import annotations

from django.http import Http404, HttpRequest, HttpResponse
from django.shortcuts import render
from django.template import engines

from .utils import (
    component_template_source,
    get_component_styles,
    get_component,
    get_components,
)


def workbench(
    request: HttpRequest,
    component_name: str | None = None,
) -> HttpResponse:
    selected = (
        get_component(component_name)
        if component_name
        else None
    )

    if component_name and selected is None:
        raise Http404("Unknown RepUI component")

    components = get_components()

    return render(
        request,
        "workbench/workbench.html",
        {
            "components": components,
            "component_styles": get_component_styles(components),
            "selected_component": selected,
        },
    )


def component_partial(
    request: HttpRequest,
    component_name: str,
) -> HttpResponse:
    component = get_component(component_name)

    if component is None:
        raise Http404("Unknown RepUI component")

    if not component["enabled"]:
        raise Http404(
            component["error"]
            or "Component Workbench is unavailable"
        )

    template = engines["django"].from_string(
        component_template_source(component_name)
    )

    html = template.render({
        "request": request,
        "component": component,
        "manifest": component["manifest"],
    })

    return HttpResponse(html)
