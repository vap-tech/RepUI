# Card в `/docs`

Страница Card должна показывать не внутреннюю реализацию, а возможности
компонента для backend-разработчика.

## Блоки страницы

```text
Назначение
Простой пример
Структурированный пример
Размеры и overflow
Theme tokens
HTMX
Checklist
```

## Демонстрации

### Простой контент

```django
{% card %}
  <h2>Hello World</h2>
  <p>Секции не обязательны.</p>
{% endcard %}
```

### Header / Body / Footer

```django
{% card width="full" %}
  {% card_header %}
    <h2>Параметры</h2>
  {% endcard_header %}

  {% card_body %}
    Содержимое
  {% endcard_body %}

  {% card_footer %}
    {% button %}Сохранить{% endbutton %}
  {% endcard_footer %}
{% endcard %}
```

### Scroll

Демо должно находиться в родителе с конечной высотой:

```django
<div class="docs-card-scroll-demo">
  {% card height="full" overflow="auto" %}
    {% card_header %}
      Header остаётся сверху
    {% endcard_header %}

    {% card_body %}
      Длинное содержимое
    {% endcard_body %}

    {% card_footer %}
      Footer остаётся снизу
    {% endcard_footer %}
  {% endcard %}
</div>
```

```css
.docs-card-scroll-demo {
  block-size: 24rem;
}
```

## Элементы управления Workbench

Card v1 не имеет JS API. Для демонстрации вариантов Workbench может менять
разметку через HTMX:

```text
surface:
card
flat
glass

width:
content
full

height:
content
full

overflow:
visible
auto
hidden
```

Сервер возвращает новую Card с выбранными параметрами.

## Checklist

- [ ] Простая Card работает без секций.
- [ ] Первый `<h1>` не превращается в Header автоматически.
- [ ] Header появляется только при `card_header`.
- [ ] Body появляется только при `card_body`.
- [ ] Footer появляется только при `card_footer`.
- [ ] По умолчанию Card растёт по содержимому.
- [ ] `width="full"` занимает ширину родителя.
- [ ] `height="full"` занимает конечную высоту родителя.
- [ ] Без секций `overflow="auto"` прокручивает всё содержимое.
- [ ] С секциями `overflow="auto"` прокручивает только Body.
- [ ] Header остаётся видимым при прокрутке Body.
- [ ] Footer остаётся видимым при прокрутке Body.
- [ ] `overflow="hidden"` не показывает выходящий контент.
- [ ] `surface="flat"` убирает тень.
- [ ] `surface="glass"` визуально отличается.
- [ ] Пользовательский surface можно добавить без изменения Python.
- [ ] Card читается в light.
- [ ] Card читается в dark.
- [ ] Grid внутри Card работает.
- [ ] Button внутри Footer работает.
- [ ] HTMX `innerHTML` работает.
- [ ] HTMX `outerHTML` работает.
- [ ] После нескольких HTMX swap нет дублированного поведения.
- [ ] При reduced motion переходы отключены.
