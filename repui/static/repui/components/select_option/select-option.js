import { createActivation } from "../../interaction/activation.js";

const instances = new WeakMap();

function mountOption(element) {
  const current = instances.get(element);
  if (current) return current;

  const activation = createActivation(element, {
    role: "option",
    eventName: "rui:activate",
  });

  const abort = new AbortController();

  element.addEventListener("rui:activate", (event) => {
    if (event.target !== element) return;
    element.dispatchEvent(new CustomEvent("rui:change", {
      bubbles: true,
      detail: {
        value: element.dataset.value,
        option: element,
        originalEvent: event.detail.originalEvent,
      },
    }));
  }, { signal: abort.signal });

  const api = {
    element,
    refresh() {
      activation.refresh();
      return api;
    },
    destroy() {
      abort.abort();
      activation.destroy();
      instances.delete(element);
    },
  };

  instances.set(element, api);
  return api;
}

export function mountSelectOptions(root = document) {
  const elements = [];
  if (root.matches?.("[data-rui-select-option]")) elements.push(root);
  elements.push(...root.querySelectorAll?.("[data-rui-select-option]") ?? []);
  return elements.map(mountOption);
}
