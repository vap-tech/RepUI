import { mountAccordions } from "../components/accordion/accordion.js";
import { mountAutocompletes } from "../components/autocomplete/autocomplete.js";
import { mountButtons } from "../components/button/button.js";
import { mountChips } from "../components/chip/chip.js";
import { mountCodeBlocks } from "../components/code_block/code-block.js";
import { mountCollapsibles } from "../components/collapsible/collapsible.js";
import { mountComboboxes } from "../components/combobox/combobox.js";
import { mountCommandPalettes } from "../components/command_palette/command-palette.js";
import { mountDialogs } from "../components/dialog/dialog.js";
import { mountDrawers } from "../components/drawer/drawer.js";
import { mountDropdownMenus } from "../components/dropdown_menu/dropdown-menu.js";
import { mountListboxes } from "../components/listbox/listbox.js";
import { mountMenus } from "../components/menu/menu.js";
import { mountMenubars } from "../components/menubar/menubar.js";
import { mountNavbars } from "../components/navbar/navbar.js";
import { mountPaginations } from "../components/pagination/pagination.js";
import { mountPopovers } from "../components/popover/popover.js";
import { mountSearches } from "../components/search/search.js";
import { mountSelects } from "../components/select/select.js";
import { mountTabs } from "../components/tabs/tabs.js";
import { mountToasts } from "../components/toast/toast.js";
import { mountTooltips } from "../components/tooltip/tooltip.js";
import { mountTrees } from "../components/tree/tree.js";

/**
 * Official global runtime registry. Page-local enhancements may stay outside it.
 * Keep primitive runtimes before composites that acquire their shared handles.
 */
export const RUNTIME_ADAPTERS = [
  ["accordion", mountAccordions],
  ["autocomplete", mountAutocompletes],
  ["button", mountButtons],
  ["chip", mountChips],
  ["code-block", mountCodeBlocks],
  ["collapsible", mountCollapsibles],
  ["combobox", mountComboboxes],
  ["command-palette", mountCommandPalettes],
  ["dialog", mountDialogs],
  ["drawer", mountDrawers],
  ["listbox", mountListboxes],
  // Menu is mounted before composites that acquire its shared handle.
  ["menu", mountMenus],
  ["dropdown-menu", mountDropdownMenus],
  ["menubar", mountMenubars],
  ["navbar", mountNavbars],
  ["pagination", mountPaginations],
  ["popover", mountPopovers],
  ["search", mountSearches],
  ["select", mountSelects],
  ["tabs", mountTabs],
  ["toast", mountToasts],
  ["tooltip", mountTooltips],
  ["tree", mountTrees],
];

const installations = new WeakMap();

function isWithin(root, node) {
  return root instanceof Node
    && node instanceof Node
    && (root === node || root.contains(node));
}

/**
 * Own all component runtime instances for one document.
 *
 * Mount functions remain independently usable, but applications should install
 * this bootstrap once instead of subscribing every component to HTMX directly.
 */
export function installRuntime(root = document) {
  const existing = installations.get(root);
  if (existing) return existing;

  const instances = new Map(
    RUNTIME_ADAPTERS.map(([name]) => [name, new Set()]),
  );
  const abort = new AbortController();

  function mount(scope = root) {
    for (const [name, adapter] of RUNTIME_ADAPTERS) {
      for (const instance of adapter(scope) || []) {
        instances.get(name).add(instance);
      }
    }
    return api;
  }

  function destroyWithin(scope) {
    for (const values of instances.values()) {
      for (const instance of [...values]) {
        const node = instance?.element;
        if (!isWithin(scope, node)) continue;
        instance?.destroy?.();
        values.delete(instance);
      }
    }
    return api;
  }

  function first(name) {
    return instances.get(name)?.values().next().value || null;
  }

  function destroy() {
    destroyWithin(root);
    abort.abort();
    installations.delete(root);
  }

  const api = { mount, destroyWithin, first, destroy };
  installations.set(root, api);
  mount(root);

  document.addEventListener("htmx:afterSwap", (event) => {
    mount(event.detail?.target || event.target);
  }, { signal: abort.signal });
  document.addEventListener("htmx:beforeCleanupElement", (event) => {
    destroyWithin(event.detail?.elt || event.target);
  }, { signal: abort.signal });

  return api;
}
