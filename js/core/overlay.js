import { focusable } from './dom.js';
const openLayers = [];
let locks = 0;
export function lockScroll(){ locks += 1; document.body.dataset.ruiScrollLock='true'; }
export function unlockScroll(){ locks=Math.max(0,locks-1); if(!locks) delete document.body.dataset.ruiScrollLock; }
export function pushLayer(layer){ openLayers.push(layer); }
export function removeLayer(layer){ const i=openLayers.lastIndexOf(layer); if(i>=0) openLayers.splice(i,1); }
export function isTopLayer(layer){ return openLayers.at(-1)===layer; }
export function trapTab(event, container){ if(event.key!=='Tab') return; const nodes=focusable(container); if(!nodes.length){event.preventDefault(); container.focus?.(); return;} const first=nodes[0],last=nodes.at(-1); if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();} else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
export function placeFloating(trigger, panel, {side='bottom', align='start', gap=8}={}){
  panel.style.visibility='hidden'; panel.hidden=false;
  const t=trigger.getBoundingClientRect(), p=panel.getBoundingClientRect();
  let top=side==='top'?t.top-p.height-gap:t.bottom+gap;
  let left=align==='end'?t.right-p.width:align==='center'?t.left+(t.width-p.width)/2:t.left;
  if(top+p.height>innerHeight-8) top=Math.max(8,t.top-p.height-gap);
  if(top<8) top=8;
  left=Math.min(Math.max(8,left),innerWidth-p.width-8);
  panel.style.position='fixed'; panel.style.top=`${Math.round(top)}px`; panel.style.left=`${Math.round(left)}px`; panel.style.visibility='';
}
