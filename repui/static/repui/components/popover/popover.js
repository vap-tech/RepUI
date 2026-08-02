import { OverlayPortal } from "../../interaction/overlay-portal.js";
import { createDismissLayer } from "../../interaction/dismiss-layer.js";
import { createOverlayStackEntry } from "../../interaction/overlay-stack.js";

const instances = new WeakMap();
function collect(root) { const nodes = []; if (root instanceof HTMLElement && root.matches("[data-rui-popover]")) nodes.push(root); nodes.push(...(root.querySelectorAll?.("[data-rui-popover]") || [])); return [...new Set(nodes)]; }
class PopoverRuntime {
  constructor(element) {
    this.element = element; this.trigger = element.querySelector("[data-rui-popover-trigger]"); this.content = element.querySelector("[data-rui-popover-content]");
    this.portal = new OverlayPortal(this.trigger, this.content, { offset: 8, matchAnchorWidth: false, align: "center", onAnchorHidden: () => this.close() });
    this.dismiss = createDismissLayer({ anchor: this.trigger, overlay: this.content, escape: false, onDismiss: () => this.close() });
    this.overlayStack = createOverlayStackEntry({ element: this.content, onEscape: () => this.close() });
    this.onClick = () => this.toggle(); this.trigger.addEventListener("click", this.onClick);
  }
  open() { if (!this.content.hidden) return this; this.content.hidden = false; this.trigger.setAttribute("aria-expanded", "true"); this.portal.mount(); this.overlayStack.activate(); return this; }
  close() { if (this.content.hidden) return this; this.overlayStack.deactivate(); this.portal.unmount(); this.content.hidden = true; this.trigger.setAttribute("aria-expanded", "false"); return this; }
  toggle() { return this.content.hidden ? this.open() : this.close(); }
  refresh() { this.portal.schedulePosition(); return this; }
  destroy() { this.close(); this.portal.destroy(); this.dismiss.destroy(); this.overlayStack.destroy(); this.trigger.removeEventListener("click", this.onClick); instances.delete(this.element); }
}
export function mountPopovers(root = document) { return collect(root).map((element) => { let instance = instances.get(element); if (!instance) { instance = new PopoverRuntime(element); instances.set(element, instance); } return instance; }); }
