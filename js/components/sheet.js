import { $$, emit, focusable } from '../runtime/dom.js';
import { lockScroll, unlockScroll, pushLayer, removeLayer, isTopLayer, trapTab } from '../runtime/overlay.js';

export class Sheet {
  constructor(root) {
    this.root = root;
    this.panel = root.querySelector('.rui-sheet__panel');
    this.body = root.querySelector('.rui-sheet__body');
    this.last = null;
    this.key = this.key.bind(this);
    this.updateScrollState = this.updateScrollState.bind(this);

    root.querySelector('.rui-sheet__backdrop')?.addEventListener('click', () => this.close());
    $$('[data-rui-sheet-close]', root).forEach((element) => {
      element.addEventListener('click', () => this.close());
    });
    this.body?.addEventListener('scroll', this.updateScrollState, { passive: true });
  }

  updateScrollState() {
    if (!this.body) return;
    const max = Math.max(0, this.body.scrollHeight - this.body.clientHeight);
    this.body.dataset.scrollTop = String(this.body.scrollTop <= 1);
    this.body.dataset.scrollBottom = String(this.body.scrollTop >= max - 1);
  }

  open(trigger = document.activeElement) {
    if (!this.root.hidden) return;
    this.last = trigger;
    this.root.hidden = false;
    this.root.setAttribute('aria-hidden', 'false');
    trigger?.setAttribute?.('aria-expanded', 'true');
    lockScroll();
    pushLayer(this);
    document.addEventListener('keydown', this.key);

    requestAnimationFrame(() => {
      this.updateScrollState();
      const preferred = this.panel.querySelector('[data-rui-sheet-initial-focus]');
      (preferred || focusable(this.panel)[0])?.focus?.() || this.panel.focus();
    });
    emit(this.root, 'rui:sheetopen');
  }

  close() {
    if (this.root.hidden) return;
    this.root.hidden = true;
    this.root.setAttribute('aria-hidden', 'true');
    this.last?.setAttribute?.('aria-expanded', 'false');
    unlockScroll();
    removeLayer(this);
    document.removeEventListener('keydown', this.key);
    this.last?.focus?.();
    emit(this.root, 'rui:sheetclose');
  }

  key(event) {
    if (!isTopLayer(this)) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    trapTab(event, this.panel);
  }
}

export function initSheets(root = document) {
  const map = new Map();
  $$('[data-rui-sheet]', root).forEach((node) => map.set(node.id, new Sheet(node)));
  $$('[data-rui-sheet-trigger]', root).forEach((trigger) => {
    const sheet = map.get(trigger.dataset.ruiSheetTrigger);
    if (!sheet) return;
    trigger.setAttribute('aria-controls', sheet.root.id);
    trigger.setAttribute('aria-expanded', String(!sheet.root.hidden));
    trigger.addEventListener('click', () => sheet.open(trigger));
  });
  return map;
}
