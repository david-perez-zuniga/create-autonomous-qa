import { test, expect } from "@playwright/test";

test("example: page has a title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});
