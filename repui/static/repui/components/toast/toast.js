const instances = new WeakMap();

class ToastManager {
  constructor(region, root = region) {
    this.region = region;
    this.abort = new AbortController();
    root.addEventListener("click", (event) => {
      const close = event.target.closest(".rui-toast__close");
      if (close && region.contains(close)) this.close(close.closest(".rui-toast"));
      const trigger = event.target.closest("[data-rui-toast]");
      if (trigger) this.show({
        title: trigger.dataset.ruiToast || "Готово",
        description: trigger.dataset.ruiToastDescription || "",
      });
    }, { signal: this.abort.signal });
  }

  show({ title = "Готово", description = "", duration = 4200 } = {}) {
    const toast = document.createElement("article");
    toast.className = "rui-toast";
    toast.setAttribute("role", "status");
    toast.innerHTML = '<span class="rui-toast__icon" aria-hidden="true">●</span><div><div class="rui-toast__title"></div><div class="rui-toast__description"></div></div><button class="rui-toast__close" type="button" aria-label="Закрыть">×</button>';
    toast.querySelector(".rui-toast__title").textContent = title;
    toast.querySelector(".rui-toast__description").textContent = description;
    this.region.append(toast);
    const timer = duration > 0 ? setTimeout(() => this.close(toast), duration) : 0;
    return { element: toast, close: () => this.close(toast), timer };
  }

  close(toast) {
    if (!toast?.isConnected) return;
    toast.remove();
  }

  destroy() {
    this.abort.abort();
    this.region.replaceChildren();
    instances.delete(this.region);
  }
}

export function mountToasts(root = document) {
  const regions = root.matches?.("[data-rui-toast-region]")
    ? [root]
    : [...root.querySelectorAll?.("[data-rui-toast-region]") || []];
  return regions.map((region) => {
    const current = instances.get(region);
    if (current) return current;
    const manager = new ToastManager(region, root);
    instances.set(region, manager);
    return manager;
  });
}
