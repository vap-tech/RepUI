import { $ } from '../runtime/dom.js';
export class ToastManager {
  constructor(region = $('[data-rui-toast-region]')) {
    this.region = region || this.createRegion();
  }
  createRegion() {
    const region = document.createElement('div');
    region.className = 'rui-toast-region';
    region.dataset.ruiToastRegion = '';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-relevant', 'additions');
    document.body.append(region);
    return region;
  }
  show({ title = 'Готово', description = '', duration = 4200 } = {}) {
    const toast = document.createElement('article');
    toast.className = 'rui-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = `<span class="rui-toast__icon" aria-hidden="true">●</span><div><div class="rui-toast__title"></div><div class="rui-toast__description"></div></div><button class="rui-toast__close" type="button" aria-label="Закрыть">×</button>`;
    $('.rui-toast__title', toast).textContent = title;
    $('.rui-toast__description', toast).textContent = description;
    const close = () => { toast.dataset.state = 'closing'; setTimeout(() => toast.remove(), 210); };
    $('.rui-toast__close', toast).addEventListener('click', close);
    this.region.append(toast);
    if (duration > 0) setTimeout(close, duration);
    return { element: toast, close };
  }
}
export function initToasts(root = document, manager = new ToastManager()) {
  root.querySelectorAll('[data-rui-toast]').forEach((trigger) => trigger.addEventListener('click', () => manager.show({ title: trigger.dataset.ruiToast || 'Готово', description: trigger.dataset.ruiToastDescription || '' })));
  return manager;
}
