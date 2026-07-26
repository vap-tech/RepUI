# AppBar

AppBar — верхняя область страницы. Он не раскладывает кнопки и не ограничивает содержимое.

## Что можно настроить в Django

```django
{% appbar behavior="static|sticky" surface="default|solid|transparent|glass|любое-своё" id="..." class_name="..." attrs=my_attrs %}
  ...
{% endappbar %}
```

- `behavior="static"` — обычная шапка, уезжает при прокрутке.
- `behavior="sticky"` — остаётся сверху.
- `surface` — открытое имя визуального состояния для темы.
- `id`, `class_name`, `attrs` — обычная интеграция с приложением.

Внутрь можно положить Grid, Panel, Button, Card, Menubar и другие компоненты.

## Runtime API

```js
getAppBarState(appbar)
setAppBarBehavior(appbar, "static" | "sticky")
toggleAppBarBehavior(appbar)
setAppBarSurface(appbar, "glass")
```

При изменении отправляется `repui:appbarchange` с актуальными `behavior` и `surface`.

## Управление без собственного обработчика

```html
<button data-rui-appbar-toggle-behavior="docs-appbar">Закрепить</button>
<button data-rui-appbar-behavior-target="docs-appbar" data-rui-appbar-behavior="static">Уезжает</button>
<button data-rui-appbar-surface-target="docs-appbar" data-rui-appbar-surface="glass">Glass</button>
```

Один раз вызовите `mountAppBarControls(document)`.

## Theme tokens

```css
--rui-appbar-background
--rui-appbar-foreground
--rui-appbar-border
--rui-appbar-shadow
--rui-appbar-backdrop-filter
--rui-appbar-padding-block
--rui-appbar-padding-inline
--rui-appbar-z-index
--rui-appbar-sticky-offset
--rui-appbar-transition
```

AppBar не знает про `system`: resolver заранее выбирает light или dark.

## HTMX

Можно заменить AppBar целиком, только его содержимое или вернуть другие `data-behavior`/`data-surface`. Сам AppBar listeners не создаёт.
