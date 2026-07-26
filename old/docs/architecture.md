# Architecture

## Слои

```text
rui-core
  state, controllers, collection navigation, selection, ARIA
        ↓
RepUI adapters
  DOM wiring, lifecycle, events, form values
        ↓
RepUI runtime
  FloatingLayer, portal, focus, overlays, DOM helpers
        ↓
CSS и templates
  визуальные состояния и Django-friendly markup
```

## `rui-core`

Независимое TypeScript-ядро. Оно не знает о RepUI CSS и не отвечает за geometry. В bundle входят controllers и DOM bindings для коллекций, Menu и других behavior primitives.

## `js/runtime/`

Browser infrastructure RepUI. `FloatingLayer` портализует panel, рассчитывает flip/shift, ограничивает высоту по viewport и следит за scroll/resize. Runtime не должен дублировать state из `rui-core`.

## `js/components/`

Adapters связывают markup с core и runtime. Например, Select использует `rui-core` для active/selection, а `FloatingLayer` — для размещения panel.

## Interaction ownership

У каждого события должен быть один владелец. Keyboard navigation и active state принадлежат collection/controller, geometry — FloatingLayer, а внешний adapter только соединяет их и публикует component events.

## Portal lifecycle

При open panel может временно перемещаться в `document.body`. При close/destroy он должен возвращаться на исходное место, а listeners, observers и timers должны быть сняты.
