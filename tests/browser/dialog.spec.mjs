import { expect, test } from "@playwright/test";

test("Dialog moves focus inside and restores it after Escape", async ({ page }) => {
  await page.goto("/docs/component/dialog/");

  const trigger = page.getByRole("button", { name: "Открыть Dialog" });
  const dialog = page.getByRole("dialog", { name: "Демонстрационный Dialog" });
  const close = dialog.getByRole("button", { name: "Закрыть" });

  await page.evaluate(() => window.__repuiRuntimeReady);
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
