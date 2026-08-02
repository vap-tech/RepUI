import { expect, test } from "@playwright/test";

test("installRuntime is singleton per root and can be reinstalled after destroy", async ({ page }) => {
  await page.goto("/docs/");

  const result = await page.evaluate(async () => {
    const { installRuntime } = await import(
      "/static/repui/runtime/bootstrap.js"
    );
    const root = document.createElement("section");
    document.body.append(root);

    const first = installRuntime(root);
    const second = installRuntime(root);
    first.destroy();
    const replacement = installRuntime(root);
    replacement.destroy();
    root.remove();

    return {
      reused: first === second,
      replaced: first !== replacement,
    };
  });

  expect(result).toEqual({ reused: true, replaced: true });
});
