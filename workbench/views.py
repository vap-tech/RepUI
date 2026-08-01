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
from repui.theme_registry import get_theme_assets


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
    ocean_theme_component_styles = get_theme_assets(
        "ocean-deep",
        [component["name"] for component in components],
    )

    return render(
        request,
        "workbench/workbench.html",
        {
            "components": components,
            "component_styles": get_component_styles(components),
            "selected_component": selected,
            "appbar_section": "components" if component_name else "home",
            "ocean_theme_component_styles": ocean_theme_component_styles,
        },
    )


def component_catalog(request: HttpRequest) -> HttpResponse:
    """Render the static component catalog without Workbench HTMX behavior."""
    components = get_components()
    ocean_theme_component_styles = get_theme_assets(
        "ocean-deep",
        [component["name"] for component in components],
    )
    return render(
        request,
        "workbench/components.html",
        {
            "components": components,
            "component_styles": get_component_styles(components),
            "appbar_section": "components",
            "ocean_theme_component_styles": ocean_theme_component_styles,
        },
    )


def theme_authoring(request: HttpRequest) -> HttpResponse:
    return render(
        request,
        "workbench/themes.html",
        {
            "appbar_section": "themes",
            "ocean_theme_component_styles": get_theme_assets(
                "ocean-deep",
                [component["name"] for component in get_components()],
            ),
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
