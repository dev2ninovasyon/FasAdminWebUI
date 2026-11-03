import { expect, test, type Route } from "@playwright/test";

const json = (route: Route, body: unknown, status = 200) => route.fulfill({
  status,
  contentType: "application/json; charset=utf-8",
  body: JSON.stringify(body),
});

const kaynak = (sayfa: string, anahtar: string, satirNo: number, ad: string, girinti: number, ust: string | null, tur = "Veri") => ({
  sabitAnahtar: `KGK:${sayfa}:${anahtar}`, sayfaAdi: sayfa, satirNo, ad, girinti,
  ustSabitAnahtar: ust ? `KGK:${sayfa}:${ust}` : null, kalemTuru: tur, etiketKolonu: "A",
});

const FDT = "FINANSAL DURUM TABLOSU";
const ODT = "ÖZKAYNAK DEĞIŞIM TABLOSU";
const NAKIT = "VARLIKLAR/DÖNEN VARLIKLAR/NAKIT VE NAKIT BENZERLERI";
const TICARI = "VARLIKLAR/DÖNEN VARLIKLAR/TICARI ALACAKLAR";
const TOPLAM = "VARLIKLAR/DÖNEN VARLIKLAR/TOPLAM DÖNEN VARLIKLAR";
const ACILIS = "DÖNEM/BAŞLIK/DÖNEM BAŞI BAKIYELER";

const ortak = (anahtar: string, m: ReturnType<typeof kaynak> | null, k: ReturnType<typeof kaynak> | null, durum = "Ortak") => ({
  eslesmeAnahtari: anahtar, durum, munferitMi: Boolean(m), konsolideMi: Boolean(k),
  munferitKaynaklari: m ? [m] : [], konsolideKaynaklari: k ? [k] : [],
});

const sutunlar = [
  { sabitAnahtar: "S:OZ", sayfaAdi: "ODT", sutun: "C", baslikSatiri: 3, ad: "Özkaynaklar", ustSabitAnahtar: null, ilkSutunNo: 3, sonSutunNo: 4 },
  { sabitAnahtar: "S:SERMAYE", sayfaAdi: "ODT", sutun: "C", baslikSatiri: 4, ad: "Ödenmiş Sermaye", ustSabitAnahtar: "S:OZ", ilkSutunNo: 3, sonSutunNo: 3 },
  { sabitAnahtar: "S:YEDEK", sayfaAdi: "ODT", sutun: "D", baslikSatiri: 4, ad: "Yedekler", ustSabitAnahtar: "S:OZ", ilkSutunNo: 4, sonSutunNo: 4 },
  { sabitAnahtar: "S:TOPLAM", sayfaAdi: "ODT", sutun: "E", baslikSatiri: 3, ad: "Toplam", ustSabitAnahtar: null, ilkSutunNo: 5, sonSutunNo: 5 },
];

const taslak = {
  ozet: { id: 7, kgkAnaSurumId: 1, raporlamaStandardi: "Tfrs", olusturucuSurumu: 2, tabloSayisi: 2, ortakKalemSayisi: 8, kapsamaOzelKalemSayisi: 1, belirsizEslesmeSayisi: 0 },
  icerik: {
    raporlamaStandardi: "Tfrs",
    tablolar: [{
      ad: FDT,
      munferit: { baslik: "Finansal Durum Tablosu (Münferit)", sutunlar: null },
      konsolide: { baslik: "Finansal Durum Tablosu (Konsolide)", sutunlar: null },
      kalemler: [
        ortak("VARLIKLAR", kaynak("FDT", "V", 10, "Varlıklar", 0, null, "Baslik"), kaynak("FDT", "V", 10, "Varlıklar", 0, null, "Baslik")),
        ortak("VARLIKLAR/DÖNEN VARLIKLAR", kaynak("FDT", "V/D", 11, "Dönen Varlıklar", 1, "V", "Baslik"), kaynak("FDT", "V/D", 11, "Dönen Varlıklar", 1, "V", "Baslik")),
        ortak(NAKIT, kaynak("FDT", "V/D/N", 12, "Nakit ve Nakit Benzerleri", 2, "V/D"), kaynak("FDT", "V/D/N", 12, "Nakit ve Nakit Benzerleri", 2, "V/D")),
        ortak("VARLIKLAR/DÖNEN VARLIKLAR/KONTROL GÜCÜ OLMAYAN PAYLAR", null, kaynak("FDT", "V/D/K", 13, "Kontrol Gücü Olmayan Paylar", 2, "V/D"), "YalnizKonsolide"),
        ortak(TICARI, kaynak("FDT", "V/D/T", 13, "Ticari Alacaklar", 2, "V/D"), kaynak("FDT", "V/D/T", 14, "Ticari Alacaklar", 2, "V/D")),
        ortak(TOPLAM, kaynak("FDT", "V/D/TOP", 14, "Toplam Dönen Varlıklar", 2, "V/D"), kaynak("FDT", "V/D/TOP", 15, "Toplam Dönen Varlıklar", 2, "V/D")),
        ortak("VARLIKLAR/İŞTIRAKLER", kaynak("FDT", "V/I", 20, "İştirakler", 1, "V"), kaynak("FDT", "V/I", 21, "İştirakler", 1, "V")),
      ],
    }, {
      ad: ODT,
      munferit: { baslik: "Özkaynak Değişim Tablosu (Münferit)", sutunlar },
      konsolide: { baslik: "Özkaynak Değişim Tablosu (Konsolide)", sutunlar },
      kalemler: [
        ortak("DÖNEM", kaynak("ODT", "D", 5, "Dönem", 0, null, "Baslik"), kaynak("ODT", "D", 5, "Dönem", 0, null, "Baslik")),
        ortak("DÖNEM/BAŞLIK", kaynak("ODT", "D/B", 6, "Başlık", 1, "D", "Baslik"), kaynak("ODT", "D/B", 6, "Başlık", 1, "D", "Baslik")),
        ortak(ACILIS, kaynak("ODT", "D/B/A", 7, "Dönem Başı Bakiyeler", 2, "D/B"), kaynak("ODT", "D/B/A", 7, "Dönem Başı Bakiyeler", 2, "D/B")),
      ],
    }],
  },
};

const varyant = (tabloAdi: string, eslesmeAnahtari: string, kapsam: string, donusumTipi: string, hamFormul: string, dipnot: string | null = null, yataySutunAnahtari: string | null = null) =>
  ({ tabloAdi, eslesmeAnahtari, yataySutunAnahtari, kapsam, donusumTipi, hamFormul, dipnot, hesaplamaKurali: null, kaynak: null });

test.use({ viewport: { width: 1680, height: 1000 } });

test("birleşik KGK formülleri Excel tablosunda düzenlenir ve motorla hesaplanır", async ({ page }) => {
  const hatalar: string[] = [];
  // Giriş sayfasındaki reCAPTCHA betiği yerel ortamda site anahtarı olmadan bu uyarıyı verebilir.
  page.on("pageerror", (hata) => { if (!hata.message.includes("Missing required parameters: sitekey")) hatalar.push(hata.message); });
  const son = {
    id: 33, birlesikTaslakId: 7, surumNo: 3, kaynakSurumId: 32, icerikSha256: "a".repeat(64), aciklama: "İlk formüller",
    olusturmaTarihi: "2026-11-03T10:00:00Z",
    varyantlar: [
      varyant(FDT, NAKIT, "Munferit", "Normal", "100+102"),
      varyant(FDT, TOPLAM, "Munferit", "Normal", "C12+C13"),
      varyant(FDT, NAKIT, "Konsolide", "Normal", "100", "5"),
      varyant(ODT, ACILIS, "Munferit", "Normal", "500", null, "S:SERMAYE"),
    ],
  };
  const gecmis = [{ id: 33, surumNo: 3, aciklama: "İlk formüller", olusturmaTarihi: "2026-11-03T10:00:00Z" }];
  let kayitIstegi: Record<string, any> | null = null;
  const onizlemeIstekleri: Array<Record<string, any>> = [];

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith("/Auth/AdminLogin")) return json(route, {
      token: "e2e-access-token", refreshToken: "e2e-refresh-token", userId: 1, denetciId: 1, denetciFirmaAdi: "E2E Denetim",
      yetki: "FasAdmin", rol: ["FasAdmin"], claims: ["FasAdmin"], kullaniciAdi: "E2E Admin", unvan: "FasAdmin", bddkmi: false,
      kurulumTamamlandi: true, kurulumAdimi: 0, setupWizardProgress: "{}", turTamamlandi: true,
    });
    if (path.endsWith("/Kgk/BirlesikTaslaklar/7")) return json(route, taslak);
    if (path.endsWith("/Kgk/BirlesikTaslaklar/7/FormulSurumleri/Son")) return json(route, son);
    if (path.endsWith("/Kgk/BirlesikTaslaklar/7/FormulSurumleri")) return json(route, gecmis);
    if (path.endsWith("/FinansalTabloYonetimi/TestMizanlari")) return json(route, [{
      id: "11111111-2222-3333-4444-555555555555", ad: "Örnek 2025", denetlenenId: 7, yil: 2025, konsolidasyonMu: false,
      olusturmaTarihi: "2026-11-01T10:00:00Z", sha256: "b".repeat(64), satirlar: [],
    }]);
    if (path.endsWith("/Kgk/BirlesikTaslaklar/7/Onizle")) {
      const istek = request.postDataJSON() as Record<string, any>;
      onizlemeIstekleri.push(istek);
      const mizan = Boolean(istek.testMizanId);
      return json(route, {
        birlesikTaslakId: 7, formulSurumNo: istek.formulSurumNo, tabloAdi: istek.tabloAdi, testMizanId: istek.testMizanId,
        testMizanAdi: mizan ? "Örnek 2025" : null, motorSurumu: "finansal-tablo-yeni-motor-v1",
        varyantlar: [{ kapsam: "Munferit", donusumTipi: "Normal", durum: mizan ? "Hesaplandi" : "Derlendi", aciklama: null, hazirHucreSayisi: 1, hataliHucreSayisi: 1 }],
        hucreler: istek.tabloAdi !== FDT ? [] : [
          { eslesmeAnahtari: NAKIT, kapsam: "Munferit", donusumTipi: "Normal", hazirMi: true, deger: mizan ? 1500 : null, hata: null },
          { eslesmeAnahtari: TOPLAM, kapsam: "Munferit", donusumTipi: "Normal", hazirMi: false, deger: null, hata: "13. satırın (Ticari Alacaklar) bu kapsam ve türde çalışır formülü yok." },
        ],
      });
    }
    if (path.endsWith("/Kgk/BirlesikTaslaklar/7/FormulVaryantlari") && request.method() === "POST") {
      kayitIstegi = request.postDataJSON() as Record<string, any>;
      son.surumNo = 4;
      son.varyantlar.push(varyant(FDT, TICARI, "Munferit", "Normal", kayitIstegi.varyant.hamFormul));
      gecmis.unshift({ id: 34, surumNo: 4, aciklama: kayitIstegi.aciklama, olusturmaTarihi: "2026-11-04T10:00:00Z" });
      return json(route, { id: 34, birlesikTaslakId: 7, surumNo: 4, varyantSayisi: son.varyantlar.length });
    }
    return json(route, request.method() === "GET" ? [] : {});
  });

  await page.goto("/");
  await page.getByLabel("Email").fill("e2e@local.test");
  await page.getByLabel("Şifre").fill("E2E-only-password");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await page.waitForURL("**/Anasayfa");
  await page.goto("/FinansalTabloYonetimi/BirlesikTaslak/7");

  const tablo = page.getByRole("table");
  await expect(page.getByRole("tab", { name: "Finansal Durum Tablosu" })).toHaveAttribute("aria-selected", "true");
  await expect(tablo.getByText("Nakit ve Nakit Benzerleri", { exact: true })).toBeVisible();
  await expect(tablo.getByText("100+102", { exact: true })).toBeVisible();
  await expect(tablo.getByText("#HATA", { exact: true })).toBeVisible();
  await expect(page.getByText("· 1 hata", { exact: false }).first()).toBeVisible();
  await expect(tablo.getByText("5", { exact: true })).toBeVisible();
  // Formüller tek tip: yalnız Münferit ve Konsolide sütunları var (Normal/Enflasyon ayrımı yok).
  await expect(tablo.getByRole("columnheader", { name: "Enflasyon" })).toHaveCount(0);
  await expect(tablo.locator('td[title="Bu satır münferit tabloda yok."]')).toHaveCount(1);

  // Ağaç: daraltınca alt kalemler gizlenir, aramada Türkçe I/İ farkı önemsizdir.
  await tablo.getByRole("row", { name: /Dönen Varlıklar/ }).first().getByRole("button", { name: "Daralt" }).click();
  await expect(tablo.getByText("Nakit ve Nakit Benzerleri", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Tümünü aç" }).click();
  await expect(tablo.getByText("Nakit ve Nakit Benzerleri", { exact: true })).toBeVisible();
  await page.getByPlaceholder("Satır ara").fill("ISTIRAK");
  await expect(tablo.getByText("İştirakler", { exact: true })).toBeVisible();
  await expect(tablo.getByText("Nakit ve Nakit Benzerleri", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Aramayı temizle" }).click();

  // Hücre seçimi formül panelini MUI Drawer olarak sayfanın üstüne açar; sayfa boyutu değişmez.
  const tabloKutusu = page.locator("table").first();
  const tabloGenisligi = (await tabloKutusu.boundingBox())!.width;
  await page.getByRole("button", { name: "Ticari Alacaklar Münferit" }).click();
  await expect(page.getByText("Münferit · Excel satırı 13", { exact: true })).toBeVisible();
  const cekmece = page.locator(".MuiDrawer-paper").filter({ hasText: "Ticari Alacaklar" });
  await expect(cekmece).toBeVisible();
  await expect(page.locator(".MuiDrawer-root > .MuiBackdrop-root")).toBeVisible();
  expect(Math.abs((await tabloKutusu.boundingBox())!.width - tabloGenisligi)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "test-results/kgk-formul-cekmece.png" });
  const formul = page.getByLabel("Formül", { exact: true });
  await expect(formul).toBeFocused();
  await formul.fill("120-C12");
  await formul.press("Control+Enter");
  await expect.poll(() => kayitIstegi).not.toBeNull();
  expect(kayitIstegi).toMatchObject({
    beklenenSurumNo: 3,
    varyant: { tabloAdi: FDT, eslesmeAnahtari: TICARI, yataySutunAnahtari: null, kapsam: 1, donusumTipi: 1, hamFormul: "120-C12" },
  });
  expect(kayitIstegi!.aciklama).toContain("Ticari Alacaklar");
  await expect(page.getByText("Alt sürüm #4 kaydedildi", { exact: false })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(cekmece).toBeHidden();
  await expect(tablo.getByText("120-C12", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Örnek mizanla hesapla" }).click();
  await expect(tablo.getByText("1.500", { exact: true })).toBeVisible();
  expect(onizlemeIstekleri.at(-1)).toMatchObject({ formulSurumNo: 4, tabloAdi: FDT, testMizanId: "11111111-2222-3333-4444-555555555555" });
  await page.screenshot({ path: "test-results/kgk-formul-tablosu.png", fullPage: true });
  // Panel açıkken sayfa yatay taşmamalı (yan menülü düzende tablo genişliği yukarı yayılmasın).
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  // Özkaynak: sütun başlık hiyerarşisi korunur, kapsam anahtarı hücreleri değiştirir.
  await page.getByRole("tab", { name: "Özkaynak Değişim Tablosu" }).click();
  await expect(page.getByRole("columnheader", { name: "Özkaynaklar" })).toBeVisible();
  for (const harf of ["A", "C", "D", "E"]) await expect(page.getByRole("columnheader", { name: harf, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Normal", exact: true })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Ödenmiş Sermaye" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Toplam", exact: true })).toBeVisible();
  await expect(tablo.getByText("500", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Konsolide", exact: true }).click();
  await expect(tablo.getByText("500", { exact: true })).toHaveCount(0);
  await page.screenshot({ path: "test-results/kgk-ozkaynak-tablosu.png", fullPage: true });

  expect(hatalar).toEqual([]);
});
