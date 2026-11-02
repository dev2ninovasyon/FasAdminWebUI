import { expect, test } from "@playwright/test";

test("admin header translates page content and returns to Turkish", async ({ page }) => {
  // Isolate the UI from application APIs and the external translation service.
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    await route.fulfill({
      json: path.endsWith("/Auth/AdminLogin")
        ? {
            token: "language-test-token",
            userId: 1,
            yetki: "FasAdmin",
            claims: ["FasAdmin"],
            rol: ["FasAdmin"],
            kullaniciAdi: "Language Test",
            bddkmi: false,
          }
        : [],
    });
  });
  await page.route("https://cdn.gtranslate.net/widgets/latest/globe.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
        const widget = document.querySelector(window.gtranslateSettings.wrapper_selector);
        for (const language of ['tr', 'en', 'fr']) {
          const link = document.createElement('a');
          link.href = '#';
          link.dataset.gtLang = language;
          link.textContent = language;
          widget.appendChild(link);
        }
      `,
    }),
  );
  await page.route("https://cdn.gtranslate.net/widgets/latest/lib.min.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
        window.__GT = { translator: {
          libReady: true, finished: false, error: false,
          translate(source, target) {
            this.finished = false;
            setTimeout(() => {
              const heading = document.querySelector('h5');
              heading.textContent = { tr: 'Sistem Menüleri', en: 'System Menus', fr: 'Menus système' }[target];
              document.documentElement.lang = target;
              this.finished = true;
            }, 50);
            return true;
          }
        }};
      `,
    }),
  );

  await page.goto("/");
  await page.getByLabel("Email").fill("language@local.test");
  await page.getByLabel("Şifre").fill("test-password");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await page.waitForURL("**/Anasayfa");
  // Navigate through the actual application shell so its active header is tested.
  await page.getByRole("button", { name: "Belge Yönetimi", exact: true }).click();
  await page.getByRole("link", { name: "Menü Kullanım Bilgileri", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sistem Menüleri" })).toBeVisible();

  for (const [language, heading] of [
    ["en", "System Menus"],
    ["fr", "Menus système"],
    ["tr", "Sistem Menüleri"],
  ]) {
    await page.locator(`#fas-language-widget a[data-gt-lang="${language}"]`).click();
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.locator("#fas-language-snapshot")).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(page.locator(`#fas-language-widget a[data-gt-lang="${language}"]`)).toHaveClass(/gt-current-lang/);
  }
});
