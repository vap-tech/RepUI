# RepUI design decisions

1. [Unicode symbols](docs/design/001-unicode-symbols.md)
2. [Motion](docs/design/002-motion.md)
3. [Accessibility](docs/design/003-accessibility.md)
4. [Platform first](docs/design/004-platform-first.md)
5. [Stable API](docs/design/005-stable-api.md)
6. [Layered primitives](docs/design/008-layered-primitives.md)
7. [Browser owns native password behavior](docs/design/010-browser-password-ownership.md)

## Decision 007 — Explicit interaction ownership

**Status:** Accepted

Listbox разделяет две ответственности: коллекцию/активную опцию и управление вводом.

- `standalone` Listbox владеет фокусом и клавиатурой;
- `managed` Listbox предоставляет состояние опций родительскому Select или Combobox;
- одно событие клавиатуры всегда имеет ровно одного владельца.

Это предотвращает конкурирующие обработчики и регрессии вида «переход через один пункт».


## Decision: shared form-control contract

**Status:** Accepted in 0.6.3.

Input, Textarea and native Select use one tokenized visual contract for geometry, typography and interaction states. Component-specific files may add behavior such as textarea resizing or a native-select indicator, but must not redefine the common border, radius, surface, focus, disabled or validation states.


## Decision 008 — Layered primitives

**Status:** Accepted in 0.6.5.

Высокоуровневые компоненты могут использовать низкоуровневые примитивы, но не расширяют их API. RepUI стандартизирует поведение и визуальный контракт, а прикладное содержимое и правила остаются у потребителя.


## Decision 009 — Playground mirrors dependency direction

**Status:** Accepted in 0.6.6.

The playground is ordered as Information → Primitives → Components. A primitive does not consume another RepUI component. A component consumes at least one RepUI primitive or component. High-level components may consume low-level primitives, but never expand their API. The sidebar and physical page order must stay aligned so the playground remains both documentation and a manual regression map.


## Decision 010 — Browser owns native password behavior

**Status:** Accepted in 0.6.7.

Password Input changes only the underlying input `type` between `password` and `text`. Browser autofill, generated-password suggestions, password managers and native rendering remain under user-agent control. RepUI does not recreate the field or apply browser-specific workarounds.

## Decision 011 — Composition primitives own anatomy, not content

Accepted in 0.8.1. See `docs/design/011-composition-primitives.md`.

- [012 · Documentation examples are cohesive compositions](./docs/design/012-documentation-example-composition.md)

## 013 — Shared option collection mechanic

Select, Listbox, Combobox, and Command Palette share one internal option-collection mechanic for eligibility, a single active descendant, keyboard movement, pointer focus retention, and selection. Search/filtering, popup ownership, and visual composition remain responsibilities of each public component. Navbar and unrelated navigation controls are intentionally outside this decision.


## Single visual active state for option collections

Select, Listbox, Combobox, and Command Palette expose one visual active item. Pointer hover does not paint an independent second state; pointer movement and keyboard movement both update the shared active descendant. Selection remains separate semantic state (`aria-selected`) and is expressed with weight/checkmark rather than another active background. Disabled and passive content never clears the active descendant or steals keyboard ownership.
