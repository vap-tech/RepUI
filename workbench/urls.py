from django.urls import path

from . import views

app_name = "workbench"

urlpatterns = [
    path("", views.workbench, name="home"),
    path("components/", views.component_catalog, name="components"),
    path(
        "component/<slug:component_name>/",
        views.workbench,
        name="component",
    ),
    path(
        "partial/<slug:component_name>/",
        views.component_partial,
        name="component-partial",
    ),
]
