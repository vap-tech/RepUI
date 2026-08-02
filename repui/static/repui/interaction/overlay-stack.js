const entries = [];

let controller = null;

function remove(entry) {
  const index = entries.lastIndexOf(entry);
  if (index >= 0) entries.splice(index, 1);
}

function onKeydown(event) {
  if (event.key !== "Escape") return;

  const entry = entries.at(-1);
  if (!entry) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  entry.onEscape?.(event);
}

function ensureListener() {
  if (controller) return;

  controller = new AbortController();
  document.addEventListener("keydown", onKeydown, {
    capture: true,
    signal: controller.signal,
  });
}

function releaseListener() {
  if (entries.length || !controller) return;
  controller.abort();
  controller = null;
}

/**
 * Coordinates Escape ownership for independently composed overlays.
 * The most recently activated entry is the only layer that may dismiss.
 */
export function createOverlayStackEntry({ element, onEscape }) {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError("Overlay stack entry requires an HTMLElement");
  }

  const entry = {
    element,
    onEscape,
    active: false,
    activate() {
      remove(entry);
      entries.push(entry);
      entry.active = true;
      ensureListener();
      return entry;
    },
    deactivate() {
      remove(entry);
      entry.active = false;
      releaseListener();
      return entry;
    },
    isTop() {
      return entries.at(-1) === entry;
    },
    destroy() {
      return entry.deactivate();
    },
  };

  return entry;
}
