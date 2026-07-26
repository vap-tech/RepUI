from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Check:
    key: str
    title: str
    description: str
    group: str = "manual"
    automated: bool = False

CHECKS = (
    Check("renders-button", "Рендерится <button>", "Без href используется нативный button.", "markup", True),
    Check("renders-link", "Рендерится <a>", "С href используется нативная ссылка.", "markup", True),
    Check("default-type", "Безопасный type=button", "Не отправляет форму случайно.", "forms", True),
    Check("submit-type", "Поддерживается type=submit", "Форма отправляется нативно.", "forms"),
    Check("disabled-button", "Disabled button", "Есть disabled и aria-disabled.", "states", True),
    Check("disabled-link", "Disabled link", "Нет href, есть aria-disabled и tabindex=-1.", "states", True),
    Check("loading", "Loading state", "aria-busy, spinner и блокировка.", "states", True),
    Check("keyboard", "Keyboard activation", "Enter/Space работают нативно.", "keyboard"),
    Check("focus-visible", "Видимый focus", "Focus ring виден с клавиатуры.", "a11y"),
    Check("contrast", "Контраст", "Варианты проходят контраст темы.", "a11y"),
    Check("zoom", "Zoom 200%", "Контент не обрезается.", "responsive"),
    Check("long-label", "Длинная подпись", "Layout остаётся рабочим.", "responsive"),
    Check("htmx-swap", "HTMX swap", "После вставки Button сразу работает.", "htmx", True),
    Check("theme-override", "Точечная тема", "Можно изменить только Button.", "theme"),
)
