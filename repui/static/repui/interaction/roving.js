import { isInteractionDisabled } from "./activation.js";

const instances = new WeakMap();

export function createRovingGroup(root, options = {}) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError("createRovingGroup requires an HTMLElement");
  }

  const current = instances.get(root);
  if (current) return current;

  const config = {
    itemSelector: "[data-rui-roving-item]",
    orientation: "vertical",
    loop: true,
    ...options,
  };

  const abort = new AbortController();
  const { signal } = abort;
  let items = [];
  let index = -1;

  function refresh() {
    items = [...root.querySelectorAll(config.itemSelector)]
      .filter((item) => item instanceof HTMLElement)
      .filter((item) => !isInteractionDisabled(item));

    let next = items.findIndex((item) => item.tabIndex === 0);
    if (next < 0) next = items.findIndex(
      (item) => item.getAttribute("aria-selected") === "true"
    );
    if (next < 0 && items.length) next = 0;

    setCurrent(next, false);
    return api;
  }

  function setCurrent(next, focus = true) {
    if (!items.length) {
      index = -1;
      return;
    }

    next = Math.max(0, Math.min(next, items.length - 1));
    items.forEach((item, itemIndex) => {
      item.tabIndex = itemIndex === next ? 0 : -1;
    });

    index = next;
    if (focus) items[index].focus();
  }

  function move(delta) {
    if (!items.length) return;

    let next = index + delta;
    if (config.loop) {
      next = (next + items.length) % items.length;
    } else {
      next = Math.max(0, Math.min(next, items.length - 1));
    }
    setCurrent(next);
  }

  root.addEventListener("focusin", (event) => {
    const item = event.target.closest(config.itemSelector);
    if (!item || item.closest(config.itemSelector) !== item || !root.contains(item)) return;
    const next = items.indexOf(item);
    if (next >= 0) setCurrent(next, false);
  }, { signal });

  root.addEventListener("keydown", (event) => {
    const horizontal = config.orientation === "horizontal";
    const previousKey = horizontal ? "ArrowLeft" : "ArrowUp";
    const nextKey = horizontal ? "ArrowRight" : "ArrowDown";

    if (event.key === previousKey) {
      event.preventDefault();
      move(-1);
    } else if (event.key === nextKey) {
      event.preventDefault();
      move(1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setCurrent(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setCurrent(items.length - 1);
    }
  }, { signal });

  const api = {
    root,
    refresh,
    setCurrent,
    move,
    focusFirst() { setCurrent(0, true); return api; },
    focusLast() { setCurrent(items.length - 1, true); return api; },
    focusCurrent() { if (index >= 0) items[index].focus({ preventScroll: true }); return api; },
    setCurrentByElement(element, focus = false) {
      const next = items.indexOf(element);
      if (next >= 0) setCurrent(next, focus);
      return api;
    },
    get items() {
      return [...items];
    },
    get index() {
      return index;
    },
    destroy() {
      abort.abort();
      instances.delete(root);
    },
  };

  instances.set(root, api);
  refresh();
  return api;
}
