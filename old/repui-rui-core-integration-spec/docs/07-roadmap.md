# 7. Roadmap и Definition of Done

## Этап 0 — Foundation

- LICENSE;
- branch protection;
- fixed Node/package manager;
- CI;
- `build:repui`;
- version banner;
- Pages skeleton;
- repository_dispatch dry run;
- manual rerun.

Gate: тестовый release создаёт update PR в RepUI без утечки secrets.

## Этап 1 — Collection vertical slice

```text
Listbox, Select, Combobox, Command
```

Gate:

- core state only;
- legacy active/selection удалён;
- native form;
- mixed pointer/keyboard;
- filter/reorder;
- HTMX;
- browser matrix;
- demo.

## Этап 2 — Overlay

```text
Dialog, AlertDialog, Sheet, Popover
```

Gate:

- overlay stack;
- focus trap/restore;
- outside click;
- nesting;
- scroll lock;
- animation interruption;
- HTMX teardown;
- screen-reader smoke.

## Этап 3 — Tooltip

Timers, focus/hover, Escape, touch policy, cleanup.

## Этап 4 — Menu

```text
Dropdown, Menubar
```

Typeahead, submenu, pointer grace, RTL, activation once.

## Этап 5 — Selection/disclosure

```text
Tabs, Accordion, Collapsible
```

Modes/orientation/dynamic DOM/ARIA.

## Этап 6 — NavigationMenu

Desktop keyboard/pointer, panels, links/triggers, mobile strategy.

## Этап 7 — Form primitives

Checkbox, RadioGroup, Switch, ToggleGroup, Slider — только при stable controller API.

## Этап 8 — TreeView

Hierarchy, expansion, selection, lazy children, dynamic subtree, a11y.

## Общий DoD компонента

- [ ] state только в core;
- [ ] нет parallel DOM state machine;
- [ ] destroy идемпотентен;
- [ ] повторный mount без duplicate listeners;
- [ ] ARIA корректна;
- [ ] Chromium/Firefox/WebKit;
- [ ] pointer/touch smoke;
- [ ] axe без serious/critical;
- [ ] native form при необходимости;
- [ ] HTMX replacement;
- [ ] demo обновлено;
- [ ] docs обновлены;
- [ ] legacy удалён;
- [ ] size budget;
- [ ] release notes.

## Release gates

Patch: Chromium + targeted Firefox/WebKit.

Minor: full matrix + visual + manual a11y + demo review.

Major: всё выше + migration guide + deprecation cleanup.

## Метрики

- duplicated keyboard handlers уменьшаются;
- mount/unmount leaks = 0;
- flaky tests <1%;
- release core → RepUI PR <10 минут;
- Django user не запускает npm;
- demo открывается из README одним кликом.
