# Combobox

## Назначение

Combobox объединяет text input и фильтруемую коллекцию options. Пользователь может вводить query, выбирать result и отправлять отдельный hidden value в форму.

## Markup

```html
<div data-rui-combobox class="rui-combobox">
  <input data-rui-input autocomplete="off" placeholder="Начните вводить">
  <input data-rui-value name="organization" type="hidden">
  <div data-rui-popup hidden>
    <button data-rui-option data-value="school">Школа</button>
    <button data-rui-option data-value="library">Библиотека</button>
  </div>
</div>
```

Input сохраняет focus, а active option сообщается через `aria-activedescendant`. Popup размещает `FloatingLayer`.

## Keyboard

- ввод фильтрует options;
- `ArrowDown` / `ArrowUp` и Page keys перемещают active;
- `Enter` выбирает active;
- первый `Escape` восстанавливает committed value после изменённого query;
- следующий `Escape` закрывает popup;
- `Tab` закрывает popup без принудительного selection.

Обычные `Home` и `End` остаются нативными caret keys input. Для перехода к краю коллекции используются модифицированные комбинации, если они поддержаны текущим adapter.

## Value и events

Query находится в text input, а выбранный value — в hidden input. Selection обновляет оба значения и публикует component event. Новый query сбрасывает hidden value до следующего selection.

## Demo

[Открыть Collections playground](../../collections.html#combobox).
