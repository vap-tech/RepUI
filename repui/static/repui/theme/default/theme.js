const STORAGE_KEY = "rui-theme-mode";
const THEME_STORAGE_KEY = "rui-theme";
const MODES = new Set(["light", "dark", "system"]);
const THEMES = new Set(["default", "mineral", "ocean-deep"]);
const root = document.documentElement;
const media = window.matchMedia("(prefers-color-scheme: dark)");

function normalize(mode) {
  return MODES.has(mode) ? mode : "system";
}

export function resolveThemeMode(mode) {
  const normalized = normalize(mode);
  return normalized === "system"
    ? (media.matches ? "dark" : "light")
    : normalized;
}

export function getThemeMode() {
  return normalize(root.dataset.ruiThemeMode);
}

export function getTheme() {
  return THEMES.has(root.dataset.ruiTheme) ? root.dataset.ruiTheme : "default";
}

export function setTheme(theme, { persist = true } = {}) {
  const normalized = THEMES.has(theme) ? theme : "default";
  root.dataset.ruiTheme = normalized;
  if (persist) {
    try { localStorage.setItem(THEME_STORAGE_KEY, normalized); } catch (_) {}
  }
  document.dispatchEvent(new CustomEvent("repui:themechange", {
    detail: {
      theme: normalized,
      mode: getThemeMode(),
      colorScheme: root.dataset.ruiColorScheme,
    },
  }));
}

export function setThemeMode(mode, { persist = true } = {}) {
  const normalized = normalize(mode);
  const scheme = resolveThemeMode(normalized);

  root.dataset.ruiThemeMode = normalized;
  root.dataset.ruiColorScheme = scheme;

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch (_) {}
  }

  document.dispatchEvent(new CustomEvent("repui:themechange", {
    detail: { theme: getTheme(), mode: normalized, colorScheme: scheme },
  }));
}

function mountThemeSelect(select) {
  if (select.dataset.ruiThemeControlMounted === "true") return;
  select.dataset.ruiThemeControlMounted = "true";
  select.value = getThemeMode();

  select.addEventListener("change", () => {
    setThemeMode(select.value);
  });

  document.addEventListener("repui:themechange", (event) => {
    select.value = event.detail.mode;
  });
}

function mountPaletteSelect(select) {
  if (select.dataset.ruiThemeControlMounted === "true") return;
  select.dataset.ruiThemeControlMounted = "true";
  select.value = getTheme();
  select.dispatchEvent(new Event("input", { bubbles: true }));

  select.addEventListener("change", () => {
    setTheme(select.value);
  });

  document.addEventListener("repui:themechange", (event) => {
    select.value = event.detail.theme;
    select.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function mountThemeToggle(button) {
  if (button.dataset.ruiThemeControlMounted === "true") return;
  button.dataset.ruiThemeControlMounted = "true";

  const update = () => {
    const dark = root.dataset.ruiColorScheme === "dark";
    button.querySelector('[data-rui-theme-icon="dark"]')?.toggleAttribute("hidden", !dark);
    button.querySelector('[data-rui-theme-icon="light"]')?.toggleAttribute("hidden", dark);
    button.setAttribute("aria-label", dark ? "Включить светлую тему" : "Включить тёмную тему");
    button.title = button.getAttribute("aria-label");
  };

  button.addEventListener("click", () => {
    setThemeMode(root.dataset.ruiColorScheme === "dark" ? "light" : "dark");
  });
  document.addEventListener("repui:themechange", update);
  update();
}

export function mountThemeControls(scope = document) {
  scope.querySelectorAll("[data-rui-theme-select]").forEach(mountThemeSelect);
  scope.querySelectorAll("[data-rui-palette-select]").forEach(mountPaletteSelect);
  scope.querySelectorAll("[data-rui-theme-toggle]").forEach(mountThemeToggle);
}

media.addEventListener("change", () => {
  if (getThemeMode() === "system") {
    setThemeMode("system", { persist: false });
  }
});

mountThemeControls();

document.addEventListener("htmx:afterSwap", (event) => {
  mountThemeControls(event.detail.target);
});
