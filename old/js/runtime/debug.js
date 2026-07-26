let enabled = false;
export function setDebug(value = true) {
  enabled = Boolean(value);
  document.documentElement.dataset.ruiDebug = enabled ? 'true' : 'false';
  return enabled;
}
export function isDebug() { return enabled; }
export function debug(component, action, detail = {}) {
  if (!enabled) return;
  console.debug(`[RepUI:${component}] ${action}`, detail);
}
export function inspectComponent(target) {
  const root = typeof target === 'string' ? document.querySelector(target) : target;
  if (!root) return null;
  const type = root.matches('[data-rui-select]') ? 'Select'
    : root.matches('[data-rui-combobox]') ? 'Combobox'
    : root.matches('[data-rui-listbox]') ? 'Listbox'
    : root.matches('[data-rui-command]') ? 'CommandPalette'
    : 'Unknown';
  const instance = root.ruiSelect || root.ruiCombobox || root.ruiListbox || root.ruiCommand || null;
  const hidden = root.querySelector('input[type="hidden"]');
  return {
    component: type,
    version: window.RepUI?.version || 'unknown',
    initialized: Boolean(instance),
    open: root.dataset.open === 'true',
    portaled: Boolean(root.querySelector('[data-rui-portaled="true"]') || document.querySelector('[data-rui-portaled="true"]')),
    hiddenInput: hidden?.name || null,
    value: hidden?.value || null,
    activeId: instance?.listbox?.active?.id || instance?.active?.id || null,
  };
}
