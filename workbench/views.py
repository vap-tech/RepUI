from __future__ import annotations

from django.http import Http404, HttpRequest, HttpResponse
from django.shortcuts import render
from django.urls import reverse
from django.template import engines

from .utils import (
    component_template_source,
    get_component_styles,
    get_component,
    get_components,
)
from repui.theme_registry import get_theme, list_themes


def get_theme_choices():
    return tuple(
        {
            "name": name,
            "title": (get_theme(name) or {}).get("title", name),
            "is_default": name == "default",
        }
        for name in list_themes()
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
    for component in components:
        component["navigation_attrs"] = {
            "hx-get": reverse(
                "workbench:component-partial",
                args=(component["name"],),
            ),
            "hx-target": "#component-panel",
            "hx-swap": "innerHTML",
        }
    default_theme = get_theme("default") or {}
    hero = default_theme.get("presentation", {}).get("hero", {})

    return render(
        request,
        "workbench/workbench.html",
        {
            "components": components,
            "component_styles": get_component_styles(components),
            "selected_component": selected,
            "appbar_section": "components" if component_name else "home",
            "theme_choices": get_theme_choices(),
            "home_hero": {
                "atlas": hero.get("atlas"),
                "atlas_column": hero.get("column", 0),
                "image_alt": hero.get("alt", "Интерфейс RepUI"),
            },
        },
    )


def roadmap(request: HttpRequest) -> HttpResponse:
    components = get_components()
    return render(
        request,
        "workbench/roadmap.html",
        {
            "appbar_section": "roadmap",
            "theme_choices": get_theme_choices(),
            "components": components,
            "roadmap_phases": (
                ("Укрепить существующие контракты", "Сейчас", "Клавиатура, HTMX lifecycle, portal context и baseline-проверки официальных тем."),
                ("Закрыть базовые формы", "Следующее", "TextField, Textarea, FormControl, RadioGroup, Switch и FieldError."),
                ("Loading и feedback", "Запланировано", "Spinner, Progress, Skeleton и loading-состояния форм при HTMX submit."),
                ("Данные и навигация", "По потребности", "Table, Breadcrumbs, Accordion, EmptyState и DataList."),
                ("Специализированные компоненты", "Не приоритет", "Slider, Rating, Stepper, Timeline и сложные data-grid сценарии."),
            ),
        },
    )


def theme_authoring(request: HttpRequest) -> HttpResponse:
    theme_cards = []
    for name in list_themes():
        theme = get_theme(name) or {}
        presentation = theme.get("presentation", {}).get("preview", {})
        theme_cards.append({
            "name": name,
            "title": theme.get("title", name),
            "description": theme.get("description", ""),
            "atlas": presentation.get("atlas"),
            "atlas_column": presentation.get("column", 0),
            "image_alt": presentation.get("alt", theme.get("title", name)),
            "badge": "Default" if name == "default" else None,
        })
    return render(
        request,
        "workbench/themes.html",
        {
            "appbar_section": "themes",
            "theme_choices": get_theme_choices(),
            "theme_cards": theme_cards,
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
