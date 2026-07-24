import { $, $$, emit, focusable } from '../runtime/dom.js';
let stack = [];
export class Dialog {
  constructor(root) {
    this.root = root;
    this.panel = $('[role="dialog"]', root) || $('.rui-dialog__panel', root);
    this.lastFocus = null;
    this.onKeydown = this.onKeydown.bind(this);
    $$('[data-rui-dialog-close]', root).forEach((node) => node.addEventListener('click', () => this.close()));
    $('.rui-dialog__backdrop', root)?.addEventListener('click', () => this.close());
  }
  open(trigger = document.activeElement) {
    if (!this.root.hidden) return;
    this.lastFocus = trigger;
    this.root.hidden = false;
    this.root.setAttribute('aria-hidden', 'false');
    document.body.dataset.ruiScrollLock = 'true';
    stack.push(this);
    document.addEventListener('keydown', this.onKeydown);
    requestAnimationFrame(() => (focusable(this.panel)[0] || this.panel)?.focus?.());
    emit(this.root, 'rui:dialogopen');
  }
  close() {
    if (this.root.hidden) return;
    this.root.hidden = true;
    this.root.setAttribute('aria-hidden', 'true');
    stack = stack.filter((item) => item !== this);
    if (!stack.length) delete document.body.dataset.ruiScrollLock;
    document.removeEventListener('keydown', this.onKeydown);
    this.lastFocus?.focus?.();
    emit(this.root, 'rui:dialogclose');
  }
  onKeydown(event) {
    if (stack.at(-1) !== this) return;
    if (event.key === 'Escape') { event.preventDefault(); this.close(); return; }
    if (event.key !== 'Tab') return;
    const nodes = focusable(this.panel);
    if (!nodes.length) { event.preventDefault(); this.panel?.focus?.(); return; }
    const first = nodes[0], last = nodes.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
}
export function initDialogs(root = document) {
  const instances = new Map();
  $$('[data-rui-dialog]', root).forEach((node) => instances.set(node.id, new Dialog(node)));
  $$('[data-rui-dialog-trigger]', root).forEach((trigger) => trigger.addEventListener('click', () => instances.get(trigger.dataset.ruiDialogTrigger)?.open(trigger)));
  return instances;
}
