import { createRovingGroup } from "../../interaction/roving.js";

const instances = new WeakMap();

function mountMenu(root) {
  const current = instances.get(root);
  if (current) return current;

  const roving = createRovingGroup(root, {
    itemSelector: "[data-rui-menu-item]",
    orientation: root.dataset.orientation || "vertical",
    loop: root.dataset.loop !== "false",
  });

  const abort = new AbortController();

  root.addEventListener("click", (originalEvent) => {
    const item = originalEvent.target.closest("[data-rui-menu-item]");
    if (!item || item.disabled) return;

    item.dispatchEvent(new CustomEvent("rui:activate", {
      bubbles: true,
      cancelable: true,
      detail: {
        element: item,
        value: item.dataset.value ?? null,
        originalEvent,
      },
    }));
  }, { signal: abort.signal });

  const api = {
    element: root,
    root,
    refresh() {
      roving.refresh();
      return api;
    },
    focusFirst() { roving.focusFirst(); return api; },
    focusLast() { roving.focusLast(); return api; },
    focusCurrent() { roving.focusCurrent(); return api; },
    get items() { return roving.items; },
    destroy() {
      abort.abort();
      roving.destroy();
      instances.delete(root);
    },
  };

  instances.set(root, api);
  return api;
}

export function mountMenus(root = document) {
  const elements = [];
  if (root.matches?.("[data-rui-menu]")) elements.push(root);
  elements.push(...root.querySelectorAll?.("[data-rui-menu]") ?? []);
  return elements.map(mountMenu);
}

export function getMenu(root) {
  const instance = instances.get(root);
  if (!instance) {
    throw new Error(
      "Menu runtime must be mounted before a composite consumer",
    );
  }
  return instance;
}
