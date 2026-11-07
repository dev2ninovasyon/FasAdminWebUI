import { expect, test } from "@playwright/test";

test("KGK taraması sürüm seçimi olmadan başlar ve dosya hatasını gösterir", async ({ page }) => {
  let taramaIstegi: Record<string, unknown> | null = null;
  let uretimSayisi = 0;

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = (body: unknown, status = 200) => route.fulfill({
      status,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify(body),
    });

    if (path.endsWith("/Auth/AdminLogin")) return json({
      token: "e2e-access-token",
      refreshToken: "e2e-refresh-token",
      userId: 1,
      denetciId: 1,
      denetciFirmaAdi: "E2E Denetim",
      yetki: "FasAdmin",
      rol: ["FasAdmin"],
      claims: ["FasAdmin"],
      kullaniciAdi: "E2E Admin",
      unvan: "FasAdmin",
      bddkmi: false,
      kurulumTamamlandi: true,
      kurulumAdimi: 0,
      setupWizardProgress: "{}",
      turTamamlandi: true,
    });
    if (path.endsWith("/FinansalTabloYonetimi/TanimSetleri")) return json([]);
    if (path.endsWith("/FinansalTabloYonetimi/SurumYonetimi/Durum")) return json({ etkin: true, mevcutRaporlarKorunuyor: true });
    if (path.endsWith("/FinansalTabloYonetimi/Kgk/TaramaGecmisi")) return json([]);
    if (path.endsWith("/FinansalTabloYonetimi/Kgk/KaynakDonemleri")) return json([{
      kod: "KGK_2023_VE_SONRASI",
      ad: "31.12.2023 ve sonrası",
      kaynakUrl: "https://kgk.gov.tr/DynamicContentDetail/11690/Elektronik-Finansal-Raporlama",
      onerilenMi: true,
    }]);
    if (path.endsWith("/FinansalTabloYonetimi/Kgk/TaraVeArsivle")) {
      taramaIstegi = request.postDataJSON() as Record<string, unknown>;
      return json({ detail: "KGK taraması durduruldu: FDT.xlsm indirilemedi. HTTP 404. Hiçbir tarama sonucu başarılı olarak kaydedilmedi." }, 502);
    }
    if (path.endsWith("/FinansalTabloYonetimi/Uretimler") && request.method() === "POST") uretimSayisi++;
    return json(request.method() === "GET" ? [] : {});
  });

  await page.goto("/");
  await page.getByLabel("Email").fill("e2e@local.test");
  await page.getByLabel("Şifre").fill("E2E-only-password");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await page.waitForURL("**/Anasayfa");

  await page.goto("/FinansalTabloYonetimi/KgkGuncellemeleri");
  const dugme = page.getByRole("button", { name: "KGK güncellemesini otomatik kontrol et" });
  await expect(dugme).toBeEnabled();
  await dugme.click();

  await expect.poll(() => taramaIstegi).not.toBeNull();
  expect(taramaIstegi).toMatchObject({ kaynakDonemKodu: "KGK_2023_VE_SONRASI", arsivle: true });
  await expect(page.getByText("KGK taraması durduruldu: FDT.xlsm indirilemedi.", { exact: false })).toBeVisible();
  await expect(page.getByText("Üretim için yayımlanmış sürüm", { exact: false })).toHaveCount(0);
  expect(uretimSayisi).toBe(0);
});

test("başarılı tarama KGK ana sürümünü ve bağlı taslakları gösterir", async ({ page }) => {
  let tarandi = false;
  let devrede = false;
  let topluIstegi: Record<string, unknown> | null = null;
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = (body: unknown) => route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify(body),
    });
    if (path.endsWith("/Auth/AdminLogin")) return json({
      token: "e2e-access-token",
      refreshToken: "e2e-refresh-token",
      userId: 1,
      denetciId: 1,
      yetki: "FasAdmin",
      rol: ["FasAdmin"],
      claims: ["FasAdmin"],
      kullaniciAdi: "E2E Admin",
      unvan: "FasAdmin",
      bddkmi: false,
      kurulumTamamlandi: true,
      kurulumAdimi: 0,
      setupWizardProgress: "{}",
      turTamamlandi: true,
    });
    if (path.endsWith("/FinansalTabloYonetimi/TanimSetleri")) return json([]);
    if (path.endsWith("/FinansalTabloYonetimi/SurumYonetimi/Durum")) return json({ etkin: true, mevcutRaporlarKorunuyor: true });
    if (path.endsWith("/FinansalTabloYonetimi/Kgk/KaynakDonemleri")) return json([{
      kod: "KGK_2023_VE_SONRASI",
      ad: "31.12.2023 ve sonrası",
      onerilenMi: true,
    }]);
    if (path.endsWith("/FinansalTabloYonetimi/Kgk/AnaSurumler")) return json(tarandi ? [{
      id: 7,
      kaynakDonemKodu: "KGK_2023_VE_SONRASI",
      surumNo: 2,
      kaynakUrl: "https://kgk.gov.tr/kaynak",
      dosyaManifestiSha256: "a".repeat(64),
      dosyaSayisi: 3,
      olusturmaTarihi: "2026-11-02T12:00:00Z",
      surumler: [
        { id: 11, tanimSetiId: 5, tanimSetiKodu: "BOBI-MUNFERIT", surumNo: 4, durum: devrede ? 3 : 1, eszamanlilikSurumu: 7, ornekMizanHazirMi: true },
        { id: 12, tanimSetiId: 6, tanimSetiKodu: "TFRS-MUNFERIT", surumNo: 2, durum: devrede ? 3 : 1, eszamanlilikSurumu: 3, ornekMizanHazirMi: true },
      ],
    }] : []);
    if (path.endsWith("/FinansalTabloYonetimi/Kgk/AnaSurumler/7/DevreyeAl")) {
      topluIstegi = route.request().postDataJSON() as Record<string, unknown>;
      devrede = true;
      return json({
        anaSurumId: 7,
        etkinlikTarihi: "2026-11-02",
        surumler: [{ surumId: 11 }, { surumId: 12 }],
      });
    }
    if (path.endsWith("/FinansalTabloYonetimi/Kgk/TaramaGecmisi")) return json(tarandi ? [{
      taramaId: "3f8c2b7c-6b78-42d5-9c3e-e3700a0b9bf4",
      bitis: "2026-11-02T12:00:00Z",
      degisenDosyaSayisi: 0,
      anaSurumId: 7,
      anaSurumNo: 2,
    }] : []);
    if (path.endsWith("/FinansalTabloYonetimi/Kgk/TaraVeArsivle")) {
      tarandi = true;
      return json({
        anaSurumId: 7,
        anaSurumNo: 2,
        kontrol: { kaynakDonemKodu: "KGK_2023_VE_SONRASI", bulunanDosyaSayisi: 3, degisenDosyaSayisi: 0, dosyalar: [] },
        arsivler: [{ dosyaAdi: "fdt.xlsx" }, { dosyaAdi: "kzt.xlsx" }, { dosyaAdi: "nat.xlsx" }],
        hatalar: [],
        toplamDenemeSayisi: 3,
      });
    }
    return json(route.request().method() === "GET" ? [] : {});
  });

  await page.goto("/");
  await page.getByLabel("Email").fill("e2e@local.test");
  await page.getByLabel("Şifre").fill("E2E-only-password");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await page.waitForURL("**/Anasayfa");
  await page.goto("/FinansalTabloYonetimi/KgkGuncellemeleri");
  await page.getByRole("button", { name: "KGK güncellemesini otomatik kontrol et" }).click();

  await expect(page.getByText("KGK ana sürüm #2 hazır.", { exact: false })).toBeVisible();
  await page.getByText("KGK ana sürümleri (1)").click();
  await expect(page.getByRole("button", { name: "BOBI-MUNFERIT · #4 · Hazır" })).toBeVisible();
  await page.getByRole("button", { name: "Devreye al · Bağlı taslaklar" }).click();
  await page.getByRole("textbox", { name: "Onay nedeni" }).fill("KGK tablo sürümleri onaylandı");
  await page.getByRole("button", { name: "Tüm taslakları devreye al" }).click();
  await expect.poll(() => topluIstegi).not.toBeNull();
  expect(topluIstegi).toMatchObject({
    surumler: [
      { surumId: 11, eszamanlilikSurumu: 7 },
      { surumId: 12, eszamanlilikSurumu: 3 },
    ],
  });
  await expect(page.getByText("2 rapor sürümü devreye alındı.", { exact: false })).toBeVisible();
});
