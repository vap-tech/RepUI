const STORAGE_KEY = "rui-theme-mode";
const MODES = new Set(["light", "dark", "system"]);
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
    detail: { mode: normalized, colorScheme: scheme },
  }));
}

function mountThemeSelect(select) {
  if (select.dataset.ruiMounted === "true") return;
  select.dataset.ruiMounted = "true";
  select.value = getThemeMode();

  select.addEventListener("change", () => {
    setThemeMode(select.value);
  });

  document.addEventListener("repui:themechange", (event) => {
    select.value = event.detail.mode;
  });
}

export function mountThemeControls(scope = document) {
  scope.querySelectorAll("[data-rui-theme-select]").forEach(mountThemeSelect);
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
