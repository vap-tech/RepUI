from django import template
from django.utils.safestring import mark_safe
from repui.theme_registry import list_themes

register = template.Library()

_BOOTSTRAP = r"""
<script>
(() => {
  const key = "rui-theme-mode";
  const themeKey = "rui-theme";
  const allowed = new Set(["light", "dark", "system"]);
  const themes = new Set(%s);
  let mode = "system";
  let theme = "default";

  try {
    const stored = localStorage.getItem(key);
    if (allowed.has(stored)) mode = stored;
    const storedTheme = localStorage.getItem(themeKey);
    if (themes.has(storedTheme)) theme = storedTheme;
  } catch (_) {}

  const prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const scheme = mode === "system"
    ? (prefersDark ? "dark" : "light")
    : mode;

  const root = document.documentElement;
  root.dataset.ruiThemeMode = mode;
  root.dataset.ruiColorScheme = scheme;
  root.dataset.ruiTheme = theme;
})();
</script>
""" % repr(list(list_themes())).replace("'", '"')

@register.simple_tag
def repui_theme_head():
    return mark_safe(_BOOTSTRAP)
