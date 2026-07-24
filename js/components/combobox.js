import { normalize } from '../core/collection.js';
import { FloatingLayer } from '../core/floating.js';
import { Listbox } from './listbox.js';
import { debug } from '../core/debug.js';

export class Combobox {
  constructor(root) {
    this.root = root;
    this.input = root.querySelector('[data-rui-combobox-input]');
    this.content = root.querySelector('[data-rui-combobox-content]');
    this.list = root.querySelector('[data-rui-combobox-list]') || this.content;
    this.hidden = root.querySelector('input[type="hidden"]');
    this.empty = root.querySelector('[data-rui-combobox-empty]');
    this.clearButton = root.querySelector('[data-rui-combobox-clear]');
    this.listbox = new Listbox(this.list, {
      onSelect: item => this.choose(item),
      interactionMode: 'managed',
      activeDescendantTarget: this.input,
      focusTarget: this.input,
    });
    this.floating = new FloatingLayer({
      root: this.root,
      trigger: this.input,
      panel: this.content,
      matchWidth: true,
    });
    this.onDoc = event => {
      if (!this.floating.contains(event.target)) this.close();
    };
    this.composing = false;
    this.escapeArmed = false;
    this.committedLabel = this.input.value || '';
    this.committedValue = this.hidden?.value || '';
    this.bind();
    this.root.addEventListener('rui:floatinganchorhidden', () => this.close());
  }

  get options() {
    return [...this.content.querySelectorAll('[data-rui-option]')];
  }

  bind() {
    this.input.setAttribute('role', 'combobox');
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-expanded', 'false');
    this.input.addEventListener('focus', () => this.open());
    this.input.addEventListener('compositionstart', () => { this.composing = true; });
    this.input.addEventListener('compositionend', () => { this.composing = false; this.handleInput(); });
    this.input.addEventListener('input', () => { if (!this.composing) this.handleInput(); });
    this.input.addEventListener('keydown', event => this.key(event));
    this.content.addEventListener('keydown', event => this.key(event));
    this.clearButton?.addEventListener('click', () => this.clear());
    document.addEventListener('pointerdown', this.onDoc);
  }

  handleInput() {
    this.escapeArmed = false;
    if (this.hidden) this.hidden.value = '';
    this.options.forEach(option => option.setAttribute('aria-selected', 'false'));
    this.filter();
    this.open();
  }

  open() {
    if (!this.content.hidden) {
      this.floating.position();
      return;
    }
    this.root.dataset.open = 'true';
    this.input.setAttribute('aria-expanded', 'true');
    this.floating.open();
    queueMicrotask(() => this.floating.position());
    debug('Combobox', 'opened', { root: this.root });
  }

  close() {
    if (this.content.hidden) return;
    this.root.dataset.open = 'false';
    this.input.setAttribute('aria-expanded', 'false');
    this.floating.close({ restore: true });
    debug('Combobox', 'closed', { root: this.root });
  }

  filter() {
    const term = normalize(this.input.value);
    let count = 0;
    this.options.forEach(option => {
      option.hidden = !normalize(`${option.dataset.keywords || ''} ${option.textContent}`).includes(term);
      if (!option.hidden) count += 1;
    });
    if (this.empty) this.empty.hidden = count > 0;
    if (this.clearButton) this.clearButton.hidden = !this.input.value;
    this.listbox.reconcile();
    this.floating.position();
    this.root.dispatchEvent(new CustomEvent('rui:comboboxquery', {
      bubbles: true,
      detail: { query: this.input.value },
    }));
  }

  choose(item) {
    const label = item.querySelector('[data-rui-option-label]')?.textContent.trim() || item.textContent.trim();
    const value = item.dataset.value ?? label;
    this.input.value = label;
    this.committedLabel = label;
    this.committedValue = value;
    this.escapeArmed = false;
    if (this.hidden) {
      this.hidden.value = value;
      this.hidden.dispatchEvent(new Event('change', { bubbles: true }));
    }
    this.options.forEach(option => option.setAttribute('aria-selected', option === item ? 'true' : 'false'));
    this.close();
    this.input.focus();
    this.root.dispatchEvent(new CustomEvent('rui:comboboxchange', {
      bubbles: true,
      detail: { value, label, item },
    }));
  }

  clear() {
    this.input.value = '';
    this.committedLabel = '';
    this.committedValue = '';
    this.escapeArmed = false;
    if (this.hidden) {
      this.hidden.value = '';
      this.hidden.dispatchEvent(new Event('change', { bubbles: true }));
    }
    this.options.forEach(option => {
      option.hidden = false;
      option.setAttribute('aria-selected', 'false');
    });
    if (this.clearButton) this.clearButton.hidden = true;
    this.input.focus();
    this.open();
    this.root.dispatchEvent(new CustomEvent('rui:comboboxchange', {
      bubbles: true,
      detail: { value: '', label: '', item: null },
    }));
  }

  key(event) {
    if (event.key === 'Escape') {
      if (this.content.hidden) return;
      event.preventDefault();
      const queryChanged = this.input.value !== this.committedLabel || (this.hidden?.value || '') !== this.committedValue;
      if (queryChanged && !this.escapeArmed) {
        this.input.value = this.committedLabel;
        if (this.hidden) this.hidden.value = this.committedValue;
        this.filter();
        this.escapeArmed = true;
        this.input.select();
      } else {
        this.escapeArmed = false;
        this.close();
      }
      return;
    }
    if (event.key === 'Tab') {
      this.escapeArmed = false;
      this.close();
      return;
    }

    const edgeKey = (event.ctrlKey && (event.key === 'Home' || event.key === 'End'))
      || (event.metaKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown'));
    if (edgeKey) {
      event.preventDefault();
      this.open();
      const key = event.key === 'Home' || event.key === 'ArrowUp' ? 'Home' : 'End';
      this.listbox.move(key);
      return;
    }

    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key) && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      this.open();
      this.listbox.move(event.key);
      return;
    }
    // Plain Home/End intentionally keep their native text-caret behavior.
    if (event.key === 'Enter' && this.listbox.active && !this.content.hidden) {
      event.preventDefault();
      this.listbox.select();
    }
  }
}

export function initComboboxes(root = document) {
  return [...root.querySelectorAll('[data-rui-combobox]')].map(element =>
    element.ruiCombobox || (element.ruiCombobox = new Combobox(element))
  );
}
