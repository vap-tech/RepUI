# Listbox

## Назначение

Listbox — коллекция options для выбора одного или нескольких значений. Типичный пример — список чатов, папок или доступных действий в боковой панели.

## Markup

```html
<div data-rui-listbox role="listbox" tabindex="0" aria-label="Города">
  <button data-rui-option data-value="voronezh">Воронеж</button>
  <button data-rui-option data-value="liski">Лиски</button>
  <button data-rui-option data-disabled="true">Недоступно</button>
</div>
```

RepUI подключает Listbox через `RUICore.mount(root)`. Options получают `role="option"`, `aria-selected` и `data-active`.

## Keyboard

- `ArrowDown` / `ArrowUp` перемещают active;
- `Home` / `End` переходят к границам;
- `PageUp` / `PageDown` перемещают на страницу;
- `Enter` или `Space` выбирают active;
- typeahead ищет option по первой букве.

Навигация bounded: на первой/последней позиции стрелка не зацикливает список.

## Pointer и selection

Наведение и pointer activation меняют active. Selection происходит отдельно по click или keyboard confirmation. Disabled option игнорируется.

## Когда использовать

Используйте Listbox, когда активный пункт сам является частью интерфейса и его выбор меняет содержимое рядом: например, список чатов и открываемая справа переписка.

Для выбора значения в форме используйте [Select](select.md), для поиска по options — [Combobox](combobox.md).

## Demo

[Открыть Collections playground](../../collections.html#listbox).
