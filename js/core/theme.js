const STORAGE_KEY = 'repui-theme';
export function getTheme() { return document.documentElement.dataset.theme || 'light'; }
export function setTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute('content', next === 'dark' ? '#0d1118' : '#f6f7fb'));
  document.dispatchEvent(new CustomEvent('rui:themechange', { detail: { theme: next } }));
  return next;
}
export function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}
  return setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
}
