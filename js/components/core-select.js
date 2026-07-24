import { FloatingLayer } from '../runtime/floating.js';

export class CoreSelect {
  constructor(root) {
    this.root = root;
    this.trigger = root.querySelector('[data-rui-select-trigger]');
    this.panel = root.querySelector('[data-rui-select-content]');
    if (!this.trigger || !this.panel || !window.RUICore?.bindSelect) throw new Error('Core Select markup or bundle is missing');
    this.binding = window.RUICore.bindSelect(root);
    this.floating = new FloatingLayer({ root, trigger: this.trigger, panel: this.panel, matchWidth: true });
    this.unsubscribe = this.binding.controller.subscribe((state) => {
      const value = root.querySelector('[data-rui-select-value], .rui-select__value');
      const selected = state.collection.selectedIds[0];
      const item = state.collection.items.find((entry) => entry.id === selected);
      if (value && item) {
        value.textContent = item.label;
        value.dataset.placeholder = 'false';
      }
      if (state.open) this.floating.open();
      else this.floating.close({ restore: false });
    });
  }

  destroy() {
    this.unsubscribe?.();
    this.floating.destroy();
    this.binding.destroy();
  }
}

export function initCoreSelects(root = document) {
  return [...root.querySelectorAll('[data-rui-select]')].map((element) =>
    element.__ruiCoreSelect || (element.__ruiCoreSelect = new CoreSelect(element))
  );
}
