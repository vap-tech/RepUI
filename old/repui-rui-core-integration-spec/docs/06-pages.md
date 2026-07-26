# 6. GitHub Pages demo

## 6.1. Основная demo

Публиковать из RepUI:

```text
https://vap-tech.github.io/RepUI/
```

Там находятся дизайн, CSS, HTML contracts и полный набор компонентов.

Отдельный low-level playground core допустим:

```text
https://vap-tech.github.io/rui-core/
```

README RepUI ведёт на RepUI demo.

## 6.2. Страницы

```text
/
├── index.html
├── components/
│   ├── combobox.html
│   ├── select.html
│   ├── dialog.html
│   ├── menu.html
│   └── ...
├── stress/
│   ├── mixed-input.html
│   ├── htmx-swap.html
│   ├── nested-overlays.html
│   └── many-components.html
└── assets/
```

Каждый пример показывает:

- default;
- disabled;
- error;
- keyboard hints;
- RTL/reduced motion при поддержке;
- HTML snippet;
- RepUI/core versions.

## 6.3. Demo = E2E fixtures

Playwright тестирует те же страницы, что публикуются. Demo не загружает core с CDN — использует committed bundle RepUI.

## 6.4. Pages workflow

```text
checkout
build demo
test smoke
configure-pages
upload-pages-artifact
deploy-pages
```

Permissions:

```yaml
contents: read
pages: write
id-token: write
```

## 6.5. Project base path

Все пути должны работать под `/RepUI/`.

Избегать абсолютных `/assets/...`; использовать относительные URL или build base.

## 6.6. PR preview

На старте:

- build demo;
- Playwright;
- HTML report/screenshots как Actions artifact;
- production Pages только после merge main.

## 6.7. README

Добавить live demo link и badges CI/browser/Pages/release.

В footer demo:

```text
RepUI 0.8.3.0
rui-core 0.2.0
commit abcdef12
```

Опционально «Copy diagnostics».

## 6.8. Accessibility shell

- skip link;
- корректные headings/landmarks;
- visible focus;
- no duplicate IDs;
- docs shell не ломает focus trap;
- iframe использовать только с обоснованием.
