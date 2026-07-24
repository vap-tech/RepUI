# 012 — Documentation example composition

**Статус:** принято

## Решение

Live preview и source code оформляются как одна composition из двух public components:

- `Example` связывает preview и source в одном bordered объекте;
- `CodeBlock` отвечает за language label, copy action, source geometry и syntax colors.

`CodeBlock` использует небольшой встроенный HTML highlighter. Unsupported languages остаются читаемым plain text, а исходный текст сохраняется для copy.

## Ограничения

`CodeBlock` не является general-purpose parser. При встраивании внешний border, clipping и corner radius контролирует владелец `Example`; vertical scrolling включён по умолчанию.
