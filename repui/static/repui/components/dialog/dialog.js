import { createOverlayStackEntry } from "../../interaction/overlay-stack.js";

const instances = new WeakMap();
const openDialogs = [];

function focusable(root) {
  return [...root.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((node) => !node.hidden && node.getClientRects().length);
}

export class DialogController {
  constructor(root) {
    this.root = root;
    this.panel = root.querySelector('[role="dialog"]');
    this.backdrop = root.querySelector('[data-rui-dialog-close]');
    this.abort = new AbortController();
    this.restoreTarget = null;
    this.overlayStack = createOverlayStackEntry({
      element: root,
      onEscape: () => this.close(),
    });
    this.onKeydown = this.onKeydown.bind(this);
    const { signal } = this.abort;
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest(`[data-rui-dialog-open="${this.root.id}"]`);
      if (trigger) this.open(trigger);
    }, { signal });
    root.querySelectorAll('[data-rui-dialog-close]').forEach((button) =>
      button.addEventListener('click', () => this.close(), { signal }),
    );
    root.addEventListener('click', (event) => {
      if (event.target === this.backdrop) this.close();
    }, { signal });
  }

  get opened() {
    return !this.root.hidden;
  }

  open(trigger = document.activeElement) {
    if (this.opened) return this;
    this.restoreTarget = trigger instanceof HTMLElement ? trigger : null;
    this.root.hidden = false;
    this.root.setAttribute('aria-hidden', 'false');
    openDialogs.push(this);
    this.overlayStack.activate();
    document.body.dataset.ruiScrollLock = 'true';
    document.addEventListener('keydown', this.onKeydown, { signal: this.abort.signal });
    requestAnimationFrame(() => (focusable(this.panel)[0] || this.panel)?.focus?.());
    this.root.dispatchEvent(new CustomEvent('rui:dialogopen', { bubbles: true }));
    return this;
  }

  close() {
    if (!this.opened || !this.overlayStack.isTop()) return this;
    this.root.hidden = true;
    this.root.setAttribute('aria-hidden', 'true');
    openDialogs.splice(openDialogs.lastIndexOf(this), 1);
    this.overlayStack.deactivate();
    if (!openDialogs.length) delete document.body.dataset.ruiScrollLock;
    this.restoreTarget?.focus({ preventScroll: true });
    this.root.dispatchEvent(new CustomEvent('rui:dialogclose', { bubbles: true }));
    return this;
  }

  onKeydown(event) {
    if (!this.overlayStack.isTop()) return;
    if (event.key !== 'Tab') return;
    const nodes = focusable(this.panel);
    if (!nodes.length) {
      event.preventDefault();
      this.panel?.focus();
      return;
    }
    const first = nodes[0];
    const last = nodes.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  destroy() {
    this.close();
    this.overlayStack.destroy();
    this.abort.abort();
    instances.delete(this.root);
  }
}

export function mountDialogs(root = document) {
  const nodes = root.matches?.('[data-rui-dialog]')
    ? [root]
    : [...root.querySelectorAll?.('[data-rui-dialog]') || []];
  return nodes.map((node) => {
    const current = instances.get(node);
    if (current) return current;
    const dialog = new DialogController(node);
    instances.set(node, dialog);
    return dialog;
  });
}
