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
import { initSelects, Select } from "./components/select.js";
import { initValidation } from "./components/validation.js";
import { initDropdowns, DropdownMenu } from "./components/dropdown.js";
import { initSheets, Sheet } from "./components/sheet.js";
import { initAlertDialogs, AlertDialog } from "./components/alert-dialog.js";
import { initListboxes, Listbox } from "./components/listbox.js";
import { initCommands, CommandPalette } from "./components/command.js";
import { initTabs, Tabs } from "./components/tabs.js";
import { initMenubars, Menubar } from "./components/menubar.js";
import {
  initNavigationMenus,
  NavigationMenu,
} from "./components/navigation-menu.js";

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
    commands: initCommands(root),
    dropdowns: initDropdowns(root),
    sheets: initSheets(root),
    alertDialogs: initAlertDialogs(root),
    tabs: initTabs(root),
    menubars: initMenubars(root),
    navigationMenus: initNavigationMenus(root),
  };
  Object.entries(api).forEach(([name, collection]) =>
    registerCollection(collection, name.replace(/s$/, "")),
  );
  initAlerts(root);
  initValidation(root);
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
  CommandPalette,
  Tabs,
  Menubar,
  NavigationMenu,
  ToastManager,
  DropdownMenu,
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
