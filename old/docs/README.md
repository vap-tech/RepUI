# Документация RepUI

Документация разделена по ответственности: component docs описывают публичный контракт, architecture docs — устройство слоёв, а design и integration docs фиксируют решения и специальные сценарии.

## Component docs

- [Listbox](components/listbox.md)
- [Select](components/select.md)
- [Combobox](components/combobox.md)
- [Menu](components/menu.md)
- [Sheet](components/sheet.md)

Каждый component doc следует одной схеме:

1. назначение и когда использовать;
2. markup и подключение;
3. состояния и keyboard behavior;
4. pointer behavior;
5. disabled/selection rules;
6. события и form integration;
7. lifecycle и cleanup;
8. связанные demo и документы.

## Общие документы

- [Architecture](architecture.md)
- [Accessibility](accessibility.md)
- [Django integration](django/integration.md)

## Design decisions

Решения, которые нельзя случайно нарушить при интеграции, находятся в `docs/design/`. Это reference-материалы, а не пошаговые component docs.
