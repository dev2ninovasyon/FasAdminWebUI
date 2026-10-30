import { expect, test, type Route } from "@playwright/test";

const draftVersion = {
  id: 11,
  tanimSetiId: 1,
  surumNo: 4,
  etiket: "E2E Taslak",
  durum: 1,
  gecerlilikBaslangici: "2026-01-01T00:00:00Z",
  gecerlilikBitisi: null,
  kaynakSurumId: 10,
  aciklama: "İzole yönetim arayüzü testi",
  olusturmaTarihi: "2026-10-30T09:00:00Z",
  guncellemeTarihi: "2026-10-30T09:00:00Z",
  onayTarihi: null,
  kaynakPaketSurumu: null,
  kaynakPaketSha256: null,
  kaynakVeriSha256: null,
  eszamanlilikSurumu: 7,
  tabloSayisi: 1,
  kalemSayisi: 3,
  formulSayisi: 1,
  kontrolKuraliSayisi: 0,
};

const definitionSets = [{
  id: 1,
  kod: "BOBI-MUNFERIT-NORMAL",
  ad: "BOBİ FRS Münferit Normal",
  raporlamaStandardi: 1,
  kapsam: 1,
  donusumTipi: 1,
  aktifMi: true,
  surumler: [draftVersion],
}];

const versionDetail = {
  surum: draftVersion,
  tablolar: [{
    id: 21,
    kod: "FDT",
    ad: "Finansal Durum Tablosu",
    tabloTuru: 1,
    nakitAkisYontemi: 0,
    paraBirimi: "TRY",
    yuvarlamaBasamagi: 2,
    sira: 1,
    aktifMi: true,
    donemKolonlari: [{
      id: 31,
      sabitAnahtar: "CARI",
      ad: "Cari dönem",
      donemDavranisi: 1,
      donemOfseti: 0,
      sira: 1,
      zorunluMu: true,
    }],
    kalemler: [
      { id: 101, ustKalemId: null, sabitAnahtar: "TOPLAM_VARLIKLAR", kod: "TV", ad: "Toplam varlıklar", sira: 1, kalemTuru: 4, eksen: 1, varsayilanGorunurMu: true, aktifMi: true },
      { id: 102, ustKalemId: 101, sabitAnahtar: "NAKIT", kod: "100", ad: "Nakit ve nakit benzerleri", sira: 2, kalemTuru: 2, eksen: 1, varsayilanGorunurMu: true, aktifMi: true },
      { id: 103, ustKalemId: 101, sabitAnahtar: "TICARI_ALACAKLAR", kod: "120", ad: "Ticari alacaklar", sira: 3, kalemTuru: 2, eksen: 1, varsayilanGorunurMu: true, aktifMi: true },
    ],
    hucreler: [],
    kurallar: [{
      id: 201,
      kalemId: 101,
      hucreId: null,
      hesaplamaTuru: 2,
      isaretPolitikasi: 1,
      bosDegerPolitikasi: 1,
      sabitDeger: null,
      aciklama: "Alt finansal kalemleri toplar",
      hamFormul: "NAKIT + TICARI_ALACAKLAR",
      kgkExcelHedefi: "FDT!B10",
      aktifMi: true,
      terimler: [{
        id: 301,
        sira: 0,
        hamTerim: "NAKIT",
        kaynakTuru: 3,
        kaynakAnahtari: "NAKIT",
        operator: 1,
        degerAlani: 1,
        donemDavranisi: 1,
        donemOfseti: 0,
        katsayi: 1,
        isaretPolitikasi: 1,
        zorunluMu: true,
        hesaplamaSekli: 1,
        karsilastirmaDegerAlani: 1,
        karsilastirmaDonemDavranisi: 2,
        karsilastirmaDonemOfseti: -1,
        karsilastirmaIsaretPolitikasi: 1,
        farkYonu: 1,
        sonucIsaretPolitikasi: 1,
      }],
    }],
    kontrolKurallari: [],
  }],
};

const fulfillJson = (route: Route, body: unknown, status = 200) => route.fulfill({
  status,
  contentType: "application/json; charset=utf-8",
  body: JSON.stringify(body),
});

test("admin girişinden otomatik önizleme ve hatalı revizyonda güvenli durdurmaya kadar çalışır", async ({ page }) => {
  let loginPayload: Record<string, unknown> | null = null;
  let ruleUpdatePayload: Record<string, any> | null = null;
  let validationPayload: Record<string, any> | null = null;
  let testTrialBalancePayload: Record<string, any> | null = null;
  let previewPayload: Record<string, any> | null = null;
  let ruleUpdateCount = 0;
  let validationCallCount = 0;
  let testTrialBalanceCreateCount = 0;
  let previewCount = 0;
  let productionWriteCount = 0;
  let validationShouldFail = false;
  let definitionAuthorization = "";
  const runtimeErrors: string[] = [];
  const isCancelledDashboardRequest = (value: string) =>
    value.includes("Failed to fetch")
    && (value.includes("/api/Denetci/Hepsi") || value.includes("/api/Denetlenen/Hepsi"));

  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !isCancelledDashboardRequest(message.text())) {
      runtimeErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) runtimeErrors.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => {
    const errorText = request.failure()?.errorText || "";
    if (errorText === "net::ERR_ABORTED" && !request.url().includes("/api/")) return;
    if (errorText === "net::ERR_ABORTED" && (
      request.url().includes("/api/Denetci/Hepsi")
      || request.url().includes("/api/Denetlenen/Hepsi")
    )) return;
    runtimeErrors.push(`İstek başarısız: ${request.url()} ${errorText}`);
  });

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (path.endsWith("/Auth/AdminLogin")) {
      loginPayload = request.postDataJSON() as Record<string, unknown>;
      return fulfillJson(route, {
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
    }

    if (path.endsWith("/FinansalTabloYonetimi/TanimSetleri")) {
      definitionAuthorization = request.headers().authorization || "";
      return fulfillJson(route, definitionSets);
    }

    if (path.endsWith("/FinansalTabloYonetimi/SurumYonetimi/Durum")) {
      return fulfillJson(route, {
        etkin: false,
        eskiAkisKorunuyor: true,
        acikSurumSecimiZorunlu: true,
        aciklama: "E2E testinde canlı sürüm geçişi kapalıdır.",
      });
    }

    if (path.endsWith("/FinansalTabloYonetimi/Surumler/11/Tanim")) {
      return fulfillJson(route, versionDetail);
    }

    if (path.endsWith("/FinansalTabloYonetimi/Surumler/11/LegacyFormuller/Karsilastir")) {
      return fulfillJson(route, {
        surumId: 11,
        tanimSetiId: 1,
        taslakMi: true,
        kilitliMi: true,
        kilitSurumId: 10,
        eszamanlilikSurumu: 7,
        kaynakSha256: "a".repeat(64),
        karsilastirilanKuralSayisi: 1,
        farkSayisi: 0,
        aktarilabilirFarkSayisi: 0,
        incelemeGerektirenFarkSayisi: 0,
        farklar: [],
      });
    }

    if (path.endsWith("/FinansalTabloYonetimi/Surumler/11/Dogrula") && request.method() === "POST") {
      validationCallCount += 1;
      validationPayload = request.postDataJSON() as Record<string, any>;
      return fulfillJson(route, {
        surumId: 11,
        surumEtiketi: "E2E Taslak",
        eszamanlilikSurumu: validationShouldFail ? 9 : 8,
        gecerliMi: !validationShouldFail,
        tablolar: [{
          tabloId: 21,
          tabloKod: "FDT",
          gecerliMi: !validationShouldFail,
          snapshotSha256: validationShouldFail ? null : "c".repeat(64),
          sorunlar: validationShouldFail ? [{
            kod: 1001,
            konum: "FDT/TOPLAM_VARLIKLAR",
            aciklama: "E2E zorunlu kaynak bulunamadı.",
            hedef: { hedefTuru: 1, sabitAnahtar: "TOPLAM_VARLIKLAR" },
          }] : [],
        }],
      });
    }

    if (path.endsWith("/FinansalTabloYonetimi/Surumler/11/Tablolar/21/Kurallar/201") && request.method() === "PUT") {
      ruleUpdateCount += 1;
      ruleUpdatePayload = request.postDataJSON() as Record<string, any>;
      return fulfillJson(route, {
        success: true,
        kuralId: 201,
        surumId: 11,
        eszamanlilikSurumu: 7 + ruleUpdateCount,
        guncellemeTarihi: "2026-10-30T10:00:00Z",
      });
    }

    if (path.endsWith("/FinansalTabloYonetimi/TestMizanlari") && request.method() === "POST") {
      testTrialBalanceCreateCount += 1;
      testTrialBalancePayload = request.postDataJSON() as Record<string, any>;
      return fulfillJson(route, {
        id: "11111111-2222-3333-4444-555555555555",
        ad: testTrialBalancePayload.ad,
        denetlenenId: testTrialBalancePayload.denetlenenId,
        yil: testTrialBalancePayload.yil,
        konsolidasyonMu: testTrialBalancePayload.konsolidasyonMu,
        olusturmaTarihi: "2026-10-30T10:05:00Z",
        sha256: "b".repeat(64),
        satirlar: testTrialBalancePayload.satirlar,
      });
    }

    if (path.endsWith("/FinansalTabloYonetimi/TestMizanlari") && request.method() === "GET") {
      return fulfillJson(route, []);
    }

    if (path.endsWith("/FinansalTabloYonetimi/Uretimler/Onizle") && request.method() === "POST") {
      previewCount += 1;
      previewPayload = request.postDataJSON() as Record<string, any>;
      return fulfillJson(route, {
        saltOkunur: true,
        arsivlendiMi: false,
        basariliMi: true,
        durum: 1,
        motorSurumu: "finansal-tablo-yeni-motor-v1",
        girdiSabitAnahtari: previewPayload.girdiSabitAnahtari,
        girdiSha256: previewPayload.girdiSha256,
        sonuclar: [{
          anahtar: {
            tabloSabitAnahtari: "FDT",
            hedefTuru: 1,
            hedefSabitAnahtari: "TOPLAM_VARLIKLAR",
            donemSabitAnahtari: "CARI",
          },
          durum: 1,
          deger: 1500,
          izAnahtari: "e2e-trace",
          hataKodu: null,
          aciklama: null,
        }],
        hataKodu: null,
        aciklama: "İzole test mizanı başarıyla hesaplandı.",
      });
    }

    if (path.endsWith("/FinansalTabloYonetimi/Uretimler") && request.method() === "POST") {
      productionWriteCount += 1;
      return fulfillJson(route, { message: "E2E sırasında kalıcı üretim çağrısı beklenmiyor." }, 409);
    }

    return fulfillJson(route, request.method() === "GET" ? [] : {});
  });

  await page.goto("/");
  const emailInput = page.getByLabel("Email");
  try {
    await emailInput.waitFor({ state: "visible", timeout: 15_000 });
  } catch {
    const bodyText = (await page.locator("body").innerText()).slice(0, 1_000);
    throw new Error(`Giriş ekranı yüklenemedi. URL=${page.url()} Hatalar=${runtimeErrors.join(" | ")} Gövde=${bodyText}`);
  }
  await emailInput.fill("e2e@local.test");
  await page.getByLabel("Şifre").fill("E2E-only-password");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await page.waitForURL("**/Anasayfa");

  expect(loginPayload).toMatchObject({
    email: "e2e@local.test",
    password: "E2E-only-password",
    CaptchaToken: "BYPASS_RECAPTCHA_TEST",
  });

  await page.goto("/FinansalTabloYonetimi");
  await expect(page.getByText("Finansal tablo hazırlama adımları")).toBeVisible();
  await expect(page.getByText("BOBİ FRS Münferit Normal", { exact: false }).first()).toBeVisible();
  expect(definitionAuthorization).toBe("Bearer e2e-access-token");

  await page.getByRole("button", { name: "Tanım ve formülleri düzenle" }).click();
  await expect(page.getByText("Yapılandırılmış kural editörü")).toBeVisible();

  await page.getByText("Kural seçin", { exact: true }).click();
  await page.getByRole("option", { name: "#201 · Kalem 101" }).click();

  const sourceItem = page.getByText("Nakit ve nakit benzerleri · 100", { exact: true });
  await expect(sourceItem).toBeVisible();
  await sourceItem.click();
  await expect(page.getByRole("option", { name: "Nakit ve nakit benzerleri · 100" })).toBeVisible();
  await expect(page.getByRole("option", { name: /Toplam varlıklar/ })).toHaveCount(0);
  await page.getByRole("option", { name: "Ticari alacaklar · 120" }).click();

  await page.getByRole("button", { name: "Kuralı kaydet" }).click();
  await expect.poll(() => ruleUpdatePayload).not.toBeNull();
  const savedRule = ruleUpdatePayload as unknown as Record<string, any>;
  expect(savedRule.terimler?.[0]?.kaynakAnahtari).toBe("TICARI_ALACAKLAR");
  expect(savedRule.beklenenEszamanlilikSurumu).toBe(7);
  await expect(page.getByRole("button", { name: "Kuralı kaydet" })).toHaveCount(0);

  await page.getByRole("button", { name: "Otomatik testi çalıştır" }).click();

  await expect.poll(() => validationPayload).not.toBeNull();
  expect(validationPayload).toMatchObject({ beklenenEszamanlilikSurumu: 8 });
  await expect.poll(() => testTrialBalancePayload).not.toBeNull();
  const createdTrialBalance = testTrialBalancePayload as unknown as Record<string, any>;
  expect(createdTrialBalance).toMatchObject({
    ad: "Yeni motor test mizanı",
    denetlenenId: 999999,
    konsolidasyonMu: false,
  });
  expect(createdTrialBalance.satirlar).toHaveLength(2);
  expect(createdTrialBalance.satirlar[0]).toMatchObject({
    detayKodu: "100.01",
    borc: 1000,
    alacak: 0,
    bakiye: 1000,
    bakiyeTransferFisiHaric: 1000,
    paraBirimi: "TRY",
  });
  await expect(page.getByText("Test mizanı hazır", { exact: true })).toBeVisible();
  await expect(page.getByText("Admin testi başarıyla tamamlandı", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ayrıntıları göster" }).click();
  await expect(page.getByText("Salt-okunur önizleme tamamlandı", { exact: true })).toBeVisible();
  await expect(page.getByText("Arşivlenmedi", { exact: true })).toBeVisible();
  await expect(page.getByText("FDT · TOPLAM_VARLIKLAR", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "1.500" })).toBeVisible();

  await expect.poll(() => previewPayload).not.toBeNull();
  expect(previewPayload).toMatchObject({
    tanimSetiSabitAnahtari: "BOBI-MUNFERIT-NORMAL",
    tanimSurumu: "E2E Taslak",
    girdiSabitAnahtari: "TEST-MIZAN-11111111",
    girdiSha256: "b".repeat(64),
    tanimSnapshotSha256: "c".repeat(64),
    tabloSabitAnahtari: "FDT",
    donemSabitAnahtari: "CARI",
    calistirmaBaglami: {
      degerKaynagiBaglami: {
        denetlenenId: 999999,
        konsolidasyonMu: false,
        testMizanId: "11111111-2222-3333-4444-555555555555",
      },
    },
  });
  expect(ruleUpdateCount).toBe(1);
  expect(validationCallCount).toBe(1);
  expect(testTrialBalanceCreateCount).toBe(1);
  expect(previewCount).toBe(1);

  await page.getByRole("button", { name: "Tanımı seç", exact: true }).click();
  await expect(page.getByRole("button", { name: "Devreye al" })).toBeDisabled();
  await expect(page.getByText("Canlı kullanıcılar eski tablolarla devam ediyor.", { exact: false })).toBeVisible();

  validationShouldFail = true;
  await expect(page.getByText("Yapılandırılmış kural editörü", { exact: true })).toBeVisible();
  await page.getByText("Kural seçin", { exact: true }).click();
  await page.getByRole("option", { name: "#201 · Kalem 101" }).click();
  await page.getByText("Ticari alacaklar · 120", { exact: true }).click();
  await page.getByRole("option", { name: "Nakit ve nakit benzerleri · 100" }).click();
  await page.getByRole("button", { name: "Kuralı kaydet" }).click();
  await expect.poll(() => ruleUpdateCount).toBe(2);
  await expect(page.getByRole("button", { name: "Kuralı kaydet" })).toHaveCount(0);

  await page.getByRole("button", { name: "Otomatik testi çalıştır" }).click();
  await expect.poll(() => validationCallCount).toBe(2);
  await expect(page.getByText("Düzeltilmesi gereken tanımlar var", { exact: true })).toBeVisible();
  await expect(page.getByText("E2E zorunlu kaynak bulunamadı.", { exact: false })).toBeVisible();
  expect(testTrialBalanceCreateCount).toBe(1);
  expect(previewCount).toBe(1);
  expect(productionWriteCount).toBe(0);
  expect(runtimeErrors).toEqual([]);
});
