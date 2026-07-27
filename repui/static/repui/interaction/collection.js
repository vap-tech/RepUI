export class CollectionController {
  constructor(options = {}) {
    this.loop = options.loop ?? false;
    this.disabledItemsFocusable =
      options.disabledItemsFocusable ?? false;
    this.items = [];
    this.activeIndex = -1;
  }

  setItems(items) {
    this.items = [...items];
    if (!this.isNavigable(this.activeIndex)) {
      this.activeIndex = this.first();
    }
    return this;
  }

  isNavigable(index) {
    const item = this.items[index];
    if (!item) return false;
    return this.disabledItemsFocusable || !item.disabled;
  }

  first() {
    return this.items.findIndex(
      (_, index) => this.isNavigable(index)
    );
  }

  last() {
    for (let index = this.items.length - 1; index >= 0; index -= 1) {
      if (this.isNavigable(index)) return index;
    }
    return -1;
  }

  selected() {
    return this.items.findIndex(
      (item, index) => item.selected && this.isNavigable(index)
    );
  }

  setActive(index) {
    if (!this.isNavigable(index)) return false;
    this.activeIndex = index;
    return true;
  }

  move(step) {
    if (!this.items.length) return -1;

    let index = this.activeIndex;
    for (let count = 0; count < this.items.length; count += 1) {
      index += step;

      if (this.loop) {
        index = (index + this.items.length) % this.items.length;
      } else if (index < 0 || index >= this.items.length) {
        return this.activeIndex;
      }

      if (this.isNavigable(index)) {
        this.activeIndex = index;
        return index;
      }
    }

    return this.activeIndex;
  }

  findByPrefix(prefix, start = this.activeIndex) {
    if (!prefix || !this.items.length) return -1;

    const normalized = prefix.toLocaleLowerCase();
    for (let offset = 1; offset <= this.items.length; offset += 1) {
      const index = (Math.max(start, -1) + offset) % this.items.length;
      const item = this.items[index];
      if (
        this.isNavigable(index) &&
        item.label.toLocaleLowerCase().startsWith(normalized)
      ) {
        return index;
      }
    }

    return -1;
  }

  getState() {
    return {
      items: this.items.map((item) => ({ ...item })),
      activeIndex: this.activeIndex,
    };
  }
}
