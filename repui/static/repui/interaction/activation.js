const instances = new WeakMap();

function isNativeButton(element) {
  return element instanceof HTMLButtonElement ||
    (element instanceof HTMLInputElement &&
      ["button", "submit", "reset"].includes(element.type));
}

function isNativeLink(element) {
  return element instanceof HTMLAnchorElement &&
    element.hasAttribute("href");
}

export function isInteractionDisabled(element) {
  return element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true" ||
    element.dataset.disabled === "true";
}

export function createActivation(element, options = {}) {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError("createActivation requires an HTMLElement");
  }

  const current = instances.get(element);
  if (current) return current;

  const config = {
    role: "button",
    eventName: "rui:activate",
    disabled: undefined,
    toggle: false,
    ...options,
  };

  const native = isNativeButton(element) || isNativeLink(element);
  const abort = new AbortController();
  const { signal } = abort;
  let spaceDown = false;

  if (!native) {
    if (config.role && !element.hasAttribute("role")) {
      element.setAttribute("role", config.role);
    }
    if (!element.hasAttribute("tabindex")) {
      element.tabIndex = 0;
    }
  }

  function disabled() {
    return config.disabled ?? isInteractionDisabled(element);
  }

  function refresh() {
    const value = disabled();
    element.dataset.ruiDisabled = String(value);

    if (isNativeButton(element)) {
      element.disabled = value;
    } else {
      element.setAttribute("aria-disabled", String(value));
      if (!native) element.tabIndex = value ? -1 : 0;
    }

    return api;
  }

  function dispatch(originalEvent, source) {
    if (disabled()) return false;

    if (config.toggle) {
      const next = element.getAttribute("aria-pressed") !== "true";
      element.setAttribute("aria-pressed", String(next));
    }

    return element.dispatchEvent(new CustomEvent(config.eventName, {
      bubbles: true,
      cancelable: true,
      detail: { source, originalEvent, element },
    }));
  }

  element.addEventListener("pointerdown", (event) => {
    if (disabled() || event.button !== 0) return;
    element.dataset.ruiActive = "true";
  }, { signal });

  for (const type of ["pointerup", "pointercancel", "pointerleave"]) {
    element.addEventListener(type, () => {
      delete element.dataset.ruiActive;
    }, { signal });
  }

  element.addEventListener("click", (event) => {
    if (disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    dispatch(event, "pointer");
  }, { signal });

  if (!native) {
    element.addEventListener("keydown", (event) => {
      if (disabled()) return;

      if (event.key === "Enter") {
        event.preventDefault();
        element.click();
      } else if (event.key === " " && !event.repeat) {
        event.preventDefault();
        spaceDown = true;
        element.dataset.ruiActive = "true";
      }
    }, { signal });

    element.addEventListener("keyup", (event) => {
      if (event.key !== " ") return;
      event.preventDefault();
      delete element.dataset.ruiActive;

      if (spaceDown && !disabled()) element.click();
      spaceDown = false;
    }, { signal });

    element.addEventListener("blur", () => {
      spaceDown = false;
      delete element.dataset.ruiActive;
    }, { signal });
  }

  const api = {
    element,
    refresh,
    get disabled() {
      return disabled();
    },
    destroy() {
      abort.abort();
      delete element.dataset.ruiActive;
      delete element.dataset.ruiDisabled;
      instances.delete(element);
    },
  };

  instances.set(element, api);
  refresh();
  return api;
}
