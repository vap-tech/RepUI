import { expect, test } from "@playwright/test";

const themes = [
  ["core", "default"],
  ["mineral", "mineral"],
  ["ocean-deep", "ocean-deep"],
];

test.describe("Workbench visual baseline", () => {
  for (const [snapshotName, theme] of themes) {
    test(`${snapshotName} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto("/docs/component/alert/");
      await page.evaluate(() => window.__repuiRuntimeReady);
      await page.evaluate(async (value) => {
        const themeModule = await import("/static/repui/theme/default/theme.js");
        themeModule.setTheme(value, { persist: false });
      }, theme);
      await page.evaluate(() => document.fonts?.ready);

      await expect(page.locator(".rui-page__body")).toHaveScreenshot(
        `${snapshotName}.png`,
        {
          animations: "disabled",
          caret: "hide",
          scale: "css",
          maxDiffPixelRatio: 0.05,
        },
      );
    });
  }
});
