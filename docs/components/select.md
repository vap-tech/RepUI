# Select

## Назначение

Select — single-value collection control. Он показывает выбранный label в trigger, хранит value в hidden input и открывает options в floating panel.

## Markup

```html
<div class="rui-select" data-rui-select>
  <input type="hidden" name="settlement">
  <button data-rui-select-trigger type="button">
    <span data-rui-select-value>Выберите пункт</span>
  </button>
  <div data-rui-select-content hidden>
    <button data-rui-option data-value="one">Первый пункт</button>
    <button data-rui-option data-value="two">Второй пункт</button>
  </div>
</div>
```

RepUI adapter связывает `RUICore.bindSelect` с `FloatingLayer`. Panel может быть portaled и открываться вверх у нижней границы viewport.

## Keyboard

- закрытый Select открывается через `ArrowDown`, `ArrowUp`, `Enter` или `Space`;
- стрелки, `Home`, `End`, `PageUp`, `PageDown` двигают active;
- `Enter` подтверждает active;
- `Escape` закрывает без изменения value;
- typeahead ищет option по label.

## Value и events

При selection обновляются visible label и hidden input. Django получает обычный form value. Disabled options нельзя выбрать.

## Focus и lifecycle

После выбора или `Escape` focus возвращается на trigger. При destroy должны быть удалены listeners и floating observers.

## Demo

[Открыть Collections playground](../../collections.html#select).
