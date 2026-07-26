from django.shortcuts import render


def index(request):
    """Render the portal home page at the site root."""
    return render(request, "main/index.html")


def components(request):
    """Render the static component playground."""
    return render(request, "main/components.html")

# Create your views here.
