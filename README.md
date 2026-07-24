# RepUI

RepUI — Django-first UI library на vanilla CSS и ES modules. Проект не требует React, Tailwind, CDN или runtime framework.

## Что умеет

- tokenized CSS primitives и compositional components;
- accessible form controls и native-first markup;
- collections: Listbox, Select и Combobox;
- navigation: Menu/Dropdown;
- floating panels с portal, flip, shift и visual viewport support;
- Django-friendly hidden inputs и HTML templates;
- live playground с preview и code block рядом.

## Быстрый старт

```bash
python3 -m http.server 8000
```

Откройте `http://localhost:8000/`.

Для Django подключите собранные static-файлы:

```html
<link rel="stylesheet" href="/static/repui/repui.css">
<script type="module" src="/static/repui/repui.js"></script>
```

## Playground

- [Оглавление](index.html)
- [Collections](collections.html) — Listbox, Select, Combobox
- [Navigation](navigation.html) — Menu/Dropdown
- [Legacy playground](index_old.html) — старая полная demo-страница

## Структура

- `css/tokens/` — design tokens;
- `css/components/` — component styles;
- `js/runtime/` — RepUI browser infrastructure: FloatingLayer, DOM, portal, focus и runtime helpers;
- `js/components/` — RepUI adapters и component behavior;
- `js/vendor/rui-core.min.js` — собранное независимое `rui-core` с controllers и DOM bindings;
- `django/templates/` — Django templates, без навязанного namespace;
- `django/templatetags/` — optional Django template tags;
- `docs/` — component contracts, architecture и integration guidance.

## Архитектурный принцип

`rui-core` владеет state и interaction semantics. RepUI владеет markup, styling, portal и geometry. Подробности — в [docs/architecture.md](docs/architecture.md).

## Документация

Начните с [карты документации](docs/README.md). Для текущих компонентов:

- [Listbox](docs/components/listbox.md)
- [Select](docs/components/select.md)
- [Combobox](docs/components/combobox.md)
- [Menu](docs/components/menu.md)

Историю решений и специализированные соглашения см. в `docs/design/`, `docs/django/` и [карте документации](docs/README.md).
