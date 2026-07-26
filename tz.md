Лучше сделать **один Django-проект для разработки**, внутри которого RepUI будет обычным переиспользуемым Django app, а `docs` — отдельным приложением-витриной.

Так ты сразу проверяешь RepUI ровно в тех условиях, в которых её потом будет использовать бекендер.

```text
RepUI/
├── pyproject.toml
├── manage.py
│
├── config/                       # Django project
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── repui/                        # распространяемый Django app
│   ├── __init__.py
│   ├── apps.py
│   │
│   ├── components/
│   │   ├── listbox/
│   │   │   ├── manifest.py
│   │   │   └── README.md
│   │   ├── select/
│   │   ├── combobox/
│   │   ├── menu/
│   │   └── sheet/
│   │
│   ├── templates/
│   │   └── repui/
│   │       ├── listbox/
│   │       │   └── component.html
│   │       ├── select/
│   │       │   └── component.html
│   │       └── ...
│   │
│   ├── static/
│   │   └── repui/
│   │       ├── foundation/
│   │       │   ├── tokens.css
│   │       │   ├── reset.css
│   │       │   ├── typography.css
│   │       │   └── controls.css
│   │       ├── core/
│   │       │   ├── collection.js
│   │       │   ├── popup.js
│   │       │   └── dialog.js
│   │       └── components/
│   │           ├── select/
│   │           │   ├── component.css
│   │           │   └── component.js
│   │           └── ...
│   │
│   └── templatetags/
│       ├── __init__.py
│       └── repui.py
│
├── docs/                         # только сайт документации
│   ├── apps.py
│   ├── urls.py
│   ├── views.py
│   ├── templates/
│   │   └── docs/
│   │       ├── base.html
│   │       ├── index.html
│   │       └── components/
│   │           ├── select.html
│   │           └── ...
│   └── static/
│       └── docs/
│           ├── docs.css
│           └── docs.js
│
└── tests/
    ├── test_assets.py
    ├── test_templates.py
    └── test_htmx.py
```

## Главная граница

`docs` **не должна владеть компонентами**.

Она только использует публичный API RepUI:

```django
{% load repui %}

{% repui_assets "select" "sheet" %}

{% include "repui/select/component.html" with ... %}
```

Если документация вынуждена импортировать что-то вроде:

```python
from repui.components.select.internal import ...
```

значит публичная граница ещё не сформирована.

## Настройки Django

```python
INSTALLED_APPS = [
    # Django
    "django.contrib.staticfiles",

    # Library under development
    "repui",

    # Demo/documentation site
    "docs",
]
```

За счёт app directories Django автоматически найдёт:

```text
repui/templates/repui/...
repui/static/repui/...
```

В шаблонах документации будут работать и `{% static %}`, и template tags RepUI.

## `apps.py`

```python
from django.apps import AppConfig


class RepUIConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "repui"
    verbose_name = "RepUI"
```

И в `repui/__init__.py` лучше ничего автоматически не выполнять.

## Компонент как независимый модуль

Я бы держал шаблон отдельно от статических файлов только потому, что так устроен стандартный Django app discovery:

```text
repui/templates/repui/select/component.html

repui/static/repui/components/select/component.css
repui/static/repui/components/select/component.js
```

Логически это один компонент, хотя физически файлы лежат в двух стандартных Django-каталогах.

Его описание можно хранить в Python:

```python
# repui/components/select/manifest.py

COMPONENT = {
    "name": "select",
    "styles": (
        "repui/foundation/tokens.css",
        "repui/foundation/controls.css",
        "repui/components/select/component.css",
    ),
    "scripts": (
        "repui/components/select/component.js",
    ),
    "template": "repui/select/component.html",
}
```

Но центральный файл со списком всех компонентов не нужен. Template tag может находить manifest по соглашению:

```python
import importlib


def load_component(name: str) -> dict:
    module = importlib.import_module(
        f"repui.components.{name}.manifest"
    )
    return module.COMPONENT
```

Добавил каталог `calendar/` — существующие компоненты не меняются.

## Template tags

На первом этапе я бы не делал слишком умный runtime. Достаточно двух механизмов.

### Явное подключение assets

```django
{% load repui %}

{% repui_styles "select" "combobox" %}
```

Внизу страницы:

```django
{% repui_scripts "select" "combobox" %}
```

Тег:

1. загружает manifest каждого компонента;
2. собирает CSS;
3. дедуплицирует пути;
4. выводит entrypoint JS;
5. JS-модули сами импортируют общий core.

Результат:

```html
<link rel="stylesheet"
      href="/static/repui/foundation/tokens.css">
<link rel="stylesheet"
      href="/static/repui/foundation/controls.css">
<link rel="stylesheet"
      href="/static/repui/components/select/component.css">
<link rel="stylesheet"
      href="/static/repui/components/combobox/component.css">

<script type="module"
        src="/static/repui/components/select/component.js"></script>
<script type="module"
        src="/static/repui/components/combobox/component.js"></script>
```

Общий `collection.js` браузер загрузит один раз через ES imports.

### Для HTMX

Для динамически появившихся компонентов нужен один небольшой loader, но только на страницах, где используется HTMX:

```html
<script type="module"
        src="/static/repui/loader.js"></script>
```

Фрагмент возвращается с маркером:

```html
<div
    data-rui-component="combobox"
    data-rui-entry="/static/repui/components/combobox/component.js"
>
    ...
</div>
```

Loader после `htmx:afterSwap` делает:

```js
async function mountComponents(root = document) {
  const nodes = root.querySelectorAll(
    "[data-rui-component][data-rui-entry]"
  );

  for (const node of nodes) {
    if (node.dataset.ruiMounted === "true") {
      continue;
    }

    const module = await import(node.dataset.ruiEntry);
    module.mount(node);
    node.dataset.ruiMounted = "true";
  }
}

document.addEventListener("htmx:afterSwap", (event) => {
  mountComponents(event.detail.target);
});
```

И перед удалением:

```js
document.addEventListener(
  "htmx:beforeCleanupElement",
  async (event) => {
    const nodes = [
      event.detail.elt,
      ...event.detail.elt.querySelectorAll(
        "[data-rui-component][data-rui-entry]"
      ),
    ];

    for (const node of nodes) {
      if (node.dataset.ruiMounted !== "true") {
        continue;
      }

      const module = await import(node.dataset.ruiEntry);
      module.destroy?.(node);
      delete node.dataset.ruiMounted;
    }
  }
);
```

Это позволяет HTMX вставить Combobox хоть внутрь содержимого Select. Валидность такой композиции — отдельный вопрос, но инфраструктура не ломается.

## Как использовать в `docs`

`docs/templates/docs/base.html`:

```django
{% load static repui %}

<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">

    <link
        rel="stylesheet"
        href="{% static 'docs/docs.css' %}"
    >

    {% block repui_styles %}{% endblock %}
</head>

<body>
    {% block content %}{% endblock %}

    <script src="https://unpkg.com/htmx.org@2"></script>

    {% block repui_scripts %}{% endblock %}
</body>
</html>
```

Страница Select:

```django
{% extends "docs/base.html" %}
{% load repui %}

{% block repui_styles %}
    {% repui_styles "select" %}
{% endblock %}

{% block content %}
    <h1>Select</h1>

    {% include "repui/select/component.html" with
        name="country"
        options=options
    %}
{% endblock %}

{% block repui_scripts %}
    {% repui_scripts "select" %}
{% endblock %}
```

HTMX-пример:

```django
<button
    hx-get="{% url 'docs:select-fragment' %}"
    hx-target="#sandbox"
    hx-swap="innerHTML"
>
    Вставить Select
</button>

<div id="sandbox"></div>
```

Фрагмент:

```django
{% load repui %}

{% include "repui/select/component.html" with
    name="country"
    options=options
%}
```

При этом CSS желательно подключить заранее на странице документации, а JS loader сможет догрузить модуль после swap.

## Что публиковать как пакет

`pyproject.toml` должен включать шаблоны и статику RepUI, но не обязательно включать приложение `docs`.

```toml
[tool.setuptools.package-data]
repui = [
    "templates/**/*.html",
    "static/**/*",
]
```

В установленный пакет пользователь получает:

```text
repui/
├── templates/
├── static/
├── templatetags/
└── components/
```

А `docs` остаётся только в GitHub-репозитории как demo project.

## Итоговая модель

```text
config
  └── запускает проект

repui
  └── реальная распространяемая библиотека

docs
  └── первый настоящий пользователь RepUI
```

Это лучший тест архитектуры: если `docs` способна собрать весь сайт, используя только публичные шаблоны, теги и static assets RepUI, значит пакет действительно готов для внешнего Django-проекта.
