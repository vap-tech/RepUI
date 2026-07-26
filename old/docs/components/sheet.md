# Sheet

## Назначение

`Sheet` — overlay panel, который выезжает сбоку или снизу viewport. Используйте его для filters, settings, cart и дополнительного контента, когда пользователю важно сохранить связь с текущей страницей.

`Sheet` не является `rui-core` collection primitive. Core даёт `SheetController` и `bindSheet` для overlay state, focus trap и закрытия по `Escape`/outside click; RepUI отвечает за geometry, visual style, scroll body и конкретный DOM contract.

## Markup

```html
<button data-rui-sheet-trigger="filters" aria-controls="filters">
  Фильтры
</button>

<div id="filters" class="rui-sheet" data-rui-sheet data-side="right" hidden aria-hidden="true">
  <div class="rui-sheet__backdrop"></div>
  <section class="rui-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="filters-title" tabindex="-1">
    <header class="rui-sheet__header">
      <h2 id="filters-title" class="rui-sheet__title">Фильтры</h2>
      <button type="button" data-rui-sheet-close aria-label="Закрыть">×</button>
    </header>
    <div class="rui-sheet__body">…</div>
  </section>
</div>
```

`data-side` принимает `right`, `left` или `bottom`. Django template находится в `django/templates/sheet.html`.

## Behavior

- trigger открывает panel и получает `aria-expanded`;
- backdrop и close button закрывают panel;
- `Escape` закрывает верхний Sheet;
- focus переходит внутрь panel и возвращается на trigger после закрытия;
- document scroll блокируется, пока Sheet открыт;
- длинный body получает scroll; боковые панели показывают scroll indicators.

## Events

- `rui:sheetopen` — panel открыт;
- `rui:sheetclose` — panel закрыт.

## Ограничения

Не смешивайте два adapter на одном DOM-узле: используйте либо RepUI runtime через `RepUI.init()`, либо core binding через `RUICore.mount`. В текущей demo-странице Sheet подключён через RepUI runtime, чтобы сохранить локальную geometry и scroll-логику.
