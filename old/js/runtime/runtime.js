const cleanup = new Set();
export function onCleanup(fn){ cleanup.add(fn); return ()=>cleanup.delete(fn); }
export function destroy(){ cleanup.forEach(fn=>{try{fn();}catch(error){console.error('[RepUI] cleanup failed',error);}}); cleanup.clear(); document.dispatchEvent(new CustomEvent('rui:destroy')); }
export function emit(target,name,detail={}){ return target.dispatchEvent(new CustomEvent(`rui:${name}`,{detail,bubbles:true})); }
