from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Check:
    key: str
    title: str
    description: str
    group: str = "manual"
    automated: bool = False


CHECKS = (
    Check("native-source", "Native source", "Настоящий select хранит значение.", "forms", True),
    Check("single-submit", "Single submit", "request.POST получает строку.", "forms"),
    Check("multiple-submit", "Multiple submit", "request.POST.getlist получает список.", "forms"),
    Check("input-change", "Native events", "Выбор отправляет input и change.", "events"),
    Check("rui-change", "RepUI event", "Выбор отправляет rui:change.", "events"),
    Check("keyboard-open", "Keyboard open", "Enter, Space и стрелки открывают popup.", "keyboard"),
    Check("keyboard-nav", "Keyboard navigation", "Arrow, Home и End меняют active.", "keyboard"),
    Check("keyboard-close", "Keyboard close", "Escape и Tab закрывают popup.", "keyboard"),
    Check("typeahead", "Typeahead", "Печатный поиск находит option.", "keyboard"),
    Check("disabled", "Disabled", "Select и disabled option недоступны.", "states"),
    Check("readonly", "Readonly", "Открытие и изменение запрещены.", "states"),
    Check("multiple-toggle", "Multiple toggle", "Enter/Space переключают option.", "multiple"),
    Check("multiple-stays-open", "Multiple stays open", "Popup остаётся открыт.", "multiple"),
    Check("aria", "ARIA", "Combobox/listbox/option согласованы.", "a11y"),
    Check("mount-idempotent", "Idempotent mount", "Повторный mount не создаёт listeners.", "runtime"),
    Check("refresh", "Refresh", "Новые option появляются после refresh.", "runtime"),
    Check("destroy", "Destroy", "Native select полностью восстанавливается.", "runtime"),
    Check("htmx", "HTMX", "Новый fragment монтируется отдельно.", "htmx"),
    Check("light-dark", "Theme", "Light и dark читаются.", "theme"),
)
