import { placeFloating } from "./overlay.js";
import { debug } from "./debug.js";

function getScrollParents(element) {
  // Собираем все scroll-контейнеры до body, чтобы popup следовал за anchor.
  const parents = [];
  let node = element?.parentElement;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (
      /(auto|scroll|overlay)/.test(
        `${style.overflow}${style.overflowX}${style.overflowY}`,
      )
    )
      parents.push(node);
    node = node.parentElement;
  }
  parents.push(window);
  return [...new Set(parents)];
}

export class FloatingLayer {
  constructor({
    root,
    trigger,
    panel,
    side = "bottom",
    align = "start",
    gap = 8,
    matchWidth = true,
    viewportPadding = 12,
  } = {}) {
    // FloatingLayer отвечает только за геометрию и жизненный цикл портала, но не за состояние открытия компонента.
    this.root = root;
    this.trigger = trigger;
    this.panel = panel;
    this.side = side;
    this.align = align;
    this.gap = gap;
    this.matchWidth = matchWidth;
    this.viewportPadding = viewportPadding;
    this.placeholder = document.createComment("rui-floating-layer");
    this.mounted = false;
    this.opened = false;
    this.frame = 0;
    this.scrollParents = [];
    this.schedulePosition = () => {
      // Все частые запросы на перепозиционирование объединяем в один кадр анимации.
      if (!this.opened || this.frame) return;
      this.frame = requestAnimationFrame(() => {
        this.frame = 0;
        this.position();
      });
    };
    this.resizeObserver =
      "ResizeObserver" in window
        ? new ResizeObserver(this.schedulePosition)
        : null;
    this.intersectionObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              if (this.opened && entries[0] && !entries[0].isIntersecting) {
                this.root?.dispatchEvent(
                  new CustomEvent("rui:floatinganchorhidden", {
                    bubbles: true,
                  }),
                );
              }
            },
            { threshold: 0 },
          )
        : null;
  }

  contains(target) {
    // Используется для клика снаружи: учитываем исходный root и вынесенную panel.
    return Boolean(this.root?.contains(target) || this.panel?.contains(target));
  }

  mount() {
    if (this.mounted || !this.panel?.parentNode) return;
    this.panel.parentNode.insertBefore(this.placeholder, this.panel);

    // Временно прячем panel перед вынесением в портал, чтобы он не участвовал в раскладке страницы.
    // Иначе focus на input внутри panel может прокрутить документ к его
    // временной статичной позиции до расчёта координат.
    this.panel.style.position = "fixed";
    this.panel.style.visibility = "hidden";
    this.panel.style.top = "0";
    this.panel.style.left = "0";

    document.body.append(this.panel);
    this.panel.dataset.ruiPortaled = "true";
    this.mounted = true;
    debug("Floating", "portal mounted", { panel: this.panel });
  }

  restore() {
    if (!this.mounted) return;
    if (this.placeholder.parentNode) {
      this.placeholder.parentNode.insertBefore(this.panel, this.placeholder);
      this.placeholder.remove();
    }
    delete this.panel.dataset.ruiPortaled;
    delete this.panel.dataset.side;
    delete this.panel.dataset.constrained;
    [
      "position",
      "top",
      "left",
      "right",
      "bottom",
      "width",
      "min-width",
      "max-width",
      "max-height",
      "visibility",
    ].forEach((prop) => {
      this.panel.style.removeProperty(prop);
    });
    this.mounted = false;
    debug("Floating", "portal restored", { panel: this.panel });
  }

  position() {
    // Сначала измеряем свободное место, затем выбираем сторону и ограничиваем высоту.
    if (!this.opened || !this.trigger?.isConnected || !this.panel?.isConnected)
      return;
    const anchor = this.trigger.getBoundingClientRect();
    if (anchor.width === 0 && anchor.height === 0) return;

    const viewport = window.visualViewport;
    const viewportTop = viewport?.offsetTop ?? 0;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportRight = viewportLeft + viewportWidth;
    const viewportBottom = viewportTop + viewportHeight;

    // После вынесения в портал проценты считаются относительно body,
    // поэтому явно задаём ширину, чтобы Select и Combobox оставались привязаны к control.
    if (this.matchWidth) {
      const width = Math.min(
        Math.round(anchor.width),
        Math.floor(viewportWidth - this.viewportPadding * 2),
      );
      this.panel.style.width = `${width}px`;
      this.panel.style.minWidth = `${width}px`;
    }
    this.panel.style.maxWidth = `${Math.max(0, Math.floor(viewportWidth - this.viewportPadding * 2))}px`;

    // Сначала получаем естественную высоту, потом решаем, нужен ли flip и max-height.
    this.panel.style.removeProperty("max-height");
    placeFloating(this.trigger, this.panel, {
      side: this.side,
      align: this.align,
      gap: this.gap,
    });
    const naturalRect = this.panel.getBoundingClientRect();
    const roomBelow = Math.max(
      0,
      viewportBottom - anchor.bottom - this.gap - this.viewportPadding,
    );
    const roomAbove = Math.max(
      0,
      anchor.top - viewportTop - this.gap - this.viewportPadding,
    );
    const preferredRoom = this.side === "top" ? roomAbove : roomBelow;
    const oppositeRoom = this.side === "top" ? roomBelow : roomAbove;
    const shouldFlip =
      preferredRoom < naturalRect.height && oppositeRoom > preferredRoom;
    const finalSide = shouldFlip
      ? this.side === "top"
        ? "bottom"
        : "top"
      : this.side;
    const available = finalSide === "top" ? roomAbove : roomBelow;

    // Если снизу мало места, panel открывается вверх; иначе сохраняем предпочтительную сторону.

    this.panel.style.maxHeight = `${Math.max(0, Math.floor(available))}px`;
    placeFloating(this.trigger, this.panel, {
      side: finalSide,
      align: this.align,
      gap: this.gap,
    });

    const finalRect = this.panel.getBoundingClientRect();
    const minLeft = viewportLeft + this.viewportPadding;
    const maxLeft = Math.max(
      minLeft,
      viewportRight - finalRect.width - this.viewportPadding,
    );
    const shiftedLeft = Math.min(Math.max(finalRect.left, minLeft), maxLeft);
    // Горизонтальный shift не даёт popup выйти за безопасные границы viewport.
    this.panel.style.left = `${Math.round(shiftedLeft)}px`;
    this.panel.style.visibility = "";
    this.panel.dataset.side = finalSide;
    this.panel.dataset.constrained =
      naturalRect.height > available ? "true" : "false";
    debug("Floating", "positioned", {
      side: finalSide,
      left: shiftedLeft,
      maxHeight: available,
      viewport: {
        top: viewportTop,
        left: viewportLeft,
        width: viewportWidth,
        height: viewportHeight,
      },
    });
  }

  observe() {
    // Пока panel открыт, следим за прокруткой, изменением окна, visual viewport и размерами anchor.
    this.scrollParents = getScrollParents(this.trigger);
    this.scrollParents.forEach((parent) =>
      parent.addEventListener("scroll", this.schedulePosition, {
        passive: true,
      }),
    );
    window.addEventListener("resize", this.schedulePosition, { passive: true });
    window.visualViewport?.addEventListener("resize", this.schedulePosition, {
      passive: true,
    });
    window.visualViewport?.addEventListener("scroll", this.schedulePosition, {
      passive: true,
    });
    this.resizeObserver?.observe(this.trigger);
    this.resizeObserver?.observe(this.panel);
    this.intersectionObserver?.observe(this.trigger);
  }

  unobserve() {
    // Полностью снимаем наблюдатели и обработчики при закрытии, чтобы не оставлять утечки.
    this.scrollParents.forEach((parent) =>
      parent.removeEventListener("scroll", this.schedulePosition),
    );
    this.scrollParents = [];
    window.removeEventListener("resize", this.schedulePosition);
    window.visualViewport?.removeEventListener("resize", this.schedulePosition);
    window.visualViewport?.removeEventListener("scroll", this.schedulePosition);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  open() {
    if (this.opened) {
      this.position();
      return;
    }
    this.mount();
    this.opened = true;
    this.panel.hidden = false;

    // Позиционируем синхронно до передачи focus дочернему элементу.
    this.position();
    this.observe();
  }

  close({ restore = true } = {}) {
    if (!this.panel) return;
    this.opened = false;
    this.unobserve();
    this.panel.hidden = true;
    if (restore) this.restore();
  }

  destroy() {
    // Destroy закрывает panel и возвращает его в исходное место DOM.
    this.close({ restore: true });
  }
}
