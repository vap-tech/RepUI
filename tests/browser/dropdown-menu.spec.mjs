import { expect, test } from "@playwright/test";

test.describe("DropdownMenu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/component/dropdown_menu/");
    await page.evaluate(() => window.__repuiRuntimeReady);
  });

  test("opens, moves focus, and closes predictably", async ({ page }) => {
    const trigger = page.getByLabel("Действия чата");
    const menu = page.locator("#chat-menu-42");

    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Поделиться" }))
      .toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: "Переименовать" }))
      .toBeFocused();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes on a click outside its overlay", async ({ page }) => {
    const trigger = page.getByLabel("Действия чата");
    const menu = page.locator("#chat-menu-42");

    await trigger.click();
    await expect(menu).toBeVisible();

    await page.getByRole("heading", {
      name: "DropdownMenu",
      exact: true,
    }).click();
    await expect(menu).toBeHidden();
  });
});
