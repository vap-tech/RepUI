# Integration TODO

## P0 — общий floating adapter

Вернуть для новых core-powered popup-компонентов общий RepUI adapter поверх
существующего `FloatingLayer`.

Компоненты первого контура:

- Select;
- Combobox;
- Popover;
- Menu/Dropdown;
- Command Palette.

Adapter должен:

- позиционировать panel относительно trigger/anchor;
- делать flip вверх, если снизу недостаточно места;
- выполнять shift по горизонтали и вертикали;
- учитывать visual viewport, scroll и resize;
- выставлять `data-side` (`top`, `bottom`, `left`, `right`);
- поддерживать match-width;
- работать с portal и не зависеть от `overflow` родительского контейнера;
- корректно подключаться и отключаться при `mount`/`unmount`;
- не дублировать state open/close из `rui-core`.

## Порядок

1. Сделать adapter для custom Select.
2. Удалить временные `overflow: visible` правила из `example.css`.
3. Подключить тот же adapter к Combobox.
4. Перенести Menu/Popover/Command на общий путь.
5. Добавить ручные проверки у нижнего и бокового края viewport, внутри
   scroll-контейнера и при resize.

## Acceptance

- Select у нижнего края открывается вверх;
- panel не обрезается `rui-example`, card или scroll-контейнером;
- `data-side` отражает фактическую сторону;
- focus, Escape, outside click и selection сохраняют текущий контракт;
- после destroy/unmount не остаются listeners, observers и portaled nodes.
