# 011 — Composition primitives

**Статус:** принято

## Решение

`Hero` и `Card` владеют собственной anatomy и typography, но не содержимым.

Они предоставляют optional semantic regions, не требуют фиксированного количества children, не навязывают application content и не добавляют JavaScript behavior.

В документации используются те же public classes, что и у consumers.
