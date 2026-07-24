# 004 — Platform first

**Статус:** принято

## Решение

Перед собственной infrastructure используются browser primitives: native form submission, hidden inputs, Constraint Validation, Unicode, CSS custom properties и ES modules.

Framework-specific abstraction добавляется только тогда, когда browser primitive не покрывает публичный контракт компонента.
