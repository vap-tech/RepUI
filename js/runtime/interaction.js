import { getInstance } from './registry.js';
function resolve(target){ return typeof target==='string'?document.querySelector(target):target; }
function invoke(target, method){ const root=resolve(target); const instance=getInstance(root)||root?.ruiSelect||root?.ruiCombobox||root?.ruiDialog||root?.ruiSheet||root?.ruiPopover||root?.ruiDropdown||root?.ruiAccordion||root?.ruiCollapsible; if(!instance||typeof instance[method]!=='function') return false; instance[method](); return true; }
export const interaction = {
  open: target=>invoke(target,'open'), close: target=>invoke(target,'close'), toggle: target=>invoke(target,'toggle'),
  state(target){ const root=resolve(target); return { open:root?.dataset.open==='true'||root?.dataset.state==='open', expanded:root?.querySelector?.('[aria-expanded="true"]')!==null }; }
};
