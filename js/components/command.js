import { normalize } from '../runtime/collection.js';
import { Listbox } from './listbox.js';

const NAVIGATION_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp']);

export class CommandPalette {
  constructor(root) {
    this.root = root;
    this.panel = root.querySelector('[data-rui-command-panel]');
    this.input = root.querySelector('[data-rui-command-input]');
    this.list = root.querySelector('[data-rui-command-list]');
    this.empty = root.querySelector('[data-rui-command-empty]');
    this.count = root.querySelector('[data-rui-command-count]');
    this.previous = null;

    this.listbox = new Listbox(this.list, {
      onSelect: (item) => this.run(item),
      interactionMode: 'managed',
      activeDescendantTarget: this.input,
      focusTarget: this.input,
    });

    // Command options are controlled through aria-activedescendant on the input.
    // They must not create extra Tab stops inside the modal command surface.
    this.items.forEach((item) => {
      item.tabIndex = -1;
    });

    this.onDocumentKeydown = this.onDocumentKeydown.bind(this);
    this.onRootKeydown = this.onRootKeydown.bind(this);
    this.onPanelPointerDown = this.onPanelPointerDown.bind(this);
    this.bind();
  }

  get items() {
    return [...this.root.querySelectorAll('[data-rui-command-item]')];
  }

  bind() {
    document
      .querySelectorAll(`[data-rui-command-trigger="${this.root.id}"]`)
      .forEach((button) => button.addEventListener('click', () => this.open()));

    document.addEventListener('keydown', this.onDocumentKeydown);
    this.root.addEventListener('keydown', this.onRootKeydown);
    this.panel.addEventListener('pointerdown', this.onPanelPointerDown);
    this.root
      .querySelector('[data-rui-command-backdrop]')
      ?.addEventListener('click', () => this.close());
    this.input.addEventListener('input', () => this.filter());
  }

  onPanelPointerDown(event) {
    if (event.button !== 0) return;

    const interactive = event.target.closest(
      'input, button, a, select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
    );
    if (interactive) return;

    // Do not interfere with dragging the native list scrollbar.
    if (event.target === this.list) {
      const overVerticalScrollbar = event.offsetX >= this.list.clientWidth;
      const overHorizontalScrollbar = event.offsetY >= this.list.clientHeight;
      if (overVerticalScrollbar || overHorizontalScrollbar) return;
    }

    // Passive palette chrome must not hand keyboard ownership to the page.
    event.preventDefault();
    this.input.focus({ preventScroll: true });
  }

  onDocumentKeydown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.open();
      return;
    }

    if (event.key === 'Escape' && !this.root.hidden) {
      event.preventDefault();
      this.close();
    }
  }

  onRootKeydown(event) {
    if (this.root.hidden) return;

    const edgeKey = (event.ctrlKey && (event.key === 'Home' || event.key === 'End'))
      || (event.metaKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown'));
    if (edgeKey) {
      event.preventDefault();
      const key = event.key === 'Home' || event.key === 'ArrowUp' ? 'Home' : 'End';
      this.listbox.move(key);
      return;
    }

    if (NAVIGATION_KEYS.has(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.listbox.move(event.key);
      return;
    }
    // Plain Home/End remain native caret controls for the search input.

    if (event.key === 'Enter' && this.listbox.active) {
      event.preventDefault();
      this.listbox.modality.keyboard();
      this.listbox.select();
      return;
    }

    if (event.key === 'Tab') {
      // The palette follows the combobox/listbox pattern: DOM focus remains on
      // the search input while the active command is exposed through ARIA.
      event.preventDefault();
      this.input.focus({ preventScroll: true });
    }
  }

  open() {
    if (!this.root.hidden) return;

    this.previous = document.activeElement;
    this.root.hidden = false;
    this.root.dataset.open = 'true';
    document.documentElement.dataset.ruiScrollLocked = 'true';

    queueMicrotask(() => {
      this.input.focus({ preventScroll: true });
      this.input.select();
      this.filter();
    });

    this.root.dispatchEvent(
      new CustomEvent('rui:commandopen', { bubbles: true }),
    );
  }

  close() {
    if (this.root.hidden) return;

    this.root.hidden = true;
    delete this.root.dataset.open;
    delete document.documentElement.dataset.ruiScrollLocked;
    this.previous?.focus?.({ preventScroll: true });

    this.root.dispatchEvent(
      new CustomEvent('rui:commandclose', { bubbles: true }),
    );
  }

  filter() {
    const term = normalize(this.input.value);
    let count = 0;

    this.items.forEach((item) => {
      item.hidden = !normalize(
        `${item.dataset.keywords || ''} ${item.textContent}`,
      ).includes(term);
      if (!item.hidden) count += 1;
    });

    this.root.querySelectorAll('[data-rui-command-group]').forEach((group) => {
      group.hidden = !group.querySelector(
        '[data-rui-command-item]:not([hidden])',
      );
    });

    if (this.empty) this.empty.hidden = count > 0;
    if (this.count) {
      this.count.textContent = `${count} ${this.commandWord(count)}`;
    }

    this.listbox.reconcile();
  }

  commandWord(count) {
    const mod100 = count % 100;
    const mod10 = count % 10;
    if (mod100 >= 11 && mod100 <= 14) return 'команд';
    if (mod10 === 1) return 'команда';
    if (mod10 >= 2 && mod10 <= 4) return 'команды';
    return 'команд';
  }

  run(item) {
    const action =
      item.dataset.action || item.dataset.value || item.textContent.trim();

    this.close();
    this.root.dispatchEvent(
      new CustomEvent('rui:commandselect', {
        bubbles: true,
        detail: { action, item },
      }),
    );

    if (item.dataset.href) location.href = item.dataset.href;
  }
}

export function initCommands(root = document) {
  return [...root.querySelectorAll('[data-rui-command]')].map(
    (element) =>
      element.ruiCommand ||
      (element.ruiCommand = new CommandPalette(element)),
  );
}
