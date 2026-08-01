# RepUI rc 0.9.3 — архитектурный аудит

Дата аудита: 2026-08-01

## Краткий вывод

RepUI уже имеет здоровое ядро: самодостаточные компоненты, manifest-driven discovery, token contract, отдельный interaction layer, idempotent mount через WeakMap и native source of truth у Select. Главный риск не в неверной архитектуре, а в незакреплённых runtime- и template-tag контрактах: lifecycle HTMX размазан между компонентами и Workbench, а Django tags многократно повторяют парсинг и нормализацию аргументов.

Приоритет — не добавлять новые абстракции поверх всего сразу. Сначала закрепить единые контракты runtime и template tags и вынести bootstrap lifecycle в одно место.

## Что сделано хорошо

1. Компоненты разделены по вертикальным срезам: tags, templates, CSS, JS, manifest, tests.
2. `repui/interaction` уже выполняет роль общего application-independent ядра для overlay, dismiss, collection и roving.
3. Runtime-компоненты в основном используют `WeakMap` и возвращают существующий instance при повторном mount.
4. Select хранит значение в настоящем `<select>`, а кастомный UI является адаптером.
5. Темы отделены на semantic tokens, component contract и theme overrides.
6. Workbench автоматически обнаруживает компоненты и проверяет шаблоны.
7. Есть quality checklists и contract tests, а не только snapshot-рендер.

## Критические проблемы

### P1 — tags повторяют собственный мини-фреймворк

Почти каждый `tags.py` заново реализует:

- `split_contents`;
- проверку `name=value`;
- compile_filter;
- resolve kwargs;
- unknown arguments;
- bool coercion;
- aliases в HTML attrs;
- render_to_string.

Из-за этого API уже расходится: Choice строго валидирует bool, Checkbox/Button/Select используют `bool("false") == True`; Card ловит duplicate args, другие теги — нет.

Нужен небольшой внутренний toolkit, не универсальный component framework:

- `compile_keyword_arguments()`;
- `resolve_arguments()`;
- `reject_unknown()`;
- `resolve_bool()`;
- `extract_html_attrs()`;
- `BlockComponentNode` как опциональная базовая реализация.

## SOLID-аудит

### SRP

Хорошо:

- `OverlayPortal`, `DismissLayer`, `CollectionController`, `RovingGroup` разделены по ответственности;
- themes и component CSS отделены.

Нарушения:

- `SelectRuntime` строит DOM, управляет формой, collection, overlay, keyboard, events, sizing и lifecycle в одном классе;
- Workbench view одновременно выбирает component, собирает theme assets и presentation metadata;
- `repui_css` одновременно discovery, fallback/migration policy, ordering и HTML rendering.

Рекомендация: Select не надо дробить на 10 классов. Достаточно выделить `NativeSelectAdapter`/`OptionSource` и общий `PopupController`, когда второй компонент реально сможет их переиспользовать.

### OCP

Нарушения:

- несколько списков допустимых тем/компонентов могут расходиться.

Theme registry остаётся единственной точкой выбора палитры.

### LSP

Классической иерархии почти нет, поэтому риск невысок. Практическое нарушение контракта — разные наборы методов у runtime handles, хотя документация предполагает общий lifecycle.

Минимальный общий контракт:

- `element` или `root`;
- `refresh()`;
- `destroy()`.

Остальные методы компонент-специфичны.

### ISP

Сильная сторона: interaction primitives небольшие.

### DIP

Хорошо: высокоуровневые компоненты зависят от interaction primitives.

Нарушения:

## Уже используемые паттерны

- Vertical Slice / self-contained component package.
- Registry через manifests и discovery.
- Adapter: Select поверх native `<select>`.
- Controller: CollectionController, RovingGroup.
- Portal.
- Observer/Event-driven lifecycle через DOM events и HTMX.
- State holder через `CardRenderState` в template context.
- Null/fallback theme contract через semantic fallbacks.
- Idempotent mount / identity map через WeakMap.

## Паттерны, которые стоит внедрить

1. Runtime Registry + Bootstrap Coordinator.
2. Manifest Schema/Value Object (dataclass или TypedDict + validator).
3. Template Tag Parsing Toolkit.
4. Theme Asset Resolver как единственная точка выбора темы.
5. Overlay Stack для Escape и вложенных overlays — после появления submenu/nested dialogs.
6. Source Adapter для Select/Autocomplete/Combobox — только после стабилизации их различий.

Не нужны сейчас: DI-container, Abstract Factory на каждый компонент, глубокая class hierarchy, универсальный BaseComponent с десятками hooks.

## Code smells и технический долг

- Имена файлов смешаны: `component.js`, `select.js`, `code-block.js`, snake_case каталогов.
- Часть JS красиво форматирована, часть minified-like в одну строку.

## Тесты

JS tests запущены: 7/7 прошли (`CollectionController`, Listbox contract).

Текущая сильная сторона — много component render tests и source-contract tests. Главный пробел — мало browser-level interaction tests. Source grep не подтверждает реальное focus/portal/HTMX поведение.

Нужны Playwright tests для:


## Целевая структура

```text
repui/
  component_registry.py
  theme_registry.py
  runtime/
    bootstrap.js
    registry.js
  interaction/
    collection.js
    dismiss-layer.js
    overlay-portal.js
    roving.js
  template_support/
    arguments.py
    attrs.py
    nodes.py
  components/<name>/
    manifest.py
    tags.py
    templates...
    static...
    tests...
```

`core/` после миграции исчезает либо содержит только действительно фундаментальные stable primitives.

## План миграции

### Этап 1 — унификация tags

- продолжить перенос оставшихся block tags на parsing helpers;
- унифицировать aliases и duplicate-argument errors для оставшихся API.

### Этап 2 — browser tests и release engineering

- CI matrix Python/Django;
- visual snapshots Core/Mineral/Ocean.

## Правила для новых компонентов

1. Один публичный компонент — один canonical JS/CSS entrypoint.
2. Component manifest не знает названий конкретных тем.
3. Runtime всегда idempotent и имеет `refresh/destroy`.
4. Компонент не подписывается глобально на HTMX самостоятельно.
5. Native HTML является source of truth, если это возможно.
6. Theme override меняет только component tokens.
7. Новый interaction primitive появляется только после второго реального потребителя.
8. Workbench не содержит production lifecycle logic, отсутствующую в библиотеке.
9. Любой timer/document listener/observer освобождается в destroy.
10. Stable status требует browser interaction tests, а не только HTML render tests.
