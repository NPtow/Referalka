import { expect, test } from "@playwright/test";

function randomValue(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

test("candidate submit and referrer intro flow works end-to-end", async ({ page }) => {
  const companyName = randomValue("QA Bank");
  const candidateEmail = `${randomValue("candidate")}@example.com`;
  const referrerEmail = `${randomValue("referrer")}@example.com`;
  const password = "SuperTest123";

  await page.goto("/sign-up");
  await page.getByPlaceholder("Никита").fill("Candidate User");
  await page.getByPlaceholder("you@example.com").fill(candidateEmail);
  await page.getByPlaceholder("Минимум 8 символов").fill(password);
  await page.getByPlaceholder("Повтори пароль").fill(password);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();

  await expect(page).toHaveURL(/\/profile/);
  await page.getByRole("button", { name: "Product Manager" }).click();
  await page.locator('input[type="number"]').fill("4");
  await page.getByPlaceholder("Поиск компании или добавление своей").fill(companyName);
  await page.getByRole("button", { name: `Добавить "${companyName}"` }).click();
  await page.getByPlaceholder("Вставь текст резюме").fill("Тестовое резюме кандидата");
  await page.getByPlaceholder("Коротко о себе").fill("Кандидат для e2e");
  await page.getByRole("button", { name: "Подать заявку" }).click();
  await expect(page.getByText("Добавь ссылку на вакансию для каждой выбранной компании.")).toBeVisible();
  await page.getByPlaceholder("https://...").first().fill("https://example.com/vacancy");
  await page.getByRole("button", { name: "Подать заявку" }).click();

  await expect(page.getByText("Заявка подана")).toBeVisible();
  await page.getByRole("button", { name: "Выйти" }).click();
  await page.waitForURL("**/");

  await page.goto("/sign-up");
  await page.getByPlaceholder("Никита").fill("Referrer User");
  await page.getByPlaceholder("you@example.com").fill(referrerEmail);
  await page.getByPlaceholder("Минимум 8 символов").fill(password);
  await page.getByPlaceholder("Повтори пароль").fill(password);
  await page.getByRole("button", { name: "Создать аккаунт" }).click();

  await expect(page).toHaveURL(/\/profile/);
  await page.getByRole("button", { name: "Реферал" }).click();
  await page.getByPlaceholder("Например: Яндекс, VK, любая своя компания").fill(companyName);
  await page.getByRole("button", { name: `Добавить "${companyName}"` }).click();
  await page.getByRole("button", { name: "Product Manager" }).click();
  await page.getByRole("button", { name: "Сохранить профиль реферала" }).click();

  await expect(page.getByText("Профиль реферала сохранен")).toBeVisible();
  await page.getByRole("link", { name: "Посмотреть людей, которых ты можешь зарефералить →" }).click();

  await expect(page).toHaveURL(/\/referrer\/candidates/);
  await expect(page.getByText("Candidate User")).toBeVisible();
  await expect(page.getByRole("link", { name: `Вакансия в ${companyName}` })).toBeVisible();
  await page.getByRole("button", { name: `Связаться по ${companyName}` }).click();

  await expect(page.getByText(`Создали мэтч по ${companyName}.`)).toBeVisible();
  await expect(page.getByText(`Ждём оплату и ручной апрув: ${companyName}`)).toBeVisible();
  await expect(page.getByRole("button", { name: `Связаться по ${companyName}` })).toHaveCount(0);
});
