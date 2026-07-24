# Menu

## Назначение

Menu/Dropdown — navigation component для команд и переходов. В отличие от Select, Menu не отображает выбранное form value.

## Markup

```html
<div data-rui-menu>
  <button data-rui-menu-trigger type="button">Действия</button>
  <div data-rui-menu-content hidden>
    <button data-rui-menuitem data-value="edit">Редактировать</button>
    <button data-rui-menuitem data-value="archive">Архивировать</button>
    <button data-rui-menuitem data-disabled="true">Удалить</button>
  </div>
</div>
```

`MenuController` владеет active и selection, `core-menu.js` связывает его с trigger и `FloatingLayer`.

## Keyboard и pointer

- `ArrowDown`, `Enter` и `Space` на trigger открывают меню с первым доступным active;
- `ArrowDown` / `ArrowUp`, `Home` / `End` перемещают active;
- pointer movement сразу передаёт active пункту под курсором;
- `Enter` выбирает active;
- `Space` в открытом меню закрывает его без selection;
- `Escape` и outside click закрывают меню;
- navigation bounded, без циклического перехода за границы.

Визуально Menu показывает одно состояние `data-active`: active получает фон и focus ring, обычный hover сам по себе отдельное состояние не рисует.

## Selection и close

После selection сначала отправляется `rui:menuselect`, затем меню закрывается, toast или внешний обработчик получает фактический пункт, а focus возвращается на trigger. Disabled item не становится active и не вызывает selection.

## Demo

[Открыть Navigation playground](../../navigation.html#menu).
