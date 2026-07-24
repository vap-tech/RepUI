# 3. ТЗ по компонентам

## 3.1. Collection family — P0

### Listbox

Использует `CollectionController`.

Adapter:

- собирает options из DOM;
- задаёт стабильные ID;
- синхронизирует pointer/keyboard;
- render active/selected/disabled;
- поддерживает single/multiple;
- обновляет native input;
- переживает reorder/removal/hidden/disabled;
- при `aria-activedescendant` DOM focus остаётся на управляющем элементе.

Клавиши: ArrowUp/Down, Home/End, PageUp/Down, Enter/Space, typeahead.

Acceptance:

- active ≤ 1;
- active не равен selected;
- disabled не выбирается;
- hidden не участвует;
- пустой список удаляет `aria-activedescendant`.

### Select

`CollectionController + PopupController`.

- trigger показывает selected label;
- single selection закрывает popup;
- Escape не меняет committed selection;
- restore focus на trigger;
- native/hidden input синхронизирован;
- initial selection читается из server HTML.

### Combobox

`ComboboxController`.

Состояния:

```text
inputValue
selectedValue
activeOption
open
interactionMode
```

Требования:

- editable/select-only;
- callback filtering;
- IME composition;
- `aria-autocomplete`, `aria-controls`, `aria-activedescendant`;
- input сохраняет focus;
- pointer и keyboard меняют один active;
- Enter выбирает текущий active;
- Escape policy документирована;
- freeSolo только явно.

Критический regression:

```text
ArrowDown×3 → hover другой option → ArrowDown → Enter
```

### Command Palette

`ComboboxController + command activation`.

- group/separator `selectable=false`;
- activation не обязана записывать label в input;
- async result с устаревшим request id не применяется;
- action запускается один раз;
- close-after-action configurable.

## 3.2. Overlay — P1

### Dialog

`DialogController`.

- modal/non-modal;
- focus trap;
- initial focus;
- Escape;
- outside click;
- restore focus;
- nested dialogs;
- scroll-lock reference count;
- inert/background shielding;
- destroy в открытом состоянии;
- interruption анимации.

### AlertDialog

Основа Dialog:

- роль `alertdialog`;
- outside click по умолчанию не закрывает;
- обязательный title/description;
- initial focus policy;
- Escape policy фиксируется тестами.

### Sheet

Поведенчески Dialog. Side/size/animation остаются CSS RepUI.

### Popover

`Popover/PopupController`.

- trigger toggle;
- outside click;
- Escape;
- restore focus;
- non-modal;
- optional initial focus;
- nested content;
- positioning независимо от state.

### Tooltip — P4

`TooltipController`.

- hover/focus delays;
- Escape;
- touch policy;
- global one-tooltip coordination;
- timer cleanup;
- trigger removal;
- корректный `aria-describedby`.

## 3.3. Menu — P2/P4

### Dropdown

`MenuController + PopupController`.

Items: menuitem, checkbox, radio, separator, group, submenu trigger.

Клавиши: Up/Down, Home/End, Enter/Space, Escape, typeahead, Right/Left submenu, Tab exits.

- disabled не активируется;
- activation once;
- outside click закрывает chain;
- pointer grace для submenu;
- focus возвращается.

### Menubar

`MenubarController + MenuController`.

- Left/Right root navigation;
- Up/Down open;
- переключение открытого menu;
- root typeahead;
- RTL;
- Escape текущая ветка;
- Tab exit.

### NavigationMenu

Мигрировать после Dropdown/Menubar.

- link и trigger различаются;
- delayed pointer open;
- keyboard;
- content panels;
- active link ≠ open trigger;
- mobile adapter может отличаться;
- state primitives общие.

## 3.4. Tabs/disclosure — P3

### Tabs

`TabsController`.

State: focusedTab, selectedTab, orientation, activationMode, loop.

- automatic/manual;
- horizontal/vertical;
- Home/End;
- RTL;
- disabled;
- dynamic removal;
- `aria-controls`/`aria-labelledby`;
- roving tabindex.

### Accordion

`AccordionController`.

- single/multiple;
- collapsible/non-collapsible;
- disabled;
- ArrowUp/Down, Home/End;
- dynamic items;
- open state сохраняется при benign DOM sync.

### Collapsible

`CollapsibleController`.

- open/close/toggle;
- `aria-expanded`;
- `aria-controls`;
- animation не является state source.

## 3.5. Form primitives — P5

Подключать только при stable API core.

### Checkbox

checked/unchecked/indeterminate, Space, disabled/readOnly, native sync, reset, label click, no duplicate events.

### RadioGroup

single selection, roving tabindex, arrows/orientation/RTL, required, disabled, reset.

### Switch

Checkbox semantics + role switch + `aria-checked`.

### Toggle/ToggleGroup

pressed, single/multiple, mandatory selection, roving, toolbar compatibility отдельно.

### Slider

min/max/step, arrows, PageUp/Down, Home/End, pointer capture, single/range, value text, RTL/vertical, rounding.

## 3.6. TreeView — последний этап

`TreeController`.

- hierarchy;
- expanded/active/selected;
- Left/Right/Home/End;
- typeahead;
- disabled;
- lazy children;
- subtree removal;
- `aria-level`, `aria-setsize`, `aria-posinset`;
- virtualization отдельным проектом.

## 3.7. Что не надо переводить без причины

```text
Alert
Badge
Button
Card
CodeBlock
FieldError
LoadingButton
Pagination
Skeleton
Toast manager
Validation messages
```

## 3.8. Матрица

| RepUI | Core | Priority | Risk |
|---|---|---:|---|
| Listbox | Collection | P0 | active/selected |
| Select | Collection+Popup | P0 | form sync |
| Combobox | Combobox | P0 | focus/IME |
| Command | Combobox | P0 | async |
| Dialog | Dialog | P1 | trap/nesting |
| AlertDialog | Dialog | P1 | close policy |
| Sheet | Dialog | P1 | teardown |
| Popover | Popup | P1 | outside click |
| Dropdown | Menu+Popup | P2 | submenu |
| Menubar | Menubar+Menu | P2 | coordination |
| Tabs | Tabs | P3 | activation mode |
| Accordion | Accordion | P3 | constraints |
| Collapsible | Collapsible | P3 | animation |
| Tooltip | Tooltip | P4 | timers/touch |
| NavigationMenu | Navigation/Menu | P4 | panels |
| Form primitives | matching controllers | P5 | native events |
| TreeView | Tree | P5 | hierarchy |
