/**
 * Tracks the most recent interaction modality for a composite widget.
 *
 * Native :hover remains true while a stationary pointer sits above an item.
 * Consumers can gate hover styling with data-input-mode so keyboard navigation
 * always exposes one unambiguous active item.
 */
export class InputModality {
  constructor(root, { initial = 'pointer' } = {}) {
    this.root = root;
    this.mode = initial;
    this.set(initial);
  }

  set(mode) {
    if (mode !== 'pointer' && mode !== 'keyboard') return this.mode;
    this.mode = mode;
    this.root.dataset.inputMode = mode;
    return mode;
  }

  pointer() {
    return this.set('pointer');
  }

  keyboard() {
    return this.set('keyboard');
  }
}
