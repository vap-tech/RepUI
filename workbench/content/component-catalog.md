# Каталог компонентов RepUI

Исходный подробный список компонентов и план развития библиотеки.

Этот Markdown-файл не рендерится напрямую в Workbench. Браузер получает
подготовленный HTML-фрагмент из `workbench/static/workbench/component-catalog.html`.

## Содержание

<!-- Подробный raw Markdown-каталог будет добавлен сюда. -->
Если говорить именно о **реальном использовании** (не полный список, а то, что чаще всего встречается в коммерческих проектах), я бы отсортировал примерно так.

## ⭐ Практически в каждом проекте

```
Button — выполнить действие
TextField — ввод текста
Select — выбор одного значения
Checkbox — логическое значение (да/нет)
RadioGroup — выбор одного варианта из нескольких
Switch — переключатель состояния
FormControl — контейнер элементов формы
FormControlLabel — подпись для Checkbox/Radio/Switch
Typography — текст и заголовки
Box — универсальный контейнер
Stack — вертикальная/горизонтальная раскладка
Grid — адаптивная сетка
Container — ограничение ширины страницы
Paper — поверхность с фоном и тенью
Card — карточка контента
Divider — разделитель
IconButton — кнопка с иконкой
Avatar — аватар пользователя
Chip — компактный элемент/тег
Tooltip — всплывающая подсказка
Dialog — модальное окно
Menu — меню действий
MenuItem — пункт меню
List — список элементов
ListItemButton — интерактивный элемент списка
Tabs — переключение разделов
Tab — вкладка
Snackbar — временное уведомление
Alert — сообщение об успехе/ошибке
CircularProgress — круговой индикатор загрузки
LinearProgress — линейный индикатор загрузки
```

---

## ⭐ Очень популярные

```
Autocomplete — ввод с поиском и выбором
Drawer — боковая панель
AppBar — верхняя панель приложения
Toolbar — панель инструментов
Breadcrumbs — навигационная цепочка
Accordion — раскрывающиеся секции
AccordionSummary — заголовок секции
AccordionDetails — содержимое секции
Table — таблица данных
Pagination — постраничная навигация
Badge — счётчик уведомлений
Skeleton — заглушка во время загрузки
Fab — плавающая кнопка действия
SpeedDial — меню быстрых действий
ImageList — галерея изображений
```

---

## ⭐ Используются регулярно

```
Popover — произвольное всплывающее окно
Popper — позиционируемый popup
Modal — базовое модальное окно
ClickAwayListener — закрытие по клику снаружи
Collapse — анимация сворачивания
Fade — плавное появление
Grow — анимация увеличения
Slide — анимация выезда
Zoom — анимация масштабирования
Rating — рейтинг звёздами
Slider — выбор диапазона
ToggleButton — переключаемая кнопка
ToggleButtonGroup — группа переключателей
StepWizard (Stepper) — пошаговый мастер
Timeline — временная шкала
TreeView — древовидный список
Masonry — плиточная раскладка
ImageListItem — элемент галереи
```

---

## ⭐ Специализированные

```
TransferList — перенос элементов между списками
BottomNavigation — нижняя мобильная навигация
BottomNavigationAction — пункт нижней навигации
MobileStepper — мобильный пошаговый индикатор
TablePagination — пагинация таблицы
TableSortLabel — сортировка колонок
TableContainer — контейнер таблицы
TableHead — заголовок таблицы
TableBody — тело таблицы
TableRow — строка таблицы
TableCell — ячейка таблицы
CardHeader — заголовок карточки
CardContent — содержимое карточки
CardActions — область действий карточки
CardMedia — изображение карточки
ListItemIcon — иконка элемента списка
ListItemText — текст элемента списка
ListSubheader — заголовок группы списка
MenuList — контейнер меню
```

---

## ⭐ Редко используются напрямую

```
ImageListItemBar — подпись изображения
AvatarGroup — группа аватаров
NoSsr — отключение SSR
CssBaseline — глобальный reset
ScopedCssBaseline — локальный reset
Portal — рендер в другое место DOM
Backdrop — затемнение фона
PaginationItem — отдельная кнопка пагинации
TabScrollButton — кнопка прокрутки вкладок
TableFooter — подвал таблицы
TableContainer — контейнер таблицы
```

---

## Я бы строил библиотеку для Django именно в таком порядке

### Этап 1 (закроет ~80% интерфейсов)

```
Button
TextField
Select
Checkbox
RadioGroup
Switch
Typography
Stack
Grid
Container
Card
Paper
Divider
List
ListItemButton
Menu
Dialog
Tooltip
Tabs
Snackbar
Alert
Avatar
Chip
CircularProgress
LinearProgress
```

---

### Этап 2

```
Autocomplete
Drawer
Accordion
Breadcrumbs
Table
Pagination
Skeleton
Badge
Fab
Rating
Slider
ToggleButton
```

---

### Этап 3

```
Tree
Timeline
Popover
Popper
Collapse
SpeedDial
Stepper
ImageList
```

---

### Этап 4 (по мере необходимости)

```
TransferList
BottomNavigation
Masonry
Timeline
MobileStepper
```

---

### Что я бы вообще не делал

Некоторые вещи в библиотеке лучше сделать **не как отдельные компоненты**, а как инфраструктуру:

```
Portal            → OverlayPortal
Popper            → Overlay
ClickAwayListener → встроить в Overlay
Modal             → база для Dialog и Drawer
Paper             → Sheet
Box               → можно заменить обычным <div> с utility-классами
FormControl       → часть системы форм
```

Если ориентироваться на реальные корпоративные приложения (CRM, ERP, админки, кабинеты, внутренние сервисы), то **первые два этапа покроют примерно 90–95% всех экранов**. Остальные компоненты появляются заметно реже или являются специализированными вариантами уже существующих.
