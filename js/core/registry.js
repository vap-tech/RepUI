const instances = new WeakMap();
const names = new WeakMap();
export function register(root, name, instance){ if(!root) return instance; instances.set(root,instance); names.set(root,name); root.dataset.ruiInitialized='true'; root.dataset.ruiComponent=name; return instance; }
export function unregister(root){ instances.delete(root); names.delete(root); delete root.dataset.ruiInitialized; delete root.dataset.ruiComponent; }
export function getInstance(target){ const root=typeof target==='string'?document.querySelector(target):target; return root?instances.get(root)||null:null; }
export function getComponentName(target){ const root=typeof target==='string'?document.querySelector(target):target; return root?names.get(root)||root.dataset.ruiComponent||null:null; }
