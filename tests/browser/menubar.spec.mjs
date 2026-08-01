import { expect, test } from "@playwright/test";

test("Menubar moves between sections and opens the focused menu", async ({
  page,
}) => {
  await page.goto("/docs/component/menubar/");
  await page.evaluate(() => window.__repuiRuntimeReady);

  const file = page.getByRole("button", { name: "Файл" });
  const view = page.getByRole("button", { name: "Вид" });

  await file.focus();
  await page.keyboard.press("ArrowRight");
  await expect(view).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await expect(view).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("menuitem", { name: "Светлая тема" }))
    .toBeFocused();

  await page.keyboard.press("Escape");
  await expect(view).toHaveAttribute("aria-expanded", "false");
  await expect(view).toBeFocused();
});

test("Menubar keeps the section open after pointer hover and click", async ({
  page,
}) => {
  await page.goto("/docs/component/menubar/");
  await page.evaluate(() => window.__repuiRuntimeReady);

  await page.getByRole("button", { name: "Файл" }).click();
  const view = page.getByRole("button", { name: "Вид" });

  await view.hover();
  await view.click();

  await expect(view).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("menuitem", { name: "Светлая тема" }))
    .toBeVisible();
});
