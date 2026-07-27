# TODO: убрать `activeIndex`

Перевести внутренние коллекции и компоненты на полностью ID-based API.

## Цель

Убрать зависимость поведения от позиции элемента в массиве. После HTMX
refresh, вставки, удаления или перестановки options active item должен
восстанавливаться по стабильному `id`.

## План

1. Добавить в `CollectionController` публичные ID-based методы:
   - `activeItem`;
   - `getItem(id)`;
   - `setActiveById(id)`;
   - `move()` с возвратом `activeId`;
   - работу с `selectedIds`.
2. Перевести `Select` с `activeIndex` на `activeId`.
3. Перевести `Listbox` с `activeIndex` на `activeId`.
4. Перевести `Autocomplete` с `activeIndex` на `activeId`.
5. Добавить тесты для HTMX-сценариев:
   - вставка option перед active;
   - удаление option перед active;
   - перестановка options;
   - сохранение active после refresh;
   - disabled active option;
   - сохранение `selectedIds`.
6. Проверить Select, Listbox и Autocomplete вручную в Workbench.
7. Удалить `activeIndex` из `CollectionController` после миграции всех
   внутренних потребителей.

## Ограничение

До завершения миграции `activeIndex` остаётся внутренним compatibility
слоем. Новый публичный код не должен на него опираться.
