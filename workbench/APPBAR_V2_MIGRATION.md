# Переход на AppBar v2.0

## Было

```django
{% appbar
  position="floating"
  width="two-thirds"
%}
  ...
{% endappbar %}
```

## Стало

```django
{% appbar
  position="floating"
  left=1
  span=2
  right=1
%}
  {% panel surface="appbar" width="full" %}
    ...
  {% endpanel %}
{% endappbar %}
```

`1 / 2 / 1` и `3 / 6 / 3` дают одинаковую пропорцию.

## Основные варианты

По центру:

```django
left=3 span=6 right=3
```

Слева:

```django
left=0 span=6 right=6
```

Справа:

```django
left=6 span=6 right=0
```

Асимметрично:

```django
left=1 span=6 right=3
```

Сумма не обязана равняться 12.

## Attached

При:

```django
position="attached"
```

`left`, `span`, `right` сохраняются в DOM, но не влияют на ширину. AppBar всегда
занимает всю строку. Если затем JS переключит его в `floating`, сохранённые
пропорции сразу применятся.

## JavaScript

```js
import {
  setAppBarPosition,
  toggleAppBarPosition,
  setAppBarLayout,
} from "/static/repui/components/appbar/appbar.js";

const appbar = document.querySelector("#docs-appbar");

setAppBarLayout(appbar, {
  left: 1,
  span: 6,
  right: 3,
});

setAppBarPosition(appbar, "floating");
```

## Без собственного JS

```html
<button
  type="button"
  data-rui-appbar-layout-target="docs-appbar"
  data-rui-appbar-left="3"
  data-rui-appbar-span="6"
  data-rui-appbar-right="3"
>
  По центру
</button>
```

Один раз подключите:

```js
import {
  mountAppBarControls,
} from "/static/repui/components/appbar/appbar.js";

mountAppBarControls(document);
```

## HTMX

HTMX может вернуть AppBar с другими атрибутами или заменить оболочку целиком.
AppBar не создаёт listeners автоматически.

## Поверхность

AppBar v2 отвечает только за размещение. Фон и визуальное оформление создаёт
Panel:

```django
{% panel surface="appbar" width="full" %}
  ...
{% endpanel %}
```
