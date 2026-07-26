from django.urls import path
from . import views

app_name="docs"

urlpatterns=[
    path("",views.workbench,name="workbench"),
    path("component/<slug:component>/",views.component_panel,name="component-panel"),
]
