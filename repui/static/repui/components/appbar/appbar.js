const BEHAVIORS = new Set(["static", "sticky"]);
function requireElement(element) { if (!(element instanceof Element)) throw new TypeError("appbar must be a DOM Element"); return element; }
function emitChange(appbar) { appbar.dispatchEvent(new CustomEvent("repui:appbarchange", {bubbles: true, detail: getAppBarState(appbar)})); }
export function getAppBarState(appbar) { requireElement(appbar); return {behavior: appbar.dataset.behavior || "static", surface: appbar.dataset.surface || "default"}; }
export function setAppBarBehavior(appbar, behavior) { requireElement(appbar); if (!BEHAVIORS.has(behavior)) throw new RangeError("behavior must be static or sticky"); appbar.dataset.behavior = behavior; emitChange(appbar); return behavior; }
export function toggleAppBarBehavior(appbar) { requireElement(appbar); return setAppBarBehavior(appbar, appbar.dataset.behavior === "sticky" ? "static" : "sticky"); }
export function setAppBarSurface(appbar, surface) { requireElement(appbar); const value = String(surface).trim(); if (!value) throw new TypeError("surface must not be empty"); appbar.dataset.surface = value; emitChange(appbar); return value; }
export function mountAppBarControls(root=document, {signal}={}) {
  const selector = "[data-rui-appbar-toggle-behavior], [data-rui-appbar-behavior-target], [data-rui-appbar-surface-target]";
  const onClick = (event) => {
    const control = event.target.closest(selector);
    if (!control || !root.contains(control)) return;
    const toggleTarget = control.dataset.ruiAppbarToggleBehavior;
    if (toggleTarget) {
      const appbar = document.getElementById(toggleTarget); if (!appbar) return;
      const behavior = toggleAppBarBehavior(appbar);
      control.setAttribute("aria-pressed", String(behavior === "sticky"));
      return;
    }
    const behaviorTarget = control.dataset.ruiAppbarBehaviorTarget;
    if (behaviorTarget) {
      const appbar = document.getElementById(behaviorTarget);
      const behavior = control.dataset.ruiAppbarBehavior || control.value;
      if (appbar && behavior) setAppBarBehavior(appbar, behavior);
    }
    const surfaceTarget = control.dataset.ruiAppbarSurfaceTarget;
    if (surfaceTarget) {
      const appbar = document.getElementById(surfaceTarget);
      const surface = control.dataset.ruiAppbarSurface || control.value;
      if (appbar && surface) setAppBarSurface(appbar, surface);
    }
  };
  const onChange = onClick;
  root.querySelectorAll(
    "[data-rui-appbar-behavior-target], [data-rui-appbar-surface-target]",
  ).forEach((control) => {
    const targetId =
      control.dataset.ruiAppbarBehaviorTarget ||
      control.dataset.ruiAppbarSurfaceTarget;
    const appbar = targetId && document.getElementById(targetId);
    if (!appbar || !(control instanceof HTMLSelectElement)) return;
    const state = getAppBarState(appbar);
    control.value = control.dataset.ruiAppbarBehaviorTarget
      ? state.behavior
      : state.surface;
  });
  root.addEventListener("click", onClick, {signal});
  root.addEventListener("change", onChange, {signal});
  return () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("change", onChange);
  };
}
