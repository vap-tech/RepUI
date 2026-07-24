import { FloatingLayer } from "../runtime/floating.js";

export class CoreMenu {
  constructor(root) {
    // Trigger остаётся в исходной разметке, а panel может быть вынесен в body через FloatingLayer.
    this.root = root;
    this.trigger = root.querySelector("[data-rui-menu-trigger]");
    this.panel = root.querySelector("[data-rui-menu-content]");
    if (!this.trigger || !this.panel || !window.RUICore?.bindMenu)
      throw new Error("Core Menu markup or bundle is missing");
    this.binding = window.RUICore.bindMenu(this.panel);
    this.floating = new FloatingLayer({
      root,
      trigger: this.trigger,
      panel: this.panel,
      matchWidth: false,
    });
    // Клик по trigger открывает/закрывает меню и при открытии ставит active на первый пункт.
    this.onTrigger = () => {
      if (this.binding.controller.getState().open)
        this.binding.controller.close("programmatic");
      else {
        this.binding.controller.open("pointer");
        this.focusFirst("pointer");
      }
    };
    this.onKey = (event) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        this.binding.controller.open("keyboard");
        this.focusFirst("keyboard");
      }
    };
    this.onPointerMove = (event) => {
      const item =
        event.target instanceof Element
          ? event.target.closest("[data-rui-menuitem]")
          : null;
      if (!item || !this.panel.contains(item)) return;
      if (!item.hasAttribute("aria-disabled")) {
        // Наведение мыши забирает ownership у клавиатуры.
        this.panel.dataset.inputMode = "pointer";
        this.binding.controller.collection.setActive(item.id, "pointer", event);
        this.syncActive();
        item.focus({ preventScroll: true });
      }
    };
    this.onOutside = (event) => {
      if (!this.floating.contains(event.target))
        this.binding.controller.close("programmatic");
    };
    this.unsubscribe = this.binding.controller.subscribe((state, reason) => {
      this.trigger.setAttribute("aria-expanded", String(state.open));
      // Core хранит состояние, RepUI отвечает за floating-позицию и возврат focus.
      if (state.open) this.floating.open();
      else {
        this.floating.close({ restore: false });
        this.trigger.focus({ preventScroll: true });
      }
      if (reason === "select") {
        // Сначала отправляем событие с выбранным пунктом, затем закрываем меню.
        const item = state.items.find((entry) => entry.id === state.activeId);
        this.root.dispatchEvent(
          new CustomEvent("rui:menuselect", {
            bubbles: true,
            detail: { value: item?.value, label: item?.label },
          }),
        );
        this.binding.controller.close("programmatic");
      }
    });
    this.trigger.addEventListener("click", this.onTrigger);
    this.trigger.addEventListener("keydown", this.onKey);
    this.panel.addEventListener("pointermove", this.onPointerMove);
    this.panel.addEventListener("mouseover", this.onPointerMove);
    document.addEventListener("pointerdown", this.onOutside);
  }

  focusFirst(reason = "keyboard") {
    // При любом открытии первый доступный пункт становится единственным active.
    const item = this.binding.controller
      .getState()
      .items.find((entry) => !entry.disabled);
    if (item) {
      this.panel.dataset.inputMode = "keyboard";
      this.binding.controller.collection.setActive(item.id, reason);
      this.syncActive();
      item.element?.focus();
    }
  }

  syncActive() {
    // В DOM всегда визуально отмечен ровно один active-пункт.
    const active = this.binding.controller.collection.getState().activeId;
    this.binding.controller
      .getState()
      .items.forEach((item) =>
        item.element?.toggleAttribute("data-active", item.id === active),
      );
  }

  destroy() {
    this.unsubscribe?.();
    this.trigger.removeEventListener("click", this.onTrigger);
    this.trigger.removeEventListener("keydown", this.onKey);
    this.panel.removeEventListener("pointermove", this.onPointerMove);
    this.panel.removeEventListener("mouseover", this.onPointerMove);
    document.removeEventListener("pointerdown", this.onOutside);
    this.floating.destroy();
    this.binding.destroy();
  }
}

export function initCoreMenus(root = document) {
  return [...root.querySelectorAll("[data-rui-menu]")].map(
    (element) =>
      element.__ruiCoreMenu || (element.__ruiCoreMenu = new CoreMenu(element)),
  );
}
