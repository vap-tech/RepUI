import {isTypeaheadKey,optionMetadata,OptionCollection,Typeahead} from '../core/collection.js';
import { InputModality } from '../core/input-modality.js';

const navigationKeys = new Set([
  'ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'
]);

/**
 * Public listbox adapter around the shared option collection mechanic.
 * Select, Combobox, and Command Palette use the same collection in managed
 * mode; standalone Listbox additionally owns focus and keyboard events.
 */
export class Listbox {
  constructor(root, {
    onSelect,
    interactionMode = 'standalone',
    activeDescendantTarget = interactionMode === 'standalone' ? root : null,
    focusTarget = interactionMode === 'standalone' ? root : activeDescendantTarget,
  } = {}) {
    this.root = root;
    this.selector = '[data-rui-option]';
    this.onSelect = onSelect;
    this.interactionMode = interactionMode;
    this.activeDescendantTarget = activeDescendantTarget;
    this.focusTarget = focusTarget;
    this.modality = new InputModality(this.root);
    this.collection = new OptionCollection(this.root, {
      selector: this.selector,
      activeDescendantTarget,
      focusTarget,
      onSelect: item => this.emitSelect(item),
    });
    this.typeahead = new Typeahead({
      getItems: () => this.items,
      getLabel: item => optionMetadata(item).label,
      onMatch: item => this.setActive(item, {focus: this.ownsKeyboard}),
    });
    this.bind();
  }

  get ownsKeyboard() { return this.interactionMode === 'standalone'; }
  get items() { return this.collection.items; }
  get active() { return this.collection.active; }
  set active(item) { item ? this.collection.setActive(item) : this.collection.clearActive(); }

  bind() {
    this.root.setAttribute('role', this.root.getAttribute('role') || 'listbox');
    if (this.ownsKeyboard) {
      if (!this.root.hasAttribute('tabindex')) this.root.tabIndex = 0;
    } else if (this.root.hasAttribute('tabindex')) {
      this.root.tabIndex = -1;
    }

    if (!this.ownsKeyboard) return;

    this.onFocus = () => this.reconcile();
    this.onKeydown = event => {
      if (navigationKeys.has(event.key)) {
        event.preventDefault();
        this.modality.keyboard();
        this.move(event.key, {focus: true});
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.select();
        return;
      }
      if (isTypeaheadKey(event)) {
        this.modality.keyboard();
        const match = this.typeahead.search(event.key, this.active);
        if (match) event.preventDefault();
      }
    };
    this.root.addEventListener('focus', this.onFocus);
    this.root.addEventListener('keydown', this.onKeydown);
  }

  refresh() { return this.collection.refresh(); }
  reconcile(options) { return this.collection.reconcile(options); }
  clearActive() { return this.collection.clearActive(); }
  setActive(item, options) { return this.collection.setActive(item, options); }
  move(key, options) {
    this.modality.keyboard();
    return this.collection.move(key, options);
  }
  select(item = this.active) { return this.collection.select(item); }

  emitSelect(item) {
    this.onSelect?.(item);
    this.root.dispatchEvent(new CustomEvent('rui:listboxselect', {
      bubbles: true,
      detail: optionMetadata(item),
    }));
  }

  destroy() {
    this.typeahead.reset();
    if (this.onFocus) this.root.removeEventListener('focus', this.onFocus);
    if (this.onKeydown) this.root.removeEventListener('keydown', this.onKeydown);
    this.collection.destroy();
  }
}

export function initListboxes(root = document) {
  return [...root.querySelectorAll('[data-rui-listbox]')]
    .map(el => el.ruiListbox || (el.ruiListbox = new Listbox(el, {
      interactionMode: 'standalone',
    })));
}
