/**
 * RepUI embedded interaction core.
 * Collection semantics aligned with rui-core v0.1.2:
 * separate active/selected state, disabled/hidden/selectable filtering,
 * deterministic reconciliation after DOM changes, and reasoned events.
 */
export class CollectionController {
  constructor({ loopNavigation = true, disabledItemsFocusable = false } = {}) {
    this.options = { loopNavigation, disabledItemsFocusable };
    this.items = [];
    this.activeId = null;
    this.selectedIds = [];
    this.listeners = new Set();
  }

  getState() {
    return {
      items: [...this.items],
      activeId: this.activeId,
      selectedIds: [...this.selectedIds],
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(previousState, reason = 'programmatic', event = null) {
    const payload = { previousState, state: this.getState(), reason, event };
    this.listeners.forEach(listener => listener(payload));
  }

  isNavigable(itemOrId) {
    const item = typeof itemOrId === 'string'
      ? this.items.find(candidate => candidate.id === itemOrId)
      : itemOrId;
    if (!item || item.hidden || item.selectable === false) return false;
    return this.options.disabledItemsFocusable || !item.disabled;
  }

  isSelectable(itemOrId) {
    const item = typeof itemOrId === 'string'
      ? this.items.find(candidate => candidate.id === itemOrId)
      : itemOrId;
    return Boolean(item && !item.hidden && !item.disabled && item.selectable !== false);
  }

  setItems(items, { reason = 'itemschange', event = null } = {}) {
    const previousState = this.getState();
    const previousItems = this.items;
    const previousActiveId = this.activeId;
    this.items = [...items];

    if (previousActiveId && !this.isNavigable(previousActiveId)) {
      this.activeId = this.findNearestNavigable(previousItems, previousActiveId);
    }
    this.selectedIds = this.selectedIds.filter(id => this.items.some(item => item.id === id));
    this.emit(previousState, reason, event);
    return this.getState();
  }

  findNearestNavigable(previousItems, previousActiveId) {
    const index = previousItems.findIndex(item => item.id === previousActiveId);
    if (index >= 0) {
      for (let i = index + 1; i < previousItems.length; i += 1) {
        if (this.isNavigable(previousItems[i].id)) return previousItems[i].id;
      }
      for (let i = index - 1; i >= 0; i -= 1) {
        if (this.isNavigable(previousItems[i].id)) return previousItems[i].id;
      }
    }
    return this.items.find(item => this.isNavigable(item))?.id ?? null;
  }

  setActive(id, { reason = 'programmatic', event = null } = {}) {
    const nextId = id == null ? null : id;
    if (nextId !== null && !this.isNavigable(nextId)) return false;
    if (this.activeId === nextId) return false;
    const previousState = this.getState();
    this.activeId = nextId;
    this.emit(previousState, reason, event);
    return true;
  }

  move(direction, { reason = 'keyboard', event = null } = {}) {
    const navigable = this.items.filter(item => this.isNavigable(item));
    if (!navigable.length) return this.setActive(null, { reason, event });
    const current = navigable.findIndex(item => item.id === this.activeId);
    let next = current;
    if (direction === 'first') next = 0;
    else if (direction === 'last') next = navigable.length - 1;
    else if (direction === 'next') {
      next = current < 0 ? 0 : current + 1;
      if (next >= navigable.length) next = this.options.loopNavigation ? 0 : navigable.length - 1;
    } else if (direction === 'previous') {
      next = current < 0 ? navigable.length - 1 : current - 1;
      if (next < 0) next = this.options.loopNavigation ? navigable.length - 1 : 0;
    }
    return this.setActive(navigable[next]?.id ?? null, { reason, event });
  }

  destroy() {
    this.listeners.clear();
    this.items = [];
    this.activeId = null;
    this.selectedIds = [];
  }
}
