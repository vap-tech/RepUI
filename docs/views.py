from django.http import Http404
from django.shortcuts import render
from .component_loader import ComponentNotFound,load_component

def workbench(request):
    return render(request,"docs/workbench.html")

def component_panel(request,component):
    try:
        payload=load_component(component)
    except ComponentNotFound as exc:
        raise Http404(f"Unknown RepUI component: {component}") from exc
    return render(request,"docs/partials/component_panel.html",{
        "component_name":component,
        **payload,
    })
