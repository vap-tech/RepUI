# Decision 010 — Browser owns native password behavior

**Status:** Accepted in 0.6.7.

## Decision

Password Input changes only the underlying input `type` between `password` and `text`. Autofill, generated-password suggestions, password managers and browser-specific rendering remain under user-agent control.

## Rationale

- RepUI fulfills the explicit component contract without emulating browser security UI.
- Native password managers and autofill remain compatible.
- Browser-specific timers, field recreation and autocomplete workarounds are avoided.
- The component stays platform-first and predictable.

## Non-goals

RepUI does not override autofill, synchronize with password-manager UI, recreate the input node, or normalize browser-specific password rendering.
