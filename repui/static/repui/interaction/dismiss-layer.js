export function createDismissLayer({
  anchor = null,
  overlay,
  onDismiss,
  escape = true,
  outsidePointer = true,
  focusOutside = false,
} = {}) {
  if (!(overlay instanceof HTMLElement)) {
    throw new TypeError("createDismissLayer requires an overlay HTMLElement");
  }

  const abort = new AbortController();
  const { signal } = abort;
  const inside = (event) => {
    const path = event.composedPath();
    return (anchor && path.includes(anchor)) || path.includes(overlay);
  };

  if (outsidePointer) {
    document.addEventListener("pointerdown", (event) => {
      if (!inside(event)) onDismiss?.({ reason: "outside-pointer", originalEvent: event });
    }, { signal, capture: true });
  }
  if (escape) {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") onDismiss?.({ reason: "escape", originalEvent: event });
    }, { signal, capture: true });
  }
  if (focusOutside) {
    document.addEventListener("focusin", (event) => {
      if (!inside(event)) onDismiss?.({ reason: "focus-outside", originalEvent: event });
    }, { signal, capture: true });
  }
  return { destroy() { abort.abort(); } };
}
