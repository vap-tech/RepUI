from django.core.checks import Error, Warning, register

from .utils import get_components


@register()
def component_workbench_checks(
    app_configs,
    **kwargs,
):
    messages = []

    for component in get_components():
        if component["enabled"]:
            continue

        error = component["error"] or "unknown error"

        if error == "Workbench-композиция пока не добавлена":
            messages.append(
                Warning(
                    f'{component["name"]}: {error}',
                    id="workbench.W001",
                )
            )
        else:
            messages.append(
                Error(
                    f'{component["name"]}: {error}',
                    id="workbench.E001",
                )
            )

    return messages
