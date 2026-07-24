import { $$ } from '../runtime/dom.js';
export function initLoadingButtons(root = document) {
  $$('[data-rui-demo-loading]', root).forEach((button) => button.addEventListener('click', () => {
    const label = button.textContent;
    button.dataset.loading = 'true'; button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Сохранение';
    setTimeout(() => { button.dataset.loading = 'false'; button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = label; }, 1500);
  }));
}
