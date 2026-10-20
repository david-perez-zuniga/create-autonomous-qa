import { test, expect } from "@playwright/test";

test.skip(
  !process.env.BASE_URL,
  "Set BASE_URL to run this example against a real application"
);

test("example: page has a title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});
