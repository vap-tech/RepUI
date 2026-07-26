# RepUI × rui-core — ТЗ на интеграцию, тестирование и доставку

Архив рассчитан на отдельный GitHub-репозиторий с проектной документацией.

## Целевая схема

```text
vap-tech/rui-core
├── TypeScript source
├── controllers и DOM adapters
├── unit/DOM/browser/a11y tests
├── browser bundle
├── low-level playground
└── release workflow

vap-tech/RepUI
├── CSS, HTML и Django templates
├── RepUI DOM adapters
├── документация и публичная demo
├── integration/E2E tests
└── только готовый bundle rui-core
```

В RepUI не копируются исходники core. Хранится только generated-файл:

```text
js/vendor/rui-core.min.js
```

С обязательным banner:

```js
/*! GENERATED — rui-core v0.2.0 | commit abcdef12 | MIT */
```

## Рекомендуемая автоматизация

```text
release rui-core
  → repository_dispatch в RepUI
  → RepUI checkout точного тега core
  → повторная сборка bundle
  → интеграционные тесты
  → автоматический Pull Request
  → merge
  → GitHub Pages demo
```

PR-модель безопаснее прямого push: RepUI самостоятельно проверяет и принимает артефакт.

## Документы

- `docs/01-architecture.md` — границы двух репозиториев.
- `docs/02-integration.md` — общее ТЗ.
- `docs/03-components.md` — ТЗ по компонентам.
- `docs/04-testing.md` — автоматические тесты.
- `docs/05-delivery.md` — релизы и доставка bundle.
- `docs/06-pages.md` — GitHub Pages demo.
- `docs/07-roadmap.md` — этапы и Definition of Done.
- `docs/08-security.md` — токены и supply-chain.
- `github-actions/` — workflow-заготовки.
- `templates/` — шаблоны component contract и update PR.

Конечный Django-пользователь не должен запускать Node/npm:

```html
<link rel="stylesheet" href="{% static 'repui/repui.css' %}">
<script src="{% static 'repui/repui.js' %}" defer></script>
```
