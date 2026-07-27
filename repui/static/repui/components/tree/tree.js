const instances = new WeakMap();
const ROOT_SELECTOR = "[data-rui-tree]";
const ITEM_SELECTOR = "[data-rui-tree-item]";

function collect(root) {
  const nodes = [];
  if (root instanceof HTMLElement && root.matches(ROOT_SELECTOR)) nodes.push(root);
  nodes.push(...(root.querySelectorAll?.(ROOT_SELECTOR) || []));
  return [...new Set(nodes)];
}

class TreeRuntime {
  constructor(root) {
    this.root = root;
    this.abort = new AbortController();
    this.bind();
    this.refresh();
  }

  items() { return [...this.root.querySelectorAll(ITEM_SELECTOR)]; }

  visibleItems() {
    return this.items().filter((item) => {
      return !item.closest('[role="group"][hidden]') && item.getAttribute("aria-disabled") !== "true";
    });
  }

  refresh() {
    const items = this.visibleItems();
    const active = items.find((item) => item.tabIndex === 0)
      || items.find((item) => item.getAttribute("aria-selected") === "true")
      || items[0];
    items.forEach((item) => { item.tabIndex = item === active ? 0 : -1; });
    return this;
  }

  focus(item) {
    if (!item || item.getAttribute("aria-disabled") === "true") return this;
    this.visibleItems().forEach((candidate) => { candidate.tabIndex = candidate === item ? 0 : -1; });
    item.focus();
    return this;
  }

  parent(item) {
    const group = item.parentElement?.closest('[role="group"]');
    return group?.closest(ITEM_SELECTOR) || null;
  }

  children(item) {
    const group = item.querySelector(':scope > [role="group"]');
    return group ? [...group.children].filter((child) => child.matches(ITEM_SELECTOR)) : [];
  }

  select(item) {
    if (!item || item.getAttribute("aria-disabled") === "true") return;
    if (this.root.getAttribute("aria-multiselectable") !== "true") {
      this.items().forEach((candidate) => candidate.setAttribute("aria-selected", "false"));
    }
    item.setAttribute("aria-selected", "true");
  }

  toggle(item, next = null) {
    if (!item?.hasAttribute("aria-expanded")) return this;
    const expanded = next ?? item.getAttribute("aria-expanded") !== "true";
    item.setAttribute("aria-expanded", String(expanded));
    const group = item.querySelector(':scope > [role="group"]');
    if (group) group.hidden = !expanded;
    this.refresh();
    item.dispatchEvent(new CustomEvent("rui:treeexpand", {
      bubbles: true,
      detail: { expanded },
    }));
    return this;
  }

  activate(item, originalEvent) {
    this.select(item);
    item.dispatchEvent(new CustomEvent("rui:treeactivate", {
      bubbles: true,
      detail: { originalEvent },
    }));
  }

  bind() {
    const { signal } = this.abort;
    this.root.addEventListener("click", (event) => {
      const row = event.target.closest(".rui-tree-item__row");
      const item = row?.closest(ITEM_SELECTOR);
      if (!item || item.getAttribute("aria-disabled") === "true") return;
      this.focus(item);
      if (event.target.closest(".rui-tree-item__indicator")) this.toggle(item);
      else this.activate(item, event);
    }, { signal });
    this.root.addEventListener("keydown", (event) => this.onKeydown(event), { signal });
  }

  onKeydown(event) {
    const item = event.target.closest(ITEM_SELECTOR);
    if (!item) return;
    const items = this.visibleItems();
    const index = items.indexOf(item);
    if (event.key === "ArrowDown") {
      event.preventDefault(); this.focus(items[index + 1] || item);
    } else if (event.key === "ArrowUp") {
      event.preventDefault(); this.focus(items[index - 1] || item);
    } else if (event.key === "Home") {
      event.preventDefault(); this.focus(items[0]);
    } else if (event.key === "End") {
      event.preventDefault(); this.focus(items.at(-1));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (item.getAttribute("aria-expanded") === "false") this.toggle(item, true);
      else this.focus(this.children(item)[0]);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (item.getAttribute("aria-expanded") === "true") this.toggle(item, false);
      else this.focus(this.parent(item));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault(); this.activate(item, event);
    }
  }

  destroy() {
    this.abort.abort();
    instances.delete(this.root);
  }
}

export function mountTrees(root = document) {
  return collect(root).map((element) => {
    let instance = instances.get(element);
    if (!instance) {
      instance = new TreeRuntime(element);
      instances.set(element, instance);
    } else {
      instance.refresh();
    }
    return instance;
  });
}

document.addEventListener("htmx:afterSwap", (event) => {
  mountTrees(event.detail?.target || event.target);
});
