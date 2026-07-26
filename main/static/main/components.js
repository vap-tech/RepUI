const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const savedTheme = localStorage.getItem('repyevka-theme');
const preferredTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
function setTheme(theme){root.dataset.theme=theme;localStorage.setItem('repyevka-theme',theme);themeMeta.setAttribute('content',theme==='dark'?'#0e1216':'#f7f8fb');}
setTheme(savedTheme||preferredTheme);
themeToggle.addEventListener('click',()=>setTheme(root.dataset.theme==='dark'?'light':'dark'));

document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(item=>item.classList.remove('is-active'));tab.classList.add('is-active');document.getElementById('tabPanel').textContent=`Выбран раздел: ${tab.textContent.trim().replace(/\d+$/,'').trim()}.`;}));

const dropdownButton=document.getElementById('dropdownButton');
const dropdownMenu=document.getElementById('dropdownMenu');
dropdownButton.addEventListener('click',()=>dropdownMenu.hidden=!dropdownMenu.hidden);
document.addEventListener('click',event=>{if(!event.target.closest('.dropdown-demo'))dropdownMenu.hidden=true;});

const toast=document.getElementById('toast');
let toastTimer;
function hideToast(){toast.classList.remove('is-visible');}
document.getElementById('showToast').addEventListener('click',()=>{clearTimeout(toastTimer);toast.classList.add('is-visible');toastTimer=setTimeout(hideToast,3000);});
toast.querySelector('button').addEventListener('click',hideToast);

document.querySelectorAll('.alert>button').forEach(button=>button.addEventListener('click',()=>button.parentElement.remove()));

const modal=document.getElementById('demoModal');
let lastFocused;
function openModal(){lastFocused=document.activeElement;modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';modal.querySelector('input').focus();}
function closeModal(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';lastFocused?.focus();}
document.querySelector('[data-demo-modal]').addEventListener('click',openModal);
document.querySelectorAll('[data-close-demo]').forEach(el=>el.addEventListener('click',closeModal));
addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();document.getElementById('componentSearch').focus();}});

const sections=[...document.querySelectorAll('.docs-section')];
const navLinks=[...document.querySelectorAll('.docs-nav a')];
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)navLinks.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')===`#${entry.target.id}`));}),{rootMargin:'-30% 0px -60%'});
sections.forEach(section=>observer.observe(section));
