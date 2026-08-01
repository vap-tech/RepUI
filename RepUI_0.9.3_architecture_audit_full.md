Проверил архив архитектурно и по коду. В целом направление у библиотеки **хорошее**: проблема сейчас не в фундаменте, а в необходимости закрепить уже выбранные контракты runtime и template tags.

Полный отчёт сохранил отдельно:

[Скачать архитектурный аудит RepUI 0.9.3](sandbox:/mnt/data/RepUI_0.9.3_architecture_audit.md)

## Общий вывод

У RepUI уже есть сильное ядро:

* компоненты собраны вертикальными срезами: tag, template, CSS, JS, manifest, tests;
* `interaction/` отделён от конкретных компонентов;
* используются `WeakMap` и идемпотентный `mount`;
* `Select` сохраняет нативный `<select>` источником истины;
* theme contract отделён от component CSS;
* Workbench умеет discovery и проверку композиций;
* есть не только render-тесты, но и quality/source contract checks.

Я бы не переписывал библиотеку. Нужна **консолидация контрактов** и удаление переходного слоя.

# Самые важные проблемы

# SOLID

## SRP — Single Responsibility

Хорошо разделены:

* `OverlayPortal`;
* `DismissLayer`;
* `CollectionController`;
* `RovingGroup`.

Но `SelectRuntime` сейчас отвечает сразу за:

* создание DOM;
* синхронизацию native select;
* collection;
* keyboard;
* typeahead;
* overlay;
* sizing;
* custom events;
* lifecycle.

Это уже много, но я бы **не дробил его прямо сейчас на десяток классов**. Лучше сначала выделить только действительно повторяемые части:

```text
PopupController
NativeSelectAdapter / OptionSource
```

Причём только когда появится второй стабильный потребитель.

## OCP — Open/Closed

Runtime bootstrap изолирует регистрацию component adapters от Workbench-страниц.

## LSP — Liskov Substitution

Классической иерархии почти нет, и это хорошо.

Но есть неявное ожидание, что runtime имеет общий lifecycle, хотя фактически методы различаются.

Стоит закрепить только минимальный интерфейс:

```js
{
  element,
  refresh(),
  destroy()
}
```

`open`, `close`, `value` и прочее остаются компонент-специфичными.

## ISP — Interface Segregation

Interaction primitives небольшие и хорошие.

## DIP — Dependency Inversion

Хорошо:

```text
Select → CollectionController
Tooltip → OverlayPortal
Menu → RovingGroup
```

Плохо:

```text
Component manifest → default theme
```


# Template tags — следующий источник будущей боли

Почти каждый `tags.py` заново реализует:

* разбор `name=value`;
* `compile_filter`;
* resolve;
* проверку неизвестных аргументов;
* преобразование bool;
* aliases HTML-атрибутов;
* вызов `render_to_string`.

Из-за этого уже появились расхождения.

Например `Choice` использует строгий `_as_bool`, а `Button`, `Checkbox` и `Select` делают:

```python
bool(value)
```

То есть:

```django
{% button disabled="false" %}
```

получит truthy-строку и станет disabled.

Нужен маленький внутренний toolkit:

```python
compile_keyword_arguments()
resolve_arguments()
reject_unknown()
resolve_bool()
extract_html_attrs()
```

Важно: **не строить универсальный компонентный фреймворк**. Пять небольших функций дадут большую часть пользы без магии.

# Уже применённые хорошие паттерны

У тебя уже есть, пусть и не всегда формально названные:

* **Vertical Slice** — компонент как самостоятельный пакет;
* **Registry** — manifests и discovery;
* **Adapter** — кастомный Select поверх native select;
* **Controller** — collection и roving;
* **Portal**;
* **Observer/Event-driven architecture**;
* **Identity Map** через `WeakMap`;
* **State holder** — `CardRenderState`;
* **Fallback contract** для тем;
* **Idempotent mount**.

Это хороший набор. Я бы не добавлял DI-контейнер, Abstract Factory на каждый тег или глубокую иерархию базовых классов.

# Отдельные технические замечания

# Тесты

JS-тесты удалось запустить:

```text
7 passed
```

Проверены:

* disabled navigation;
* looping;
* сохранение active ID;
* selected state;
* typeahead;
* Listbox lifecycle contract.

Главный недостающий уровень — browser interaction tests. Source-contract тест не подтверждает реальное поведение focus, portal и HTMX.

Минимальный Playwright-набор:

```text
```

# Рекомендуемый порядок работ

## Этап 1. Очистить source archive

* очистить архив от generated files;
* добавить проверки запрещённых legacy imports.

## Этап 2. Унифицировать template tags

Продолжить перенос оставшихся block tags на общие parsing helpers и закрепить единые aliases/errors.

## Этап 3. Release engineering

* CI matrix Python/Django;
* browser tests;
* visual baseline для Core, Mineral и Ocean.

# Главное правило на будущее

Я бы записал его прямо в CONTRIBUTING:

> Новый компонент не добавляет собственную инфраструктуру, пока существующий interaction primitive или композиция компонентов могут решить задачу.

И ещё девять коротких правил:

1. Один компонент — один canonical JS entrypoint.
2. Manifest не знает имён конкретных тем.
3. Runtime имеет `refresh()` и `destroy()`.
4. Компонент не слушает HTMX глобально самостоятельно.
5. Native HTML остаётся источником истины, где возможно.
6. Theme override меняет токены, а не layout.
7. Новый primitive появляется после второго реального потребителя.
8. Workbench не содержит уникальную production-логику.
9. Любой timer, observer и document listener освобождается в `destroy()`.

**Итог:** библиотека пока не пахнет «безнадёжным legacy». Наоборот, новая архитектура уже довольно зрелая. Опасность сейчас — оставить рядом несколько конкурирующих контрактов и продолжать наращивать компоненты. Если сначала завершить консолидацию manifest/runtime/tags, RepUI останется поддерживаемой даже при заметном росте каталога.
