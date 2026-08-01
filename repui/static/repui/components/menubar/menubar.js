import { OverlayPortal } from "../../interaction/overlay-portal.js";
import { createDismissLayer } from "../../interaction/dismiss-layer.js";
import { createRovingGroup } from "../../interaction/roving.js";
import { getMenu } from "../menu/menu.js";

const instances = new WeakMap();

function mount(root) {
  if (instances.has(root)) return instances.get(root);
  const items = [...root.querySelectorAll("[data-rui-menubar-item]")];
  const abort = new AbortController();
  const portals = new WeakMap();
  const roving = createRovingGroup(root, {
    itemSelector: "[data-rui-menubar-trigger]",
    orientation: "horizontal",
    loop: true,
  });
  let active = null;
  let portal = null;
  let dismiss = null;
  const close = (restore = false) => {
    const previous = active;
    items.forEach((item) => {
      item.dataset.active = "false";
      item.querySelector(".rui-menubar__trigger")?.setAttribute("aria-expanded", "false");
      item.querySelector(".rui-menubar__menu")?.setAttribute("hidden", "");
    });
    if (portal) {
      portal.overlay.hidden = true;
      portal.deactivate();
      portal = null;
    }
    dismiss?.destroy();
    dismiss = null;
    if (restore) previous?.querySelector(".rui-menubar__trigger")?.focus({ preventScroll: true });
    active = null;
  };
  const open = (item, focusFirst = false) => {
    if (active === item) {
      if (focusFirst) queueMicrotask(() => {
        const menu = portals.get(item)?.overlay;
        const menuRoot = menu?.querySelector("[data-rui-menu]") || menu;
        getMenu(menuRoot)?.focusFirst();
      });
      return;
    }
    const trigger = item.querySelector(".rui-menubar__trigger");
    const existing = portals.get(item);
    const menu = existing?.overlay || item.querySelector(".rui-menubar__menu");
    if (!trigger || !menu) return;
    const menuRuntime = getMenu(menu.querySelector("[data-rui-menu]") || menu);
    close();
    active = item;
    item.dataset.active = "true";
    trigger.setAttribute("aria-expanded", "true");
    menu.removeAttribute("hidden");
    portal = existing || new OverlayPortal(trigger, menu, { matchAnchorWidth: false, offset: 4, onAnchorHidden: () => close() });
    portals.set(item, portal);
    portal.mount();
    portal.activate();
    dismiss = createDismissLayer({ anchor: trigger, overlay: menu, onDismiss: ({ reason }) => close(reason === "escape") });
    if (focusFirst) queueMicrotask(() => menuRuntime.focusFirst());
  };
  items.forEach((item, index) => {
    const trigger = item.querySelector(".rui-menubar__trigger");
    trigger?.addEventListener("click", () => open(item), { signal: abort.signal });
    trigger?.addEventListener("keydown", (event) => {
      if (["ArrowDown", "Enter", " "].includes(event.key)) { event.preventDefault(); open(item, true); }
    }, { signal: abort.signal });
    item.addEventListener("mouseenter", () => { if (active) open(item); }, { signal: abort.signal });
    item.querySelector(".rui-menubar__menu")?.addEventListener("click", (event) => {
      const selected = event.target.closest("[data-rui-menu-item]");
      if (!selected) return;
      root.dispatchEvent(new CustomEvent("rui:menubarselect", { bubbles: true, detail: { item: selected, value: selected.dataset.value ?? null } }));
      close(false);
    }, { signal: abort.signal });
  });
  const api = { root, refresh() { roving.refresh(); return api; }, focusFirst() { roving.focusFirst(); return api; }, focusLast() { roving.focusLast(); return api; }, destroy() { close(); items.forEach((item) => portals.get(item)?.destroy()); roving.destroy(); abort.abort(); instances.delete(root); } };
  instances.set(root, api);
  return api;
}

export function mountMenubars(root = document) {
  const nodes = root.matches?.("[data-rui-menubar]") ? [root] : [...(root.querySelectorAll?.("[data-rui-menubar]") || [])];
  return nodes.map(mount);
}
