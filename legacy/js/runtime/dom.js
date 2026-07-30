export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
export const emit = (target, name, detail = {}) => target.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
export const focusable = (root) => $$('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])', root).filter((node) => !node.hidden && node.getAttribute('aria-hidden') !== 'true');
