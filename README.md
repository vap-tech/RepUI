# RepUI 0.8.2.5 — Documentation Components

RepUI is a Django-first UI library built with vanilla CSS and ES modules. It has no React, Tailwind, CDN, or runtime framework dependency.

Version 0.8.2.5 adds Example and Code Block: cohesive live-preview/source composition, copy controls, a soft-success language badge, and dependency-free HTML, CSS, and Django syntax highlighting. Hero and Card anatomy remain the composition foundation.

## Release status

- Current components and playground examples have passed manual accessibility and keyboard-navigation review.
- Command Palette behavior has been verified with a 50-command fixture, bounded scrolling, visible result counts, active-item visibility, non-selectable chrome, focus retention, and backdrop click-to-close.
- Password Input changes only the underlying input `type`; autofill, generated-password suggestions, password managers, and native rendering remain browser-owned.
- Fieldset, Choice, ChoiceGroup, FieldError, and Native DateTime are CSS-first and require no JavaScript.
- The browser owns the calendar and time picker presented by `input[type="datetime-local"]`; RepUI standardizes only the surrounding field and control appearance.
- Interactive controls use the platform `system-ui` stack; content remains in Roboto Flex and display headings remain in Manrope.

## Run the playground

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`.

## Public entry points

```html
<link rel="stylesheet" href="/static/repui/repui.css">
<script type="module" src="/static/repui/repui.js"></script>
```

## Public foundation API

```js
RepUI.open(target)
RepUI.close(target)
RepUI.toggle(target)
RepUI.state(target)
RepUI.getInstance(target)
RepUI.getComponentName(target)
RepUI.getModality()
RepUI.portal.mount(node)
RepUI.portal.unmount(node)
RepUI.debug(true)
RepUI.inspect(target)
```

The runtime reports `RepUI.version === "0.8.2.5"`.

## Composition primitives

### Hero

```html
<section class="rui-hero" data-layout="split">
  <div class="rui-hero__content">
    <span class="rui-badge rui-hero__eyebrow">Django-first</span>
    <h1 class="rui-hero__title">Build pages from stable composition primitives</h1>
    <p class="rui-hero__description">Optional regions keep the markup semantic and predictable.</p>
    <div class="rui-hero__actions">...</div>
  </div>
  <div class="rui-hero__media">...</div>
</section>
```

Use `data-layout="split"` only when a media region is present. Every region is optional.

### Card anatomy

```html
<article class="rui-card">
  <header class="rui-card__header">
    <h2 class="rui-card__title">Card title</h2>
    <p class="rui-card__description">Supporting copy.</p>
  </header>
  <div class="rui-card__body">...</div>
  <footer class="rui-card__footer">...</footer>
</article>
```

Header, body, and footer may be used independently. Existing `.rui-card.rui-card__body` usage remains compatible.

## Architecture

The playground and dependency direction follow three levels:

1. **Information** — documentation, status, contracts, and guidance.
2. **Primitives** — independent low-level controls and presentation building blocks.
3. **Components** — composed behavior built from primitives or other components.

Higher-level components may consume lower-level primitives, but must not expand their public contracts for a single use case.

## Structure

- `css/tokens/` — color, spacing, radius, typography, motion, elevation, and layout.
- `css/components/` — component styles.
- `js/runtime/` — focus, registry, interaction, runtime, portal, floating, overlay, motion, and modality helpers.
- `js/components/` — component behavior.
- `docs/design/` — accepted architectural decisions.
- `docs/accessibility/` — keyboard and accessibility guidance.
- `docs/django/` — Django integration notes.
- `templates/repui/` — Django include templates.
- `index.html` — the single playground and manual regression route.

## Interaction contracts

### Listbox ownership

```js
new RepUI.Listbox(element, { interactionMode: 'standalone' });
new RepUI.Listbox(element, {
  interactionMode: 'managed',
  activeDescendantTarget: input,
  focusTarget: input,
});
```

`standalone` owns its focus and keyboard interaction. `managed` exposes collection state while a parent Select or Combobox owns keyboard input. One keyboard event has one owner.

### Form controls

Input, Textarea, and native Select share the same tokenized control geometry and interaction states. Use `.rui-input`, `.rui-textarea`, or `.rui-native-select`; do not derive Textarea styling from `.rui-input`. Single-line controls also own their canonical height and placeholder alignment; application styles should avoid adding independent vertical padding to `.rui-input`.


### Form composition

Use native semantics and add RepUI classes around them:

```html
<fieldset class="rui-fieldset">
  <legend class="rui-fieldset__legend">Когда нужна машина</legend>
  <div class="rui-choice-group" data-orientation="horizontal">
    <label class="rui-choice">
      <input type="radio" name="requested_time_type" value="now" checked>
      <span class="rui-choice__control" aria-hidden="true"></span>
      <span class="rui-choice__label">Сейчас</span>
    </label>
  </div>
</fieldset>
```

For date and time selection, apply `.rui-datetime-input` to a native `datetime-local` input. RepUI intentionally does not replace the browser picker with a custom calendar.

### Composite collections

Text inputs retain native caret keys. Managed collections use arrows, Page Up/Down, Ctrl+Home/End, and `aria-activedescendant`. Floating panels position against the visual viewport and expose their resolved side through `data-side`.

## Shared development fonts

The root `repui.css` expects shared files one directory above the release:

```text
../fonts/manrope.woff2
../fonts/roboto-flex.woff2
```

Load the root `repui.css`; do not load `css/repui.css` directly when using this development layout.

## Documentation

- See `CHANGELOG.md` for release history.
- See `DESIGN_DECISIONS.md` for the accepted architectural contract.
- See `ROADMAP.md` for post-0.7 direction.


## Example and Code Block

```html
<div class="rui-example">
  <div class="rui-example__preview">...</div>
  <div class="rui-example__source">
    <div
      class="rui-code-block"
      data-rui-code-block
      data-language="html"
      data-width="full"
      data-height="md"
      data-scroll="true"
    >
      <pre class="rui-code-block__pre"><code class="rui-code-block__code">...</code></pre>
    </div>
  </div>
</div>
```

The language badge is generated from `data-language` and floats at the top right. The copy action is generated as an icon button at the bottom right. Both controls intentionally overlay the code surface.

Width presets are `xs`, `sm`, `md`, `lg`, `xl`, and `full`. Height presets are `xs`, `sm`, `md`, `lg`, and `xl`. Scrolling is enabled by default; `data-scroll="false"` removes the vertical height limit while preserving horizontal overflow protection. When embedded in `.rui-example__source`, the parent owns the outer border and corner geometry.

`data-language="html"`, `data-language="css"`, and `data-language="django"` enable the built-in dependency-free highlighters. Django mode highlights template tags and variables while preserving HTML highlighting. Copy uses the original source text rather than highlighted markup.


### Highlighting API

`RepUI.highlightCode(source, language)` selects the built-in highlighter. Direct helpers are also exposed as `RepUI.highlightHtml`, `RepUI.highlightCss`, and `RepUI.highlightDjango`. Unknown languages are escaped and rendered as plain text.


## Interaction core

Version 0.8.2.5 embeds the collection layer used by `rui-core` v0.1.2 semantics. Django users still load the same static ES module and do not need Node or npm. The integration is intentionally limited to the shared option collection used by Listbox, Select, Combobox, and Command Palette; overlay positioning and existing RepUI component APIs remain unchanged.
