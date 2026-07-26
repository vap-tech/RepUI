# 003 — Accessibility

**Статус:** принято

## Решение

Каждый interactive component предоставляет native semantics или корректный ARIA pattern, видимый keyboard focus и предсказуемое поведение `Escape`.

Modal layer после закрытия возвращает focus на trigger. Server-rendered markup должен оставаться usable до инициализации RepUI, если это возможно.
