from django.apps import AppConfig

class RepUIConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "repui"
    verbose_name = "RepUI"

    def ready(self):
        from . import checks  # noqa: F401
