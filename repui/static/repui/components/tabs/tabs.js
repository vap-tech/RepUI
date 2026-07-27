import { createRovingGroup } from "../../interaction/roving.js";

const instances = new WeakMap();

function mountTabsRoot(root) {
  const current = instances.get(root);
  if (current) return current;

  const tabList = root.querySelector('[role="tablist"]');
  if (!tabList) return null;

  const activation = root.dataset.activation || "automatic";
  const roving = createRovingGroup(tabList, {
    itemSelector: "[data-rui-tab]",
    orientation: root.dataset.orientation || "horizontal",
    loop: true,
  });

  const abort = new AbortController();

  function select(tab, originalEvent = null) {
    if (!tab || tab.disabled) return;

    const tabs = [...root.querySelectorAll("[data-rui-tab]")];
    const panels = [...root.querySelectorAll("[data-rui-tab-panel]")];

    tabs.forEach((candidate) => {
      candidate.setAttribute("aria-selected", String(candidate === tab));
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.dataset.panel;
    });

    root.dispatchEvent(new CustomEvent("rui:change", {
      bubbles: true,
      detail: {
        value: tab.dataset.panel,
        tab,
        originalEvent,
      },
    }));
  }

  tabList.addEventListener("focusin", (event) => {
    if (activation !== "automatic") return;
    const tab = event.target.closest("[data-rui-tab]");
    if (tab) select(tab, event);
  }, { signal: abort.signal });

  tabList.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-rui-tab]");
    if (tab) select(tab, event);
  }, { signal: abort.signal });

  tabList.addEventListener("keydown", (event) => {
    if (activation !== "manual") return;
    if (!["Enter", " "].includes(event.key)) return;
    const tab = event.target.closest("[data-rui-tab]");
    if (!tab) return;
    event.preventDefault();
    select(tab, event);
  }, { signal: abort.signal });

  const api = {
    root,
    select,
    refresh() {
      roving.refresh();
      return api;
    },
    destroy() {
      abort.abort();
      roving.destroy();
      instances.delete(root);
    },
  };

  instances.set(root, api);
  return api;
}

export function mountTabs(root = document) {
  const elements = [];
  if (root.matches?.("[data-rui-tabs]")) elements.push(root);
  elements.push(...root.querySelectorAll?.("[data-rui-tabs]") ?? []);
  return elements.map(mountTabsRoot).filter(Boolean);
}
