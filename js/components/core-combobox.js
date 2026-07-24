import { FloatingLayer } from '../runtime/floating.js';

export class CoreCombobox {
  constructor(root) {
    this.root = root;
    this.input = root.querySelector('[data-rui-input]');
    this.panel = root.querySelector('[data-rui-popup]');
    this.binding = window.RUICore.bindCombobox(root);
    this.floating = new FloatingLayer({ root, trigger: this.input, panel: this.panel, matchWidth: true });
    this.unsubscribe = this.binding.controller.subscribe((state) => {
      if (state.open) this.floating.open();
      else this.floating.close({ restore: false });
    });
  }

  destroy() { this.unsubscribe?.(); this.floating.destroy(); this.binding.destroy(); }
}

export function initCoreComboboxes(root = document) {
  return [...root.querySelectorAll('[data-rui-combobox]')].map((element) =>
    element.__ruiCoreCombobox || (element.__ruiCoreCombobox = new CoreCombobox(element))
  );
}
