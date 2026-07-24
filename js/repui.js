import { setDebug, inspectComponent } from "./runtime/debug.js";
import { initTheme, setTheme, getTheme } from "./runtime/theme.js";
import { initFocusModality, getModality } from "./runtime/focus.js";
import { interaction } from "./runtime/interaction.js";
import { getInstance, getComponentName, register } from "./runtime/registry.js";
import { mountPortal, unmountPortal, isPortaled } from "./runtime/portal.js";
import { destroy, emit } from "./runtime/runtime.js";
import { initDialogs, Dialog } from "./components/dialog.js";
import { initToasts, ToastManager } from "./components/toast.js";
import { initAlerts } from "./components/alert.js";
import { initLoadingButtons } from "./components/loading-button.js";
import { initSelects, Select } from "./components/select.js";
import { initTooltips } from "./components/tooltip.js";
import { initValidation } from "./components/validation.js";
import { initDropdowns, DropdownMenu } from "./components/dropdown.js";
import { initPopovers, Popover } from "./components/popover.js";
import { initSheets, Sheet } from "./components/sheet.js";
import { initAlertDialogs, AlertDialog } from "./components/alert-dialog.js";
import { initListboxes, Listbox } from "./components/listbox.js";
import { initComboboxes, Combobox } from "./components/combobox.js";
import { initCommands, CommandPalette } from "./components/command.js";
import { initSearch } from "./components/search.js";
import { initTabs, Tabs } from "./components/tabs.js";
import { initAccordions, Accordion } from "./components/accordion.js";
import { initCollapsibles, Collapsible } from "./components/collapsible.js";
import { initMenubars, Menubar } from "./components/menubar.js";
import {
  initNavigationMenus,
  NavigationMenu,
} from "./components/navigation-menu.js";
import { initPagination } from "./components/pagination.js";
import {
  initCodeBlocks,
  highlightHtml,
  highlightCss,
  highlightDjango,
  highlightCode,
} from "./components/code-block.js";

let currentApi = null;
function registerCollection(collection, name) {
  if (collection instanceof Map)
    collection.forEach((instance) => register(instance.root, name, instance));
  else if (Array.isArray(collection))
    collection.forEach((instance) => register(instance.root, name, instance));
}
export function init(root = document) {
  initTheme();
  initFocusModality();
  root.querySelectorAll("[data-rui-theme-toggle]").forEach((button) => {
    if (button.dataset.ruiBound) return;
    button.dataset.ruiBound = "1";
    button.addEventListener("click", () =>
      setTheme(getTheme() === "dark" ? "light" : "dark"),
    );
  });
  const api = {
    dialogs: initDialogs(root),
    toasts: initToasts(root),
    listboxes: initListboxes(root),
    selects: initSelects(root),
    comboboxes: initComboboxes(root),
    commands: initCommands(root),
    dropdowns: initDropdowns(root),
    popovers: initPopovers(root),
    sheets: initSheets(root),
    alertDialogs: initAlertDialogs(root),
    tabs: initTabs(root),
    accordions: initAccordions(root),
    collapsibles: initCollapsibles(root),
    menubars: initMenubars(root),
    navigationMenus: initNavigationMenus(root),
  };
  Object.entries(api).forEach(([name, collection]) =>
    registerCollection(collection, name.replace(/s$/, "")),
  );
  initAlerts(root);
  initLoadingButtons(root);
  initTooltips(root);
  initValidation(root);
  initSearch(root);
  initPagination(root);
  initCodeBlocks(root);
  currentApi = api;
  emit(document, "ready", api);
  return api;
}

const RepUI = {
  version: "0.8.2.5",
  init,
  destroy,
  setTheme,
  getTheme,
  getModality,
  open: interaction.open,
  close: interaction.close,
  toggle: interaction.toggle,
  state: interaction.state,
  getInstance,
  getComponentName,
  portal: { mount: mountPortal, unmount: unmountPortal, isPortaled },
  Dialog,
  Listbox,
  Select,
  Combobox,
  CommandPalette,
  Tabs,
  Accordion,
  Collapsible,
  Menubar,
  NavigationMenu,
  ToastManager,
  DropdownMenu,
  Popover,
  Sheet,
  AlertDialog,
  debug: setDebug,
  inspect: inspectComponent,
  highlightHtml,
  highlightCss,
  highlightDjango,
  highlightCode,
  toast(options) {
    return (currentApi?.toasts || new ToastManager()).show(options);
  },
};
window.RepUI = RepUI;

function autoInit() {
  if (!currentApi) init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit, { once: true });
} else {
  autoInit();
}

export default RepUI;
