import { expect, test } from "@playwright/test";

const paths = ["/", "/sign-in", "/profile", "/dashboard", "/referrer/candidates"];

for (const pathname of paths) {
  test(`preview smoke: ${pathname} responds without 5xx`, async ({ request }) => {
    const response = await request.get(pathname, {
      failOnStatusCode: false,
      maxRedirects: 10,
    });

    expect(response.status()).toBeLessThan(500);
  });
}

test("preview smoke: homepage renders a title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Рефералка/i);
});
