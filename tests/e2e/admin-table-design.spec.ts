import { expect, test, type Locator, type Page } from "@playwright/test";
import ExcelJS from "exceljs";

async function appearance(cell: Locator) {
  return cell.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      color: style.color,
      font: style.fontFamily,
      size: style.fontSize,
      weight: style.fontWeight,
    };
  });
}

async function setMode(page: Page, mode: "Light" | "Dark") {
  await page.getByRole("button", { name: "settings", exact: true }).click();
  const drawer = page.locator(".MuiDrawer-paper").filter({ has: page.getByRole("heading", { name: "Settings", exact: true }) });
  await drawer.getByText(mode, { exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
}

test("pilot tables share typography and colors across modes and widths; editing and export work", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const accounts = [
    { id: 1, kod: "100", adi: "KASA", paraBirimi: "TRY" },
    { id: 2, kod: "102", adi: "BANKALAR", paraBirimi: "TRY" },
  ];
  const writes: unknown[] = [];
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let json: unknown = [];
    if (url.pathname.endsWith("/Auth/AdminLogin")) {
      json = { token: "table-design-test", userId: 1, yetki: "FasAdmin", claims: ["FasAdmin"], rol: ["FasAdmin"], kullaniciAdi: "Design Test", bddkmi: false };
    } else if (url.pathname.endsWith("/Mizan/GenelHesapPlani")) {
      if (request.method() === "PUT") {
        const payload = request.postDataJSON();
        writes.push(payload);
        accounts.find((account) => account.id === Number(url.searchParams.get("id")))!.adi = payload.adi;
        json = {};
      } else json = accounts;
    } else if (/DovizKurlariOtuz(Bir)?Aralik$/.test(url.pathname)) {
      json = [{ tarih: "2026-12-31T00:00:00", paraBirimiKodu: "USD", paraBirimiAdi: "ABD DOLARI", dovizAlis: 35.1234, dovizSatis: 35.5678 }];
    } else if (url.pathname.endsWith("/Audit/AdminRecentActions")) {
      json = [{ id: 1, userId: 1, userName: "Design Test", statusCode: 200, isError: false, createdAt: "2026-11-02T09:00:00Z", friendlyTitle: "Tablo testi", path: "/test", httpMethod: "GET" }];
    }
    await route.fulfill({ json });
  });
  await page.route("**/Logs/*?**", (route) => route.fulfill({ json: { success: true, logs: ["[Information] Tablo görünüm testi", "[Error] Örnek hata"] } }));
  await page.route("https://cdn.gtranslate.net/**", (route) => route.fulfill({ contentType: "application/javascript", body: "" }));
  await page.goto("/");
  await page.getByLabel("Email").fill("design@local.test");
  await page.getByLabel("Şifre").fill("test-password");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await page.waitForURL("**/Anasayfa");

  for (const mode of ["Light", "Dark", "Light"] as const) {
    await setMode(page, mode);
    await page.goto("/GenelHesapPlani");
    const grid = page.locator(".ht-wrapper.fas-admin-table");
    const hotHeader = grid.locator("thead th:visible").filter({ hasText: "Hesap Adı" }).first();
    const hotCell = grid.locator(".ht_master td").filter({ hasText: "KASA" }).first();
    await expect(hotCell).toBeVisible();
    const headerStyle = await appearance(hotHeader);
    const bodyStyle = await appearance(hotCell);
    expect(headerStyle.size).toBe("14px");
    expect(headerStyle.weight).toBe("600");
    expect(bodyStyle.size).toBe("14px");

    if (mode === "Dark") {
      await hotCell.dblclick();
      const editor = grid.locator("textarea.handsontableInput:visible");
      await expect(editor).toBeVisible();
      expect((await appearance(editor)).color).toBe(bodyStyle.color);
      await editor.fill("KASA GÜNCEL");
      await editor.press("Enter");
      await expect.poll(() => writes).toContainEqual({ adi: "KASA GÜNCEL" });
    }

    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await grid.scrollIntoViewIfNeeded();
      await expect(hotHeader).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`accounts-${mode}-${width}.png`) });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/DovizKurlari");
    await expect(page.locator(".ht-wrapper.fas-admin-table")).toHaveCount(2);
    for (const table of await page.locator(".ht-wrapper.fas-admin-table").all()) {
      const header = table.locator("thead th:visible").filter({ hasText: "Döviz Alış" }).first();
      await expect(header).toBeVisible();
      expect(await appearance(header)).toEqual(headerStyle);
      await expect(table.locator(".ht_master td").filter({ hasText: "35.1234" }).first()).toBeVisible();
    }
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Excel'e Aktar", exact: true }).first().click();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile((await (await downloadPromise).path())!);
    expect(workbook.worksheets[0].getRow(1).values).toContain("Döviz Alış");

    for (const route of ["/AuditLoglari", "/EnflasyonLoglari"]) {
      await page.goto(route);
      const header = page.locator(".MuiTableHead-root .MuiTableCell-head").first();
      await expect(header).toBeVisible();
      expect(await appearance(header)).toEqual(headerStyle);
      await page.screenshot({ path: testInfo.outputPath(`${route.slice(1)}-${mode}.png`) });
    }
  }
});
