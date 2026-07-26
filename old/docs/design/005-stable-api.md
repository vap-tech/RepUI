# 005 — Stable public API

**Статус:** принято

## Решение

Публичный HTML использует `rui-*` classes и `data-rui-*` behavior hooks. Публичные события используют namespace `rui:*`.

Private DOM structure может меняться. Изменение задокументированных attributes, events или methods требует записи в changelog и обновления component docs.
