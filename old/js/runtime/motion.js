const reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function animateDisclosure(panel,open,{duration=180}={}){
  panel.__ruiDisclosureAnimation?.cancel();
  if(reducedMotion()||typeof panel.animate!=="function"){panel.hidden=!open;return Promise.resolve();}
  if(open) panel.hidden=false;
  const start=panel.getBoundingClientRect().height;
  const end=open?panel.scrollHeight:0;
  panel.style.overflow='hidden';
  const animation=panel.animate([
    {height:`${start}px`,opacity:open?.45:1},
    {height:`${end}px`,opacity:open?1:.25}
  ],{duration,easing:open?'cubic-bezier(.16,1,.3,1)':'cubic-bezier(.4,0,1,1)'});
  panel.__ruiDisclosureAnimation=animation;
  return animation.finished.catch(()=>{}).then(()=>{
    panel.style.removeProperty('height');panel.style.removeProperty('overflow');panel.style.removeProperty('opacity');
    if(!open) panel.hidden=true;
    if(panel.__ruiDisclosureAnimation===animation) panel.__ruiDisclosureAnimation=null;
  });
}
