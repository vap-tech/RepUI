const instances = new WeakMap();

function isButtonElement(element) {
  return element instanceof HTMLElement &&
    element.matches(".rui-button");
}

function mountButton(element) {
  const current = instances.get(element);
  if (current) return current;

  /*
   * Button remains fully native.
   *
   * No click, keyboard, focus or disabled behavior is emulated here.
   * The runtime handle exists only to provide the common RepUI lifecycle
   * contract to applications that manage heterogeneous components.
   */
  const api = {
    element,

    refresh() {
      return api;
    },

    destroy() {
      instances.delete(element);
    },
  };

  instances.set(element, api);
  return api;
}

export function mountButtons(root = document) {
  const elements = [];

  if (isButtonElement(root)) {
    elements.push(root);
  }

  if (root?.querySelectorAll) {
    elements.push(...root.querySelectorAll(".rui-button"));
  }

  return elements.map(mountButton);
}
