# Card

## Что это

Card — оформленная поверхность для независимого блока контента.

Подходит для:

- документации;
- товара;
- новости;
- профиля;
- настроек;
- runtime-панели;
- списка проверок;
- блока кода;
- любой самостоятельной группы содержимого.

## Простой вариант

```django
{% card %}
  <h1>Hello World</h1>
{% endcard %}
```

Card не требует Header, Body или Footer и ничего не создаёт автоматически.

## Публичный API

```django
{% card
  surface="card"
  width="content"
  height="content"
  overflow="visible"
  id="example"
  class_name="docs-card"
%}
  ...
{% endcard %}
```

### `surface`

Открытое имя поверхности для темы.

По умолчанию:

```text
card
```

Можно использовать пользовательское значение:

```django
{% card surface="admin-glass" %}
```

и определить его в теме:

```css
.rui-card[data-surface="admin-glass"] {
  --rui-card-background: ...;
  --rui-card-radius: ...;
}
```

### `width`

```text
content — по содержимому, default
full    — вся доступная ширина
```

### `height`

```text
content — по содержимому, default
full    — вся доступная высота
```

### `overflow`

```text
visible — default
auto
hidden
```

Без секций `overflow` применяется ко всему содержимому Card.

С секциями `overflow` применяется только к `card_body`, поэтому Header и Footer
остаются на месте.

## Необязательные секции

```django
{% card %}
  {% card_header %}
    ...
  {% endcard_header %}

  {% card_body %}
    ...
  {% endcard_body %}

  {% card_footer %}
    ...
  {% endcard_footer %}
{% endcard %}
```

Каждая секция необязательна.

Допустимы:

- только Header;
- Header + Body;
- Body + Footer;
- только Body;
- все три секции;
- отсутствие секций.

## Что можно вкладывать

Card не ограничивает содержимое.

Внутри можно использовать:

- обычный HTML;
- Button;
- Panel;
- Grid;
- Stack;
- Container;
- другую Card;
- будущие Badge, Code, Menubar, Table и Form.

## Прокрутка

Обычная Card растёт:

```django
{% card %}
  Длинный текст
{% endcard %}
```

Card в выделенной области:

```django
{% card height="full" overflow="auto" %}
  {% card_header %}
    Заголовок
  {% endcard_header %}

  {% card_body %}
    Длинное содержимое
  {% endcard_body %}

  {% card_footer %}
    Действия
  {% endcard_footer %}
{% endcard %}
```

Прокручивается только Body.

## Runtime API

У Card v1 нет JavaScript API.

Состояние полностью задаётся серверной разметкой и `data-*`.

Для runtime-изменений можно:

- заменить Card через HTMX;
- заменить её содержимое;
- изменить `data-surface`, `data-width`, `data-height` или `data-overflow`
  собственным JavaScript.

## HTMX

Card не создаёт:

- listeners;
- timers;
- observers;
- mount/unmount lifecycle.

Поэтому безопасны:

```text
hx-swap="innerHTML"
hx-swap="outerHTML"
```

Повторная инициализация не нужна.

## Theme tokens

```css
--rui-card-background
--rui-card-foreground
--rui-card-border
--rui-card-radius
--rui-card-shadow

--rui-card-padding
--rui-card-gap
--rui-card-divider

--rui-card-header-padding
--rui-card-body-padding
--rui-card-footer-padding

--rui-card-transition
```

## Откуда приходят токены

```text
глобальные palette/metrics tokens
        ↓
default card-tokens.css
        ↓
surface rule
        ↓
custom theme
        ↓
локальный CSS / inline custom properties
```

Пример зависимости:

```text
--rui-card-background
        ↓ fallback
--rui-color-surface
        ↓
активная light/dark схема
```

## Приоритет переопределения

От меньшего к большему:

```text
1. глобальные токены темы
2. default card tokens
3. data-surface rule
4. пользовательская тема, подключённая позже
5. локальный selector с большей специфичностью
6. inline custom properties
```

Компонент не знает про `system`. Theme resolver заранее выбирает `light` или
`dark`.

## Overlay в будущей версии

Внешний узел Card уже сохраняет `overflow: visible`, а декоративная поверхность
находится во внутреннем `.rui-card__surface`.

Это позволит позже добавить Badge, язык Code или кнопку копирования,
пересекающие рамку, без изменения API Card v1.
