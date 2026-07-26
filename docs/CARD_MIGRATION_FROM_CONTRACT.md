# Переход от контрактного Card к полной реализации

Существующие файлы контракта заменяются полной реализацией.

## Добавлено

```text
components/card/tags.py
components/card/schema.py
components/card/examples.py
components/card/quality.py
components/card/tests/

templates/repui/components/card/card.html
templates/repui/components/card/card_header.html
templates/repui/components/card/card_body.html
templates/repui/components/card/card_footer.html
```

## Сохранено

```text
manifest.py
card.css
card-tokens.css
CARD_COMPONENT.md
```

но их содержимое расширено.

## Первый рабочий пример

```django
{% load repui %}

{% card %}
  <h1>Hello World</h1>
{% endcard %}
```

## Структурированный пример

```django
{% card %}
  {% card_header %}Header{% endcard_header %}
  {% card_body %}Body{% endcard_body %}
  {% card_footer %}Footer{% endcard_footer %}
{% endcard %}
```
