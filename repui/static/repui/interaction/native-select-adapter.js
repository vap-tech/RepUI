/**
 * Native <select> state adapter.
 *
 * Custom controls may render their own UI, but form value and selected options
 * stay owned by the browser element. This class deliberately contains no
 * popup, keyboard or presentation behaviour.
 */
export class NativeSelectAdapter {
  constructor(select) {
    if (!(select instanceof HTMLSelectElement)) {
      throw new TypeError("NativeSelectAdapter requires an HTMLSelectElement");
    }
    this.select = select;
  }

  get multiple() {
    return this.select.multiple;
  }

  get disabled() {
    return this.select.disabled;
  }

  get options() {
    return [...this.select.options];
  }

  get selectedOptions() {
    return [...this.select.selectedOptions];
  }

  record(option, index) {
    return {
      id: option.dataset.ruiId || option.value || `option-${index}`,
      index,
      value: option.value,
      label: option.textContent.trim(),
      selected: option.selected,
      disabled: option.disabled,
    };
  }

  records() {
    return this.options.map((option, index) => this.record(option, index));
  }

  optionAt(index) {
    return this.select.options[index] ?? null;
  }

  selectIndex(index) {
    const option = this.optionAt(index);
    if (!option || option.disabled || this.disabled) return null;

    if (this.multiple) {
      option.selected = !option.selected;
    } else {
      this.select.selectedIndex = index;
    }

    return option;
  }

  setValue(nextValue) {
    const values = new Set(
      (Array.isArray(nextValue) ? nextValue : [nextValue]).map(String),
    );
    this.options.forEach((option) => {
      option.selected = values.has(option.value);
    });
  }

  emitChange() {
    this.select.dispatchEvent(new Event("input", { bubbles: true }));
    this.select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  get value() {
    return this.multiple
      ? this.selectedOptions.map((option) => option.value)
      : this.select.value;
  }
}
