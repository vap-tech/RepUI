from django.shortcuts import render


def component_draft(request):
    """Render the component-first architecture draft showcase."""
    return render(request, "repui/example.html")
