const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const topbar = document.getElementById('topbar');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');
const themeMeta = document.querySelector('meta[name="theme-color"]');

const savedTheme = localStorage.getItem('repyevka-theme');
const preferredTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
setTheme(savedTheme || preferredTheme);

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('repyevka-theme', theme);
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
  themeMeta.setAttribute('content', theme === 'dark' ? '#0e1216' : '#f7f8fb');
}

themeToggle.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

function updateTopbar() { topbar.classList.toggle('is-scrolled', scrollY > 12); }
updateTopbar();
addEventListener('scroll', updateTopbar, { passive: true });

mobileMenuButton.addEventListener('click', () => {
  const open = mobileMenuButton.getAttribute('aria-expanded') === 'true';
  mobileMenuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu.hidden = open;
  mobileMenuButton.querySelector('.icon-menu').style.display = open ? '' : 'none';
  mobileMenuButton.querySelector('.icon-close').style.display = open ? 'none' : 'block';
});

document.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', () => {
  mobileMenu.hidden = true;
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuButton.querySelector('.icon-menu').style.display = '';
  mobileMenuButton.querySelector('.icon-close').style.display = 'none';
}));

const modal = document.getElementById('helpModal');
let lastFocused;
function openModal() {
  lastFocused = document.activeElement;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal__close').focus();
}
function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lastFocused?.focus();
}
document.querySelectorAll('[data-open-modal]').forEach(button => button.addEventListener('click', openModal));
document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', closeModal));
addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.desktop-nav .nav-link')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });
sections.forEach(section => sectionObserver.observe(section));
