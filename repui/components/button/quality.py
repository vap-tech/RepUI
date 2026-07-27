from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Check:
    key: str
    title: str
    description: str
    group: str = "manual"
    automated: bool = False


CHECKS = (
    Check(
        "renders-button",
        "Рендерится <button>",
        "Без href используется нативный button.",
        "markup",
        True,
    ),
    Check(
        "renders-link",
        "Рендерится <a>",
        "С href используется нативная ссылка.",
        "markup",
        True,
    ),
    Check(
        "default-type",
        "Безопасный type=button",
        "Не отправляет форму случайно.",
        "forms",
        True,
    ),
    Check(
        "submit-type",
        "Поддерживается type=submit",
        "Форма отправляется нативно.",
        "forms",
    ),
    Check(
        "disabled-button",
        "Disabled button",
        "Есть disabled и aria-disabled.",
        "states",
        True,
    ),
    Check(
        "disabled-link",
        "Disabled link",
        "Нет href, есть aria-disabled и tabindex=-1.",
        "states",
        True,
    ),
    Check(
        "loading",
        "Loading state",
        "aria-busy, spinner и блокировка.",
        "states",
        True,
    ),
    Check(
        "keyboard",
        "Keyboard activation",
        "Enter и Space работают нативно без runtime.",
        "keyboard",
    ),
    Check(
        "focus-visible",
        "Видимый focus",
        "Focus ring виден с клавиатуры.",
        "a11y",
    ),
    Check(
        "runtime-optional",
        "Runtime необязателен",
        "Button полностью работает без button.js.",
        "runtime",
        True,
    ),
    Check(
        "runtime-idempotent",
        "Идемпотентный mount",
        "Повторный mount возвращает существующий handle.",
        "runtime",
    ),
    Check(
        "runtime-no-listeners",
        "Runtime не эмулирует семантику",
        "button.js не добавляет click/keyboard listeners.",
        "runtime",
    ),
    Check(
        "runtime-contract",
        "Общий lifecycle",
        "Handle содержит element, refresh() и destroy().",
        "runtime",
    ),
    Check(
        "htmx-swap",
        "HTMX swap",
        "После вставки Button сразу работает без mount.",
        "htmx",
        True,
    ),
    Check(
        "htmx-runtime",
        "HTMX optional mount",
        "При необходимости mountButtons вызывается для нового root.",
        "htmx",
    ),
    Check(
        "theme-override",
        "Точечная тема",
        "Можно изменить только Button.",
        "theme",
    ),
)
