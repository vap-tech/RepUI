import { OverlayPortal } from "../../interaction/overlay-portal.js";
import { createDismissLayer } from "../../interaction/dismiss-layer.js";
import { createOverlayStackEntry } from "../../interaction/overlay-stack.js";
import { getMenu } from "../menu/menu.js";

const instances = new WeakMap();

function collect(root) {
  const nodes = [];
  if (root instanceof HTMLElement && root.matches("[data-rui-menu-trigger]")) nodes.push(root);
  nodes.push(...(root.querySelectorAll?.("[data-rui-menu-trigger]") || []));
  return [...new Set(nodes)];
}

class DropdownMenuRuntime {
  constructor(trigger) {
    this.trigger = trigger;
    this.menu = document.getElementById(trigger.dataset.ruiMenuTrigger);
    if (!this.menu) throw new Error("DropdownMenu trigger target not found");
    this.menuRoot = this.menu.matches("[data-rui-menu]")
      ? this.menu
      : this.menu.querySelector("[data-rui-menu]");
    if (!this.menuRoot) throw new Error("DropdownMenu requires one Menu root");
    this.menuRuntime = getMenu(this.menuRoot);
    this.opened = false;
    this.dismiss = null;
    this.overlayStack = createOverlayStackEntry({
      element: this.menu,
      onEscape: () => this.close({ restoreFocus: true }),
    });
    this.portal = new OverlayPortal(trigger, this.menu, {
      offset: 8,
      matchAnchorWidth: false,
      align: "end",
      onAnchorHidden: () => this.close(),
    });
    this.onClick = () => this.toggle();
    this.onTriggerKeyDown = (event) => {
      if (["ArrowDown", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        this.open("first");
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        this.open("last");
      } else if (event.key === "Escape" && this.opened) {
        event.preventDefault();
        this.close({ restoreFocus: true });
      }
    };
    this.onMenuKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        this.close({ restoreFocus: true });
      } else if (event.key === "Tab") {
        this.close();
      }
    };
    this.onSelect = (event) => {
      const item = event.target.closest("[data-rui-menu-item]");
      if (!item || item.disabled) return;
      const context = this.trigger.closest("[data-rui-menu-context]");
      this.menu.dispatchEvent(new CustomEvent("rui:dropdownselect", {
        bubbles: true,
        detail: {
          action: item.dataset.value ?? null,
          item,
          trigger: this.trigger,
          context,
          contextData: context ? { ...context.dataset } : null,
        },
      }));
      this.close({ restoreFocus: true });
    };
    this.trigger.setAttribute("aria-haspopup", "menu");
    this.trigger.setAttribute("aria-expanded", "false");
    this.trigger.addEventListener("click", this.onClick);
    this.trigger.addEventListener("keydown", this.onTriggerKeyDown);
    this.menu.addEventListener("keydown", this.onMenuKeyDown);
    this.menu.addEventListener("click", this.onSelect);
    this.menu.hidden = true;
  }

  focusItem(position) {
    if (position === "last") this.menuRuntime.focusLast();
    else this.menuRuntime.focusFirst();
  }

  open(focusPosition = null) {
    if (this.opened) {
      if (focusPosition) this.focusItem(focusPosition);
      return this;
    }
    this.menu.hidden = false;
    this.trigger.setAttribute("aria-expanded", "true");
    this.portal.mount();
    this.opened = true;
    this.dismiss = createDismissLayer({
      anchor: this.trigger,
      overlay: this.menu,
      escape: false,
      onDismiss: () => this.close(),
    });
    this.overlayStack.activate();
    if (focusPosition) queueMicrotask(() => this.focusItem(focusPosition));
    return this;
  }

  close({ restoreFocus = false } = {}) {
    if (!this.opened) return this;
    this.menu.hidden = true;
    this.dismiss?.destroy();
    this.dismiss = null;
    this.overlayStack.deactivate();
    this.portal.unmount();
    this.trigger.setAttribute("aria-expanded", "false");
    this.opened = false;
    if (restoreFocus) this.trigger.focus({ preventScroll: true });
    return this;
  }

  toggle() { return this.opened ? this.close() : this.open(); }

  destroy() {
    this.close();
    this.trigger.removeEventListener("click", this.onClick);
    this.trigger.removeEventListener("keydown", this.onTriggerKeyDown);
    this.menu.removeEventListener("keydown", this.onMenuKeyDown);
    this.menu.removeEventListener("click", this.onSelect);
    // Menu belongs to the shared runtime bootstrap. DropdownMenu only owns
    // its trigger, portal and dismiss layer.
    this.portal.destroy();
    this.overlayStack.destroy();
    this.dismiss?.destroy();
    instances.delete(this.trigger);
  }
}

export function mountDropdownMenus(root = document) {
  return collect(root).map((trigger) => {
    let instance = instances.get(trigger);
    if (!instance) {
      instance = new DropdownMenuRuntime(trigger);
      instances.set(trigger, instance);
    }
    return instance;
  });
}
