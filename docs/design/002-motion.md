# 002 — Motion

**Статус:** принято

## Решение

Motion использует общие duration и easing tokens. Любая animation должна оставаться понятной при сведении длительности к 1 ms через `prefers-reduced-motion`.

Motion сообщает об изменении состояния, но не задерживает input, navigation или selection.
