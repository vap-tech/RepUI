import { mountMenus } from "/static/repui/components/menu/menu.js";
import { mountTabs } from "/static/repui/components/tabs/tabs.js";
import { mountChips } from "/static/repui/components/chip/chip.js";
import { mountSelectOptions } from "/static/repui/components/select_option/select-option.js";

function mountInteractive(root) {
  mountMenus(root);
  mountTabs(root);
  mountChips(root);
  mountSelectOptions(root);
}

mountInteractive(document);

document.body.addEventListener("htmx:afterSwap", (event) => {
  mountInteractive(event.detail.target);
});
