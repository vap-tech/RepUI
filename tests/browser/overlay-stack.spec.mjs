import { expect, test } from "@playwright/test";

test("Overlay Stack dismisses only the most recently activated overlay", async ({ page }) => {
  await page.goto("/docs/");

  const closed = await page.evaluate(async () => {
    const { createOverlayStackEntry } = await import(
      "/static/repui/interaction/overlay-stack.js"
    );
    const lower = document.createElement("div");
    const upper = document.createElement("div");
    document.body.append(lower, upper);

    const calls = [];
    const lowerEntry = createOverlayStackEntry({
      element: lower,
      onEscape: () => calls.push("lower"),
    });
    const upperEntry = createOverlayStackEntry({
      element: upper,
      onEscape: () => calls.push("upper"),
    });

    lowerEntry.activate();
    upperEntry.activate();
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
    }));
    upperEntry.deactivate();
    document.dispatchEvent(new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
    }));

    lowerEntry.destroy();
    upperEntry.destroy();
    lower.remove();
    upper.remove();
    return calls;
  });

  expect(closed).toEqual(["upper", "lower"]);
});
