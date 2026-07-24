import { $$, emit } from '../core/dom.js';
import { placeFloating } from '../core/overlay.js';
export class DropdownMenu{
 constructor(root){this.root=root;this.trigger=root.querySelector('[data-rui-menu-trigger]');this.content=root.querySelector('[data-rui-menu-content]');this.items=()=>$$('[role="menuitem"]:not([disabled])',this.content).filter(x=>!x.hidden);this.opened=false;this.onDoc=this.onDoc.bind(this);this.trigger?.addEventListener('click',()=>this.toggle());this.trigger?.addEventListener('keydown',e=>{if(['ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();this.open();this.items()[0]?.focus();}});this.content?.addEventListener('keydown',e=>this.key(e));this.content?.addEventListener('click',e=>{const item=e.target.closest('[role="menuitem"]');if(item&&!item.hasAttribute('data-rui-menu-keep-open')){emit(this.root,'rui:menuselect',{value:item.dataset.value||item.textContent.trim()});this.close();}});}
 open(){if(this.opened)return;this.opened=true;this.content.hidden=false;this.trigger.setAttribute('aria-expanded','true');placeFloating(this.trigger,this.content,{align:this.root.dataset.align||'start'});setTimeout(()=>document.addEventListener('pointerdown',this.onDoc),0);emit(this.root,'rui:menuopen');}
 close(){if(!this.opened)return;this.opened=false;this.content.hidden=true;this.trigger.setAttribute('aria-expanded','false');document.removeEventListener('pointerdown',this.onDoc);emit(this.root,'rui:menuclose');}
 toggle(){this.opened?this.close():this.open();}
 onDoc(e){if(!this.root.contains(e.target))this.close();}
 key(e){const list=this.items(),i=list.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();this.close();this.trigger.focus();}if(e.key==='ArrowDown'){e.preventDefault();list[(i+1+list.length)%list.length]?.focus();}if(e.key==='ArrowUp'){e.preventDefault();list[(i-1+list.length)%list.length]?.focus();}if(e.key==='Home'){e.preventDefault();list[0]?.focus();}if(e.key==='End'){e.preventDefault();list.at(-1)?.focus();}}
}
export function initDropdowns(root=document){return $$('[data-rui-menu]',root).map(n=>new DropdownMenu(n));}
