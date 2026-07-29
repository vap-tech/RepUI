# Roadmap RepUI

Roadmap отражает текущее состояние проекта, а не календарные версии. Главная
цель текущего этапа — довести существующий фундамент до предсказуемого
публичного Django API.

## Уже сделано

- [x] Foundation, Theme и Layout разделены по ответственности.
- [x] Workbench работает через Django app и URL `/docs/`.
- [x] Компоненты обнаруживаются по каталогам и manifest.
- [x] Workbench-композиции загружаются через HTMX без изменения URL.
- [x] Page, AppBar, Panel и Card собраны на публичных composition primitives.
- [x] Button, Select, Listbox, Menu, Dialog, Drawer, Toast и Command Palette
      имеют рабочие Workbench-страницы.
- [x] Select использует native `<select>` как source of truth.
- [x] Select и Listbox используют общий CollectionController.
- [x] Popup-компоненты используют общий OverlayPortal с portal, flip, shift,
      scroll и resize lifecycle.
- [x] Theme поддерживает light, dark и system режимы.
- [x] Django template tags поддерживают явный контент и HTML attributes.
- [x] CI проверяет Django, JavaScript syntax, JS tests и collectstatic.
- [x] Удалены дублирующие legacy SelectOption и старые standalone-примеры.

## Текущий этап — стабилизация

- [ ] Удалить оставшиеся legacy-файлы, которые больше не используются новой
      реализацией.
- [ ] Завершить миграцию CollectionController с `activeIndex` на стабильные
      `activeId` как основной runtime API.
- [ ] Проверить сохранение `activeId` и selection после HTMX refresh.
- [ ] Стабилизировать Tabs и привести его к общему interaction-контракту.
- [ ] Проверить Dialog focus trap, restore focus и keyboard/pointer сценарии.
- [ ] Проверить Drawer modal/persistent режимы и focus lifecycle.
- [ ] Устранить оставшиеся Workbench warnings для компонентов, которые должны
      иметь полноценные страницы.
- [ ] Добавить минимальные regression tests для найденных ручных сценариев.

## Workbench

- [ ] Сохранить единый shell: Foundation, Theme, Layout, AppBar, sidebar и
      workspace.
- [ ] Подключать базовые CSS assets через публичный `{% repui_css %}` tag.
- [ ] Подключать runtime явно и идемпотентно.
- [ ] Для каждой страницы показывать только публичный контракт компонента.
- [ ] Добавить в страницы компонентов Public API, Theme contract, Composition,
      HTMX contract и Manual checks там, где они применимы.
- [ ] Отделить страницы компонентов от shell-компонентов, которые нельзя
      корректно монтировать внутрь workspace.
- [ ] Убрать устаревшие демонстрационные файлы, дублирующие Workbench.

## Django integration

- [ ] Зафиксировать публичный набор template tags и правила HTML pass-through.
- [ ] Проверить работу компонентов в Django forms и обычных POST-сценариях.
- [ ] Проверить `multiple` Select через `request.POST.getlist()`.
- [ ] Описать HTMX contract для компонентов с runtime и без runtime.
- [ ] Подготовить распространяемую структуру Django app `repui`.
- [ ] Добавить package metadata и корректное включение templates/static в
      distribution.
- [ ] Проверить установку RepUI в чистом Django-проекте.

## Следующие компоненты

Новые компоненты добавляются только после стабилизации существующих primitive
и проверки реальной потребности.

- [ ] Input / Textarea с общим form-control contract.
- [ ] Checkbox, RadioGroup и Switch на native-first основе.
- [ ] Divider, Typography и простые surface-компоненты при необходимости.
- [ ] Tabs после завершения текущей стабилизации.
- [ ] Autocomplete после проверки filtering, keyboard navigation и HTMX
      refresh.
- [ ] Table, Pagination и Accordion только под конкретные реальные сценарии.

## Public API и 1.0

- [ ] Составить список stable и experimental компонентов.
- [ ] Зафиксировать public template-tag API и defaults.
- [ ] Зафиксировать runtime API, события и lifecycle каждого интерактивного
      компонента.
- [ ] Описать theme tokens и порядок переопределения.
- [ ] Определить правила deprecation и migration.
- [ ] Убрать временные compatibility aliases после завершения миграции.
- [ ] Подготовить changelog и compatibility policy.
- [ ] Выпустить первый формальный 1.0 contract.

## Принципы разработки

- Native first: браузерная семантика остаётся у браузера.
- Explicit over implicit: RepUI не угадывает намерения и не создаёт лишний
  DOM.
- Один keyboard owner на интерактивный сценарий.
- Layout отвечает за размещение, Theme — за внешний вид, Component — за
  поведение и явную композицию.
- JS подключается явно, без скрытого auto-init.
- HTMX должен сохранять стабильные идентификаторы, focus и состояние там, где
  это предусмотрено контрактом компонента.
