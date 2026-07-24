import { $$, emit } from '../core/dom.js';
export function initAlerts(root = document) {
  $$('[data-rui-alert-close]', root).forEach((button) => button.addEventListener('click', () => {
    const alert = button.closest('.rui-alert');
    emit(alert, 'rui:alertclose');
    alert.remove();
  }));
}
