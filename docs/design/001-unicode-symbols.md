# Decision 001 — Unicode symbols

**Status:** Accepted · **Since:** 0.5.3.4 · **Review:** after 1.0

RepUI uses Unicode symbols for small system affordances such as `⌄`, `✓`, `×`, `…` and arrows.

## Why

- no runtime, sprite, font or licensing dependency;
- native rendering on desktop and mobile platforms;
- predictable fallback in Django templates;
- tiny markup and excellent compatibility.

Content-specific pictograms may use emoji. A dedicated authored icon set is intentionally postponed until the visual language is stable.
