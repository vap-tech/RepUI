import { InputModality } from '../core/input-modality.js';

export class Menubar {
  constructor(root) {
    this.root = root;
    this.menus = [...root.querySelectorAll('[data-rui-menubar-menu]')];
    this.triggers = this.menus.map((menu) => menu.querySelector('[data-rui-menubar-trigger]'));
    this.activeIndex = 0;
    this.modality = new InputModality(this.root);
    this.setupRovingTabindex();
    this.bind();
  }

  setupRovingTabindex() {
    this.triggers.forEach((trigger, index) => {
      if (!trigger) return;
      trigger.setAttribute('role', 'menuitem');
      trigger.tabIndex = index === this.activeIndex ? 0 : -1;
    });
  }

  setActive(index, { focus = false } = {}) {
    this.activeIndex = (index + this.triggers.length) % this.triggers.length;
    this.triggers.forEach((trigger, triggerIndex) => {
      if (!trigger) return;
      trigger.tabIndex = triggerIndex === this.activeIndex ? 0 : -1;
      trigger.toggleAttribute('data-active', triggerIndex === this.activeIndex);
    });
    if (focus) this.triggers[this.activeIndex]?.focus({ preventScroll: true });
  }

  bind() {
    this.menus.forEach((menu, index) => {
      const trigger = this.triggers[index];
      trigger?.addEventListener('pointerenter', () => {
        this.modality.pointer();
        this.setActive(index);
      });
      trigger?.addEventListener('focus', () => this.setActive(index));
      trigger?.addEventListener('click', () => this.toggle(index));
      trigger?.addEventListener('keydown', (event) => this.onTriggerKey(event, index));
      menu.querySelectorAll('[data-rui-menubar-item]').forEach((item, itemIndex) => {
        item.tabIndex = -1;
        item.addEventListener('pointermove', () => this.modality.pointer());
        item.addEventListener('keydown', (event) => this.onItemKey(event, index, itemIndex));
      });
    });

    this.root.addEventListener('click', (event) => {
      const item = event.target.closest('[data-rui-menubar-item]');
      if (!item || !this.root.contains(item)) return;
      this.closeAll(false);
      this.root.dispatchEvent(new CustomEvent('rui:menubarselect', {
        bubbles: true,
        detail: { item, value: item.dataset.value || item.textContent.trim(), href: item instanceof HTMLAnchorElement ? item.href : null },
      }));
    });

    document.addEventListener('pointerdown', (event) => {
      if (!this.root.contains(event.target)) this.closeAll();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.closeAll(true);
    });
  }

  onTriggerKey(event, index) {
    this.modality.keyboard();
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const next = (index + delta + this.menus.length) % this.menus.length;
      const wasOpen = this.triggers[index]?.getAttribute('aria-expanded') === 'true';
      this.closeAll();
      this.setActive(next, { focus: true });
      if (wasOpen) this.open(next, false);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      this.closeAll();
      this.setActive(event.key === 'Home' ? 0 : this.menus.length - 1, { focus: true });
    } else if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.open(index, true);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.open(index, true, true);
    }
  }

  onItemKey(event, menuIndex, itemIndex) {
    this.modality.keyboard();
    const items = [...this.menus[menuIndex].querySelectorAll('[data-rui-menubar-item]')];
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(itemIndex + 1) % items.length]?.focus({ preventScroll: true });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(itemIndex - 1 + items.length) % items.length]?.focus({ preventScroll: true });
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      items[event.key === 'Home' ? 0 : items.length - 1]?.focus({ preventScroll: true });
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const next = (menuIndex + delta + this.menus.length) % this.menus.length;
      this.setActive(next);
      this.open(next, true);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      this.closeAll(event.key === 'Escape');
    }
  }

  toggle(index) {
    this.setActive(index);
    this.triggers[index]?.getAttribute('aria-expanded') === 'true' ? this.closeAll(true) : this.open(index);
  }

  open(index, focusItem = false, focusLast = false) {
    this.setActive(index);
    this.closeAll();
    const menu = this.menus[index];
    const trigger = this.triggers[index];
    const content = menu.querySelector('[data-rui-menubar-content]');
    trigger?.setAttribute('aria-expanded', 'true');
    if (content) content.hidden = false;
    if (focusItem) queueMicrotask(() => {
      const items = [...(content?.querySelectorAll('[data-rui-menubar-item]') || [])];
      items[focusLast ? items.length - 1 : 0]?.focus({ preventScroll: true });
    });
  }

  closeAll(restore = false) {
    const activeMenu = this.menus.find((menu) => menu.querySelector('[data-rui-menubar-trigger]')?.getAttribute('aria-expanded') === 'true');
    this.menus.forEach((menu) => {
      menu.querySelector('[data-rui-menubar-trigger]')?.setAttribute('aria-expanded', 'false');
      const content = menu.querySelector('[data-rui-menubar-content]');
      if (content) content.hidden = true;
    });
    if (restore) activeMenu?.querySelector('[data-rui-menubar-trigger]')?.focus({ preventScroll: true });
  }
}

export function initMenubars(root = document) {
  return [...root.querySelectorAll('[data-rui-menubar]')].map((element) => element.__ruiMenubar || (element.__ruiMenubar = new Menubar(element)));
}
