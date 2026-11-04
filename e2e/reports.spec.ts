import { expect, test, type Page } from "@playwright/test";

async function openReport(page: Page) {
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await page.getByRole("button", { name: /^Account menu:/ }).click();
  await page.getByRole("button", { name: "Report a problem", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Report a problem" });
  await expect(dialog).toBeVisible();
  return dialog;
}
test.beforeEach(async ({ page, baseURL }) => {
  await page
    .context()
    .addCookies([{ name: "volontyorlar_locale", value: "en", url: baseURL! }]);
  await page.goto("/api/auth/telegram/start?locale=en");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/profile/edit?private=never-attach#private");
  await expect(page.locator("html")).toHaveAttribute("data-app-hydrated", "true");
});
test("reports from the current page and restores keyboard focus on close", async ({
  page,
}) => {
  const dialog = await openReport(page);
  await expect(dialog).toContainText("Page attached automatically: /profile/edit");
  await expect(dialog).not.toContainText("never-attach");
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Describe the problem");
  await dialog.getByLabel("What went wrong?").fill("The save button does not finish.");
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByText("Report sent. Thank you for letting us know."),
  ).toBeVisible();
  const trigger =
    (page.viewportSize()?.width ?? 1280) < 1024
      ? page.getByRole("button", { name: /^Account menu:/ })
      : page.getByRole("button", { name: "Report a problem", exact: true });
  await expect(trigger).toBeFocused();
});
test("keeps the problem and submission identity when a send needs retrying", async ({
  page,
}) => {
  const dialog = await openReport(page);
  const submissionId = await dialog.locator("input[name=submissionId]").inputValue();
  const message = "__fail_once__ The profile did not save.";
  await dialog.getByLabel("What went wrong?").fill(message);
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Your text is still here");
  await expect(dialog.getByLabel("What went wrong?")).toHaveValue(message);
  await expect(dialog.locator("input[name=submissionId]")).toHaveValue(submissionId);
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog).not.toBeVisible();
});
test("keeps the form usable with reduced motion and without horizontal overflow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const dialog = await openReport(page);
  await expect(dialog.getByLabel("What went wrong?")).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
