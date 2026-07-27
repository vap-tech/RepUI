const instances = new WeakMap();

function mountChip(element) {
  const current = instances.get(element);
  if (current) return current;

  const abort = new AbortController();
  const deleteButton = element.querySelector("[data-rui-chip-delete]");

  if (deleteButton) {
    deleteButton.addEventListener("click", (originalEvent) => {
      if (element.getAttribute("aria-disabled") === "true") return;

      const accepted = element.dispatchEvent(new CustomEvent("rui:delete", {
        bubbles: true,
        cancelable: true,
        detail: {
          element,
          value: element.dataset.value ?? null,
          originalEvent,
        },
      }));

      if (accepted && element.dataset.removeOnDelete === "true") {
        element.remove();
      }
    }, { signal: abort.signal });
  }

  const api = {
    element,
    destroy() {
      abort.abort();
      instances.delete(element);
    },
  };

  instances.set(element, api);
  return api;
}

export function mountChips(root = document) {
  const elements = [];
  if (root.matches?.("[data-rui-chip]")) elements.push(root);
  elements.push(...root.querySelectorAll?.("[data-rui-chip]") ?? []);
  return elements.map(mountChip);
}
