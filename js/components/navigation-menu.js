import { InputModality } from '../core/input-modality.js';

export class NavigationMenu {
  constructor(root) {
    this.root = root;
    this.items = [...root.querySelectorAll('.rui-navigation-menu__list > [data-rui-navigation-trigger], .rui-navigation-menu__list > .rui-navigation-menu__link')];
    this.triggers = [...root.querySelectorAll('[data-rui-navigation-trigger]')];
    this.viewport = root.querySelector('[data-rui-navigation-viewport]');
    this.panels = [...root.querySelectorAll('[data-rui-navigation-panel]')];
    this.activeItemIndex = 0;
    this.modality = new InputModality(this.root);
    this.setupRovingTabindex();
    this.bind();
  }

  setupRovingTabindex() {
    this.items.forEach((item, index) => { item.tabIndex = index === this.activeItemIndex ? 0 : -1; });
  }

  setActiveItem(index, { focus = false } = {}) {
    this.activeItemIndex = (index + this.items.length) % this.items.length;
    this.items.forEach((item, itemIndex) => {
      item.tabIndex = itemIndex === this.activeItemIndex ? 0 : -1;
      item.toggleAttribute('data-active', itemIndex === this.activeItemIndex);
    });
    if (focus) this.items[this.activeItemIndex]?.focus({ preventScroll: true });
  }

  bind() {
    this.items.forEach((item, itemIndex) => {
      item.addEventListener('pointerenter', () => { this.modality.pointer(); this.setActiveItem(itemIndex); });
      item.addEventListener('focus', () => this.setActiveItem(itemIndex));
      item.addEventListener('keydown', (event) => this.onTopLevelKeydown(event, itemIndex));
    });

    this.triggers.forEach((trigger, triggerIndex) => {
      trigger.addEventListener('click', () => this.toggle(triggerIndex));
    });

    this.panels.forEach((panel, panelIndex) => {
      const focusables = [...panel.querySelectorAll('a,button')];
      focusables.forEach((item, itemIndex) => {
        item.addEventListener('pointermove', () => this.modality.pointer());
        item.addEventListener('keydown', (event) => this.onPanelKeydown(event, panelIndex, itemIndex, focusables));
      });
    });

    this.root.addEventListener('click', (event) => {
      const target = event.target.closest('[data-rui-navigation-panel] a, [data-rui-navigation-panel] button, [data-rui-navigation-close]');
      if (!target || !this.root.contains(target)) return;
      const panel = target.closest('[data-rui-navigation-panel]');
      const index = panel ? this.panels.indexOf(panel) : -1;
      this.close(false);
      this.root.dispatchEvent(new CustomEvent('rui:navigationselect', { bubbles: true, detail: { target, index, href: target instanceof HTMLAnchorElement ? target.href : null } }));
    });

    document.addEventListener('pointerdown', (event) => { if (!this.root.contains(event.target)) this.close(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') this.close(true); });
  }

  onTopLevelKeydown(event, itemIndex) {
    this.modality.keyboard();
    const item = this.items[itemIndex];
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (itemIndex + delta + this.items.length) % this.items.length;
      const nextItem = this.items[nextIndex];
      const currentWasOpen = item.matches('[data-rui-navigation-trigger][aria-expanded="true"]');
      this.setActiveItem(nextIndex, { focus: true });
      if (currentWasOpen && nextItem.matches('[data-rui-navigation-trigger]')) this.open(this.triggers.indexOf(nextItem));
      else if (currentWasOpen) this.close();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.setActiveItem(event.key === 'Home' ? 0 : this.items.length - 1, { focus: true });
    } else if (item.matches('[data-rui-navigation-trigger]') && ['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.open(this.triggers.indexOf(item), true);
    } else if (item.matches('[data-rui-navigation-trigger]') && event.key === 'ArrowUp') {
      event.preventDefault();
      this.open(this.triggers.indexOf(item), true, true);
    }
  }

  onPanelKeydown(event, panelIndex, itemIndex, items) {
    this.modality.keyboard();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(itemIndex + 1) % items.length]?.focus({ preventScroll: true });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(itemIndex - 1 + items.length) % items.length]?.focus({ preventScroll: true });
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const trigger = this.triggers[panelIndex];
      const topIndex = this.items.indexOf(trigger);
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (topIndex + delta + this.items.length) % this.items.length;
      const next = this.items[nextIndex];
      this.setActiveItem(nextIndex, { focus: true });
      if (next.matches('[data-rui-navigation-trigger]')) this.open(this.triggers.indexOf(next), true);
      else this.close();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
    }
  }

  toggle(index) {
    this.triggers[index].getAttribute('aria-expanded') === 'true' ? this.close(true) : this.open(index);
  }

  open(index, focus = false, focusLast = false) {
    const trigger = this.triggers[index];
    this.setActiveItem(this.items.indexOf(trigger));
    this.triggers.forEach((candidate, triggerIndex) => candidate.setAttribute('aria-expanded', String(triggerIndex === index)));
    this.panels.forEach((panel, panelIndex) => { panel.hidden = panelIndex !== index; });
    if (this.viewport) this.viewport.hidden = false;
    if (focus) queueMicrotask(() => {
      const items = [...(this.panels[index]?.querySelectorAll('a,button') || [])];
      items[focusLast ? items.length - 1 : 0]?.focus({ preventScroll: true });
    });
    this.root.dispatchEvent(new CustomEvent('rui:navigationopen', { bubbles: true, detail: { index } }));
  }

  close(restore = false) {
    const active = this.triggers.find((trigger) => trigger.getAttribute('aria-expanded') === 'true');
    const wasOpen = Boolean(active);
    this.triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
    this.panels.forEach((panel) => { panel.hidden = true; });
    if (this.viewport) this.viewport.hidden = true;
    if (restore && active) {
      this.setActiveItem(this.items.indexOf(active));
      active.focus({ preventScroll: true });
    }
    if (wasOpen) this.root.dispatchEvent(new CustomEvent('rui:navigationclose', { bubbles: true }));
  }
}

export function initNavigationMenus(root = document) {
  return [...root.querySelectorAll('[data-rui-navigation-menu]')].map((element) => element.__ruiNavigationMenu || (element.__ruiNavigationMenu = new NavigationMenu(element)));
}
