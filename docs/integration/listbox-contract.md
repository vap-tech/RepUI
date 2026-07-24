# Listbox integration contract

Первый вертикальный срез интеграции `rui-core` с RepUI. Этот документ фиксирует
границу между низкоуровневым controller/collection API и DOM-адаптером RepUI.

## Ответственность rui-core

- хранить список items и active item;
- поддерживать `setActive`, `move`, `select` и `reconcile`;
- нормализовать навигацию: Arrow, Home/End, Page Up/Down;
- не создавать DOM и не владеть конкретной разметкой RepUI;
- не принимать решения за Select или Combobox, если коллекция работает в managed mode.

## Ответственность RepUI

- находить `[data-rui-option]` и извлекать metadata;
- синхронизировать `aria-selected`, `aria-activedescendant` и hidden input;
- связывать controller с конкретным focus target;
- dispatch-ить существующие события `rui:listboxchange` и component-specific events;
- сохранять текущий public API и markup contract.

## DOM contract

```html
<div data-rui-listbox role="listbox">
  <div data-rui-option role="option" data-value="one">One</div>
</div>
```

An option may be unavailable through `hidden`, `aria-disabled="true"`, or the
existing RepUI disabled convention. Disabled options are not selectable.

## Interaction modes

- `standalone`: listbox owns focus and keyboard events;
- `managed`: parent owns the input/trigger focus and forwards navigation to the
  collection.

One keyboard event must have one owner. The adapter must not add a second
navigation path when the core controller already handled the event.

## Initial state

The adapter reads the initial `aria-selected` state and preserves the first
selected option. If no option is selected, active state remains unset until the
existing component contract chooses an item.

## Acceptance criteria

- existing Listbox, Select, Combobox, and Command Palette demos behave the same;
- arrow/Home/End/Page navigation remains bounded to visible, enabled options;
- selection updates ARIA and form value exactly once;
- dynamic option insertion/removal is reflected after `reconcile`;
- Escape, Tab, and overlay ownership remain in the parent component;
- no rui-core source is copied into this repository; RepUI consumes only its
  generated bundle.
