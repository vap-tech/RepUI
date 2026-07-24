# 001 — Unicode symbols

**Статус:** принято

## Решение

Для небольших системных affordance RepUI использует Unicode-символы: `⌄`, `✓`, `×`, `…` и стрелки.

## Почему

- не нужны runtime, sprite, icon font и лицензия на набор иконок;
- символы работают в desktop и mobile-браузерах;
- их удобно использовать в Django templates;
- markup остаётся маленьким и переносимым.

Content-specific pictograms могут быть emoji. Собственный icon set появится только после стабилизации visual language.
