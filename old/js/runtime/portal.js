const origins=new WeakMap();
export function mountPortal(node, host=document.body){ if(!node||origins.has(node)) return node; origins.set(node,{parent:node.parentNode,next:node.nextSibling}); host.append(node); node.dataset.ruiPortaled='true'; return node; }
export function unmountPortal(node){ const origin=origins.get(node); if(!origin) return node; if(origin.next?.isConnected) origin.parent.insertBefore(node,origin.next); else origin.parent.append(node); origins.delete(node); delete node.dataset.ruiPortaled; return node; }
export function isPortaled(node){ return origins.has(node); }
