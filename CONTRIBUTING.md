# Contributing

## Definition of Done для компонента

Компонент без пользовательской документации, theme contract и ручного
checklist считается незавершённым и не принимается.

Перед добавлением компонента проверьте, что в его каталоге есть:

- краткое назначение: что это такое и когда его использовать;
- публичный API: параметры, допустимые значения и defaults;
- runtime API: функции, события и изменяемое состояние, если они есть;
- theme contract: токены, fallback-зависимости и порядок переопределения;
- правила композиции: допустимое содержимое и вложенность;
- HTMX contract: `innerHTML`/`outerHTML`, mount и cleanup;
- минимальные автоматические тесты: render, defaults, validation и DOM state;
- короткий `Manual checks` для проверки глазами и действиями.

Для компонентов с runtime отдельно проверяется отсутствие дублированных
listeners после повторного mount или HTMX swap.

## Минимальная структура

```text
repui/components/<name>/
├── manifest.py
├── README.md
├── examples.py
├── quality.py
└── tests/
    └── test_<name>.py
```

Статические файлы и Django templates размещаются по стандартным каталогам
`repui/static/` и `repui/templates/`. Если компонент имеет runtime, его API и
события описываются в `README.md` и проверяются в тестах.

## Шаблон `README.md`

```markdown
# ComponentName

## Назначение

Коротко: что делает компонент и когда его использовать.

## Public API

| Параметр | Значения | Default | Описание |
|---|---|---|---|
| `...` | `...` | `...` | `...` |

## Runtime API

Функции, события и состояние. Для stateless-компонента явно написать:
`Runtime API отсутствует`.

## Theme contract

| Token | Fallback | Назначение |
|---|---|---|
| `--rui-component-*` | `...` | `...` |

Порядок переопределения: application theme подключается после RepUI theme.

## Composition

Что можно вкладывать внутрь и в каких layout-контейнерах использовать.

## HTMX contract

Описать допустимый swap, необходимость mount и cleanup.

## Manual checks

- [ ] Основной сценарий работает мышью и клавиатурой.
- [ ] Light и dark отображаются корректно.
- [ ] Runtime-состояние применяется без reload.
- [ ] HTMX swap не создаёт дублированных listeners.
```

## `manifest.py`

Manifest — машиночитаемый паспорт компонента. Он не заменяет README, но даёт
Workbench возможность в будущем собирать каталог, assets и checklist без
ручного центрального реестра.

```python
COMPONENT = {
    "name": "component-name",
    "docs": {
        "summary": "Краткое назначение компонента.",
        "manual_checks": (
            "primary-interaction",
            "light-dark-theme",
            "htmx-no-duplicate-listeners",
        ),
    },
    "tokens": {
        "consumes": {
            "--rui-component-background": {
                "type": "color",
                "fallback": "--rui-color-surface",
            },
        },
    },
}
```

Названия checklist — стабильные machine-readable identifiers, а подробные
инструкции остаются в `README.md` или отдельном документе компонента.

## Перед commit

- обновить README, manifest и checklist;
- добавить или обновить минимальные тесты;
- проверить demo в Workbench вручную;
- выполнить тесты соответствующего компонента и `manage.py check`;
- не добавлять скрытую совместимость или fallback без описания в документации.
