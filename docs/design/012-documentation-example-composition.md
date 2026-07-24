# Decision 012 · Documentation examples are cohesive compositions

**Status:** Accepted

## Context

Detached code panels visually broke the relationship between a live component preview and its source. External syntax-highlighting dependencies would also add weight and lifecycle ownership to the core documentation.

## Decision

RepUI provides two small public documentation components:

- `rui-example` binds preview and source regions into one bordered object;
- `rui-code-block` owns the language label, copy action, source geometry, and token colors.

The runtime includes a deliberately narrow HTML highlighter. Unsupported languages remain readable plain text. The original text is retained for copying.

## Consequences

Examples read as a single composition, theme tokens control their appearance, and HTML highlighting works without Prism, Highlight.js, or Shiki. The highlighter is not a general parser and must remain intentionally small.


## 0.8.2.1 refinement

`rui-code-block` is a code surface rather than a toolbar card. Language and copy controls overlay the surface. When embedded, the owner component controls the external border, clipping, and corner radius. Vertical scrolling is the default; disabling it means content-height expansion while horizontal overflow protection remains active.
