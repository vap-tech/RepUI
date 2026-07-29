# Stack

`Stack` — Layout primitive для вертикальной композиции элементов.

Тег остаётся частью `{% load repui_layout %}`. Этот каталог содержит паспорт и
Workbench-композицию компонента.

Основные параметры: `spacing="none|xs|sm|md|lg"`, `rows`,
`row_size="fill|content"`, `row`, `id`, `class_name` и `attrs`.

Без `rows` Stack использует естественные строки по содержимому. `rows=N` нужен,
когда родитель выделил конечную высоту и её нужно разделить явно.
