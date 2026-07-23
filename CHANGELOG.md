# Changelog

## 0.8.2.5 — rui-core collection integration

- Embedded a framework-free CollectionController aligned with rui-core v0.1.2 semantics.
- Listbox, Select, Combobox, and Command Palette now share the controller-backed single-active DOM adapter.
- Active recovery remains deterministic after filtering, removal, reorder, hidden, and disabled changes.
- Pointer and keyboard input converge on one active descendant; selected state remains independent.


## 0.8.2.5 — Single visual active state

- Removed independent CSS hover highlighting from Select, Listbox, Combobox, and Command Palette options.
- Pointer movement, pointer press, and keyboard navigation now update the same single `data-active` item.
- Clicking disabled options or passive list chrome preserves the current active descendant and keyboard ownership.
- Kept `aria-selected` visually distinct through selection weight/checkmark instead of a second active-style background.
- Added a regression pass for pointer/keyboard handoff without touching Navbar or unrelated navigation.

## 0.8.2.3 — Shared option collection mechanic

- Unified active-item, keyboard movement, selection, and disabled-item handling for Select, Listbox, Combobox, and Command Palette.
- Passive and disabled list content no longer steals focus from the keyboard owner.
- Enforced a single `data-active` option and cleared stale active descendants after filtering.
- Added reconciliation for empty lists, all-disabled lists, and options hidden while filtering.
- Kept Navbar and unrelated navigation components outside this refactor.

## 0.8.2.2 — Code highlighting pass

- Gave the Code Block language badge a quiet soft-success treatment in light and dark themes.
- Added dependency-free CSS highlighting for comments, selectors, properties, values, strings, numbers, variables, functions, at-rules, and `!important`.
- Added mixed HTML + Django template highlighting for tags, variables, filters, strings, comments, operators, literals, and common template keywords.
- Added `RepUI.highlightCss(source)`, `RepUI.highlightDjango(source)`, and `RepUI.highlightCode(source, language)`.
- Unknown languages now safely render as escaped plain text.

# 0.8.2.2 — Universal Code Block patch

- Reworked Code Block into a toolbar-free, universal code surface.
- Moved the generated language badge to the top-right corner and the generated copy icon to the bottom-right corner.
- Added width presets: `xs`, `sm`, `md`, `lg`, `xl`, and `full`.
- Added height presets: `xs`, `sm`, `md`, `lg`, and `xl`.
- Enabled vertical and horizontal overflow by default; `data-scroll="false"` removes only the vertical limit.
- Made Example and legacy docs embedding own their outer borders and corner radii, removing nested-card geometry conflicts.
- Kept legacy toolbar markup compatible through a flattened layout rule.
- Updated the public runtime version to `0.8.2.2`.

# 0.8.2 — Documentation Components

- Added the public `Example` composition for binding live previews and source panels into one visual object.
- Added the public `Code Block` component with language toolbar and copy action.
- Added dependency-free HTML and Django-template syntax highlighting.
- Replaced the detached dark documentation snippets with system-themed code blocks.
- Migrated the Hero and Card demonstrations to the new Example anatomy.
- Exposed `RepUI.highlightHtml(source)` for controlled documentation tooling.
- Updated the public runtime version to `0.8.2`.

# 0.8.1 — Composition Primitives

- Added the CSS-only `Hero` composition primitive with optional content, eyebrow, title, description, actions, and media regions.
- Added centered and split Hero layouts without making any child region mandatory.
- Expanded Card into a complete anatomy with header, title, description, body, and footer regions.
- Added semantic composition tokens for Hero and Card spacing.
- Kept existing `.rui-card.rui-card__body` markup backward-compatible.
- Migrated the playground opening section to the public Hero component and added canonical Hero/Card examples.
- Updated the public runtime version to `0.8.1`.
- Left inline `code` and dependency badge typography unchanged.

# 0.8.0.4 — Badge heading rhythm

- Added the semantic `--rui-badge-heading-gap` token with the tested value `0.45rem`.
- Badge now uses that token as its bottom margin, giving compact eyebrow-style badges more breathing room before following headings.
- Kept the spacing independent from the general spacing scale so it can later move into a dedicated heading-composition component without changing the visual contract.
- No JavaScript behavior or component markup API changes.

# 0.8.0.3 — Component typography isolation

- Removed typography declarations from the reset layer; reset now normalizes structure without assigning component fonts.
- Moved document body typography into `base/typography.css`.
- Removed every remaining `font: inherit` shorthand from RepUI components, including Sheet, navigation, Select, menus, options and Command Palette.
- Interactive components now define `font-family`, `font-size`, `font-weight` and `line-height` explicitly.
- Kept Roboto Flex for UI/content and Manrope for display typography after Django integration confirmed the fonts render correctly without inherited shorthand interference.
- No JavaScript behavior or public HTML API changes.

# 0.8.0.3 — UI typography roles patch

- Switched interactive form controls and ARIA interaction roles to the platform `system-ui` font stack.
- Kept Roboto Flex as the content font and Manrope as the display-heading font.
- Added the explicit `--rui-font-content` token alongside `--rui-font-ui` and `--rui-font-display`.
- Changed `Choice` labels from forced `font-weight: 650` to the normal weight `400`.
- Kept control geometry unchanged after confirming that the perceived vertical offset came from font metrics rather than placeholder layout.
- No JavaScript behavior or public markup API changes.

# 0.8.0.1 — Placeholder alignment patch

- Stabilized vertical alignment for text and placeholders in single-line controls.
- Single-line Input, native Select, and DateTime controls now use the canonical fixed control height with browser-centered text.
- Placeholder color is now explicit and consistent across browsers with `opacity: 1`.
- Textarea keeps top-aligned content with its own block padding and line height.
- No JavaScript or public markup API changes.

# 0.8.0 — Form Composition

- Added semantic `Fieldset` styling for native `fieldset` and `legend`.
- Added shared `Choice` markup for native radio and checkbox controls.
- Added `ChoiceGroup` with vertical and wrapping horizontal orientations.
- Added `FieldError` for empty-safe, accessible validation messages.
- Added a styled native `DateTime` field based on `input[type="datetime-local"]`.
- Kept browser ownership of the calendar/time picker; no custom date-picker JavaScript was introduced.
- Added Django include templates for all five form patterns.
- Updated the playground with a taxi-order form composition example.
- Updated the public runtime version to `0.8.0`.

# 0.7.0 — Stable Foundation

- Promoted the verified 0.6.x foundation to the first stable 0.7 release.
- Confirmed the Information → Primitives → Components dependency model and the layered-primitives contract.
- Completed manual accessibility and keyboard-navigation review across the current component set.
- Confirmed all playground examples as the canonical manual regression route.
- Included the finalized Command Palette scale, scrolling, selection, and focus-retention behavior from 0.6.7–0.6.7.3.
- Documented browser ownership of native password and autofill behavior.
- Updated the public runtime version to `0.7.0`.
- No public component API changes were introduced in this release.

# 0.6.7.3 — Command Palette Focus Retention

- Passive clicks inside the open Command Palette now preserve DOM focus on the search input.
- Keyboard ownership no longer falls through to the underlying page after clicking group labels, empty padding, search chrome, or the footer.
- Interactive controls and command items keep their existing behavior.
- Native scrollbar dragging and backdrop click-to-close remain unchanged.

# 0.6.7.2 — Command Palette Selection Test

- Disabled text selection inside the Command Palette panel.
- Kept normal text selection inside the search input.
- Prevented accidental category-label selection from interrupting the keyboard-first interaction flow.
- No JavaScript behavior or public component API changed.

# 0.6.7.1 — Command Palette Scroll Patch

- Removed sticky positioning from Command Palette group labels.
- Group labels now scroll naturally with their commands.
- Kept the bounded list, footer, filtering count and active-item visibility behavior unchanged.
- Reduced layering complexity and eliminated partially obscured command text beneath pinned labels.

# 0.6.7 — Command Scale Pass

- Expanded the Command Palette QA fixture to 50 commands in five groups.
- Added a live visible-command count for filtered collections.
- Added sticky group labels and a bounded footer so 30–50 commands remain navigable.
- Verified existing Listbox scrolling keeps the keyboard-active command visible.
- Accepted Decision 010: RepUI switches password input `type`; native autofill and password-manager behavior remain browser-owned.

# Changelog

## 0.6.6 — Architectural Playground

- Reorganized the playground into three architectural levels: Information, Primitives and Components.
- Added a strict placement contract: primitives do not depend on other RepUI components; components do.
- Reordered the page itself to match the sidebar, so navigation and manual testing follow the same path.
- Added category subgroups inside Primitives and Components without changing public component APIs.
- Split AssistiveText into an independent primitive demo and Password Input into a separate composite component demo.
- Added visible dependency chips for Password Input, Select, Combobox and Command Palette.
- Added an architecture map and classification contract to the opening documentation sections.
- Updated the runtime version to `0.6.6`.

## 0.6.5.2 — Restore DOM-ready initialization

- Automatic initialization again runs after `DOMContentLoaded`, or immediately when the DOM is already ready.
- Removed the unnecessary wait for `window.load`; components no longer wait for images and unrelated resources.
- Preserved the guard that prevents duplicate automatic initialization after an earlier manual `RepUI.init()`.
- Confirmed that the Firefox warning pointing to `resource://devtools/server/actors/inspector/node.js` originates from DevTools Inspector, not RepUI.
- No component API or AssistiveText contract changes.

## 0.6.5.1 — Load-safe automatic initialization

- Automatic initialization now waits for `window.load`, so blocking stylesheets and their imports are ready before RepUI can trigger geometry-dependent work.
- Manual `RepUI.init()` remains available for applications that control their own startup sequence.
- Automatic startup is guarded against running a second time after an earlier manual initialization.
- No component API or AssistiveText contract changes.

# 0.6.5 — Assistive Text

- Added `css/components/assistive-text.css`.
- Added `.rui-assistive-text[data-state="base|negative|positive"]`.
- The primitive is intentionally one-line and reserves a stable line box.
- State appearance is driven by existing color, spacing and typography tokens.
- Added an interactive password example to the single playground; the password logic remains consumer code.
- Documented `aria-describedby`, optional `aria-live="polite"`, and `aria-invalid` ownership.
- Added Decision 008: high-level components may use low-level primitives but must not expand their contracts.

## 0.6.4.3 — Navigation QA Layout

- Fixed navigation hover tokens and modality ownership.
- Rebuilt stress-pass playground into explicit vertical test cases.

# Changelog

## 0.6.4.2 — Pointer and Keyboard Modality

- Added a shared interaction-modality helper for composite collections.
- Menubar items now expose a visible pointer hover state.
- Keyboard navigation suppresses stale native hover highlighting until the pointer moves again.
- Command Palette, Select, Combobox and Listbox now show one unambiguous active row during keyboard navigation.
- Menubar menu items receive a clear `:focus-visible` state.

## 0.6.4 — Interactive stress pass

- Added buffered, locale-aware typeahead navigation to standalone Listbox and non-text Select surfaces.
- Preserved native Home/End caret behavior in Combobox and Command Palette inputs.
- Added Ctrl+Home/Ctrl+End list-edge navigation, plus Meta+ArrowUp/Meta+ArrowDown on macOS-style keyboards.
- Added two-stage Combobox Escape behavior: restore the committed value/query first, then close.
- Hardened FloatingLayer positioning against small and mobile visual viewports.
- Floating panels now choose the roomier side whenever the preferred side cannot fit the panel.
- Added explicit `data-side` and `data-constrained` state for QA and styling.
- Expanded playground keyboard and positioning checklists.

## 0.6.3 — Forms unification

- Added one shared visual and interaction contract for `.rui-input`, `.rui-textarea` and `.rui-native-select`.
- Textarea now receives the same border, radius, surface, typography, hover, focus, disabled and validation states as Input.
- Moved control geometry and transition values into foundation tokens.
- Removed duplicated textarea/native-select state rules from `forms.css`.
- Updated the Django textarea template to use the canonical `.rui-textarea` class.
- Updated the Dialog playground example to exercise the unified Textarea component.

# 0.6.2.3 — Combobox keyboard fix

- Combobox keeps DOM focus on the text input while arrow keys move the active option.
- `aria-activedescendant` is now owned by the combobox input.
- Prevented duplicate arrow-key handling caused by Listbox focus plus bubbling to Combobox.
- Standalone Listbox retains its own focus and keyboard contract.

# RepUI 0.6.2.3

## Fixed

- Standalone Listbox now handles ArrowUp, ArrowDown, Home, End, PageUp and PageDown.
- Navigation keys call preventDefault, so the document no longer scrolls while Listbox has focus.
- Enter and Space select the active option.
- Disabled options are skipped.
- Option buttons are removed from the Tab sequence; focus remains on the listbox root using aria-activedescendant.

# 0.6.2 — Component Checklist Playground

- Удалены отдельные QA HTML-страницы.
- Главный playground перестроен в единый покомпонентный тестовый маршрут.
- Каждый интерактивный компонент получил метку «Что проверить».
- Dialog перенесён на основную страницу.
- Добавлен общий порядок ручного тестирования.

## 0.6.1.4 — Navigation states and keyboard contract

- Added visible pointer hover states for Menubar and Navigation Menu.
- Added explicit keyboard focus rings to top-level navigation items.
- Added roving tabindex for both components.
- Menubar Left/Right/Home/End now move focus predictably.
- Navigation Menu Left/Right now includes ordinary top-level links, not only panel triggers.
- Arrow navigation works inside open panels and can switch neighboring menus.
- Programmatic focus uses preventScroll to avoid page jumps.

# 0.6.1.3

- Fixed documentation status badges stretching across grid containers.
- Status badges now size to their content and align to the start edge.


## 0.6.1.3 — Command focus fix

- Command Palette now traps Tab inside the modal surface.
- Command options are removed from the sequential Tab order and remain controlled through `aria-activedescendant`.
- Arrow, Home, End, Page Up and Page Down handling works regardless of which element inside the palette owns DOM focus.
- Navigation keys always call `preventDefault()`, so the document cannot scroll while the palette is open.
- Closing restores the previous focus without scrolling the page.

## 0.6.1.3

- Исправлен порядок CSS-директив в корневом `repui.css`.
- `@import` основной таблицы теперь расположен до `@font-face`, поэтому браузер больше не игнорирует стили компонентов и документации.
- Пути к общим шрифтам сохранены: `../fonts/manrope.woff2` и `../fonts/roboto-flex.woff2`.


## 0.6.1 — Fonts and Command Palette polish

- Shared fonts now resolve from `../fonts/manrope.woff2` and `../fonts/roboto-flex.woff2`.
- Removed obsolete package-local font requests and the resulting 404 errors.
- Restored a fully styled Command Palette input with radius, hover border, placeholder color and focus ring.
- Added control and command tokens instead of introducing new component magic values.
- Root `repui.css` is the supported development entrypoint.


## 0.6.0 — Foundation

### Added
- split design-token modules for spacing, radius, typography, motion, elevation and layout;
- focus modality and focus helper module;
- component registry and public instance lookup;
- generic interaction API: `open`, `close`, `toggle`, `state`;
- public portal API and runtime lifecycle helpers;
- written design decisions, roadmap and accessibility/Django notes;
- isolated QA pages for Select, Accordion and Dialog;
- debug outlines for initialized components.

### Decisions
- Unicode symbols are an intentional core feature, not a temporary fallback;
- platform capabilities are preferred before adding infrastructure;
- documented HTML, event and JavaScript APIs require changelog entries when changed.

### Compatibility
- Existing 0.5 component markup and component classes remain supported.

## 0.6.2.3 — Listbox interaction ownership

- Разделено состояние списка и владение клавиатурой.
- Standalone Listbox самостоятельно владеет фокусом, `tabindex` и `keydown`.
- Select и Combobox используют Listbox в `managed`-режиме без внутренних обработчиков клавиатуры.
- Устранено двойное продвижение активной опции в Select и Combobox.
- Удалён дублирующий `keydown` Select на корневом контейнере; владельцами являются trigger и floating content.
- Pointer interaction сохраняет фокус на владельце составного виджета.
