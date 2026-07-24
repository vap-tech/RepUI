import { focusable } from './dom.js';
let modality = 'pointer';
export function initFocusModality(){
  if(document.documentElement.dataset.ruiFocusReady) return;
  document.documentElement.dataset.ruiFocusReady='true';
  window.addEventListener('keydown', e=>{ if(e.key==='Tab'||e.key.startsWith('Arrow')){modality='keyboard';document.documentElement.dataset.ruiModality='keyboard';}}, true);
  window.addEventListener('pointerdown', ()=>{modality='pointer';document.documentElement.dataset.ruiModality='pointer';}, true);
}
export function getModality(){ return modality; }
export function focusFirst(container, fallback=container){ const node=focusable(container)[0]||fallback; node?.focus?.({preventScroll:true}); return node; }
export function restoreFocus(target){ if(target?.isConnected) requestAnimationFrame(()=>target.focus?.({preventScroll:true})); }
export function createFocusScope(container){
  return { first:()=>focusable(container)[0]||null, last:()=>focusable(container).at(-1)||null, focusFirst:()=>focusFirst(container), contains:node=>container.contains(node) };
}
