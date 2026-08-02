При проектировании ориентир был на:

* **Registry** — отдельные реестры компонентов и тем с единым контрактом discovery.
* **Adapter** — связывать кастомный UI с native `select`, `input`, Django forms.
* **Controller** — отдельно держать логику коллекций, roving focus, overlay.
* **Composition** — собирать `Select` из Listbox + Portal, а не наследовать от Menu.
* **Observer** — DOM-события `change`, `activate` и HTMX lifecycle. Отдельный Event Bus не нужен, пока DOM-событий достаточно.
* **Strategy** — разные алгоритмы позиционирования, выбора, закрытия или typeahead только при наличии двух реальных вариантов.
* **Factory** — bootstrap централизованно создаёт runtime по manifest; не строить иерархию фабрик без необходимости.
* **Facade** — простой публичный API поверх сложного interaction-слоя.
* **State Machine** — Dialog, Select, Drawer, Autocomplete: применять при сложных переходах `open/closed/loading/error`, а не для простого boolean-state.
* **Overlay Stack** — верхний открытый overlay единолично обрабатывает Escape; нижние слои не конкурируют глобальными listener’ами.
* **Lifecycle contract** — единый `mount → refresh → destroy`, без Template Method и глубокой иерархии наследования.
* **Null Object** — допустим для действительно optional runtime/portal root, но не должен скрывать ошибку конфигурации.
* **Specification** — валидация manifest и аргументов template tags.
* **Dependency Injection** — передавать portal root, theme context и adapters, когда их действительно нужно подменять, а не искать глобально.
* **Vertical Slice** — хранить tag, template, CSS, JS, manifest и tests рядом.
* **Anti-Corruption Layer** — изолировать HTMX и Django-specific детали от interaction-core; пока это правило границы, а не отдельный слой.

Главные для RepUI: **Registry, Adapter, Controller, Composition, Specification, Vertical Slice и lifecycle contract**. Остальные добавлять только при реальной повторяемости.

## Именование JavaScript-файлов

- Python-каталоги компонентов используют `snake_case`, чтобы совпадать с Django package names.
- Canonical JS entrypoint совпадает с именем компонента: `select.js`, `menu.js`, `appbar.js`.
- Составные имена используют `kebab-case`: `code-block.js`, `command-palette.js`, `dropdown-menu.js`.
- Generic-имя `component.js` для entrypoint не используется.
- Внутренние helpers называют по ответственности: например, `highlight.js`.
