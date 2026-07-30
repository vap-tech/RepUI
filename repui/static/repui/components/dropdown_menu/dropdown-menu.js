import { OverlayPortal } from "../../interaction/overlay-portal.js";

const instances = new WeakMap();
function collect(root) { const nodes=[]; if (root instanceof HTMLElement) nodes.push(...(root.matches("[data-rui-menu-trigger]")?[root]:[])); nodes.push(...(root.querySelectorAll?.("[data-rui-menu-trigger]")||[])); return [...new Set(nodes)]; }
class DropdownMenuRuntime {
  constructor(trigger) {
    this.trigger=trigger; this.menu=document.getElementById(trigger.dataset.ruiMenuTrigger); if(!this.menu) throw new Error("DropdownMenu trigger target not found"); this.opened=false; this.portal=new OverlayPortal(trigger,this.menu,{offset:8,matchAnchorWidth:false,align:"end",onRequestClose:()=>this.close()}); this.onClick=()=>this.toggle(); this.onSelect=(event)=>{const item=event.target.closest("[data-rui-menu-item]");if(!item||item.disabled)return;const context=this.trigger.closest("[data-rui-menu-context]");this.menu.dispatchEvent(new CustomEvent("rui:dropdownselect",{bubbles:true,detail:{action:item.dataset.value??null,item,trigger:this.trigger,context,contextData:context?{...context.dataset}:null}}));this.close();}; this.trigger.addEventListener("click",this.onClick); this.menu.addEventListener("click",this.onSelect); this.menu.hidden=true;
  }
  open(){if(this.opened)return this;this.menu.hidden=false;this.trigger.setAttribute("aria-expanded","true");this.portal.mount();this.opened=true;return this;}
  close(){if(!this.opened)return this;this.portal.unmount();this.menu.hidden=true;this.trigger.setAttribute("aria-expanded","false");this.opened=false;return this;}
  toggle(){return this.opened?this.close():this.open();}
  destroy(){this.close();this.trigger.removeEventListener("click",this.onClick);this.menu.removeEventListener("click",this.onSelect);this.portal.destroy();instances.delete(this.trigger);}
}
export function mountDropdownMenus(root=document){return collect(root).map((trigger)=>{let instance=instances.get(trigger);if(!instance){instance=new DropdownMenuRuntime(trigger);instances.set(trigger,instance);}return instance;});}
