from django.apps import AppConfig


class WorkbenchConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "workbench"

    def ready(self):
        from . import checks  # noqa: F401
