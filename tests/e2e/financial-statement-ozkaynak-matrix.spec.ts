import { expect, test, type Route } from "@playwright/test";

const json = (route: Route, body: unknown, status = 200) => route.fulfill({
  status,
  contentType: "application/json; charset=utf-8",
  body: JSON.stringify(body),
});

const surum = {
  id: 31, tanimSetiId: 1, surumNo: 2, etiket: "E2E Özkaynak", durum: "Taslak",
  gecerlilikBaslangici: "2026-01-01T00:00:00Z", gecerlilikBitisi: null, kaynakSurumId: null, aciklama: null,
  olusturmaTarihi: "2026-11-01T09:00:00Z", guncellemeTarihi: "2026-11-01T09:00:00Z", onayTarihi: null,
  kaynakPaketSurumu: null, kaynakPaketSha256: null, kaynakVeriSha256: null, eszamanlilikSurumu: 3,
  tabloSayisi: 1, kalemSayisi: 7, formulSayisi: 5, kontrolKuraliSayisi: 0,
};

// API enum'ları metin olarak döndürür; fixture bu biçimi taklit eder.
const kalem = (id: number, ad: string, sira: number, eksen: string, kalemTuru: string, ustKalemId: number | null) => ({
  id, ustKalemId, sabitAnahtar: `ODT:${id}`, kod: null, ad, sira, kalemTuru, eksen, varsayilanGorunurMu: true, aktifMi: true,
});
const kural = (id: number, hucreId: number, hamFormul: string | null, terimler: unknown[] = []) => ({
  id, kalemId: null, hucreId, hesaplamaTuru: "HesapFormulu", isaretPolitikasi: "OlduguGibi", bosDegerPolitikasi: "SifirKabulEt",
  sabitDeger: null, aciklama: null, hamFormul, kgkExcelHedefi: null, aktifMi: true, terimler,
});

const tanim = {
  surum,
  tablolar: [{
    id: 41, kod: "OZKAYNAK_DEGISIM", ad: "Özkaynak Değişim Tablosu", tabloTuru: "OzkaynakDegisim", nakitAkisYontemi: "Uygulanmaz",
    paraBirimi: "TRY", yuvarlamaBasamagi: 2, sira: 1, aktifMi: true, donemKolonlari: [], kontrolKurallari: [],
    kalemler: [
      kalem(401, "Önceki dönem", 1, "Dikey", "Baslik", null),
      kalem(402, "Dönem başı bakiyeler", 2, "Dikey", "Veri", 401),
      kalem(403, "Dönem kârı", 3, "Dikey", "Veri", 401),
      kalem(501, "Özkaynaklar", 10, "Yatay", "Baslik", null),
      kalem(502, "Ödenmiş sermaye", 11, "Yatay", "Veri", 501),
      kalem(503, "Yedekler", 12, "Yatay", "Veri", 501),
      kalem(504, "Toplam", 13, "Yatay", "Toplam", null),
    ],
    hucreler: [
      [601, 402, 502], [602, 402, 503], [603, 402, 504], [604, 403, 502], [605, 403, 503], [606, 403, 504],
    ].map(([id, dikeyKalemId, yatayKalemId]) => ({ id, sabitAnahtar: `H:${id}`, dikeyKalemId, yatayKalemId, aktifMi: true })),
    kurallar: [
      kural(701, 601, "500"),
      kural(702, 602, "540+541"),
      kural(703, 603, "ALT"),
      kural(704, 604, null, [{
        id: 801, sira: 0, hamTerim: null, kaynakTuru: "HesapKoduOneki", kaynakAnahtari: "590", operator: "Topla",
        degerAlani: "Bakiye", donemDavranisi: "CariDonem", donemOfseti: 0, katsayi: 1, isaretPolitikasi: "OlduguGibi",
        zorunluMu: true, hesaplamaSekli: "Deger", karsilastirmaDegerAlani: "Bakiye", karsilastirmaDonemDavranisi: "OncekiDonem",
        karsilastirmaDonemOfseti: -1, karsilastirmaIsaretPolitikasi: "OlduguGibi", farkYonu: "KaynakEksiKarsilastirma",
        sonucIsaretPolitikasi: "OlduguGibi", katsayiKaynakTuru: null, katsayiKaynakAnahtari: null, katsayiDonemDavranisi: "CariDonem", katsayiDonemOfseti: 0,
      }]),
      kural(706, 606, "ALT"),
    ],
  }],
};

test.use({ viewport: { width: 1680, height: 1000 } });

test("sürüm ekranında özkaynak tablosu Excel matrisi olarak düzenlenir", async ({ page }) => {
  const hatalar: string[] = [];
  page.on("pageerror", (hata) => { if (!hata.message.includes("Missing required parameters: sitekey")) hatalar.push(hata.message); });
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith("/Auth/AdminLogin")) return json(route, {
      token: "e2e-access-token", refreshToken: "e2e-refresh-token", userId: 1, denetciId: 1, denetciFirmaAdi: "E2E Denetim",
      yetki: "FasAdmin", rol: ["FasAdmin"], claims: ["FasAdmin"], kullaniciAdi: "E2E Admin", unvan: "FasAdmin", bddkmi: false,
      kurulumTamamlandi: true, kurulumAdimi: 0, setupWizardProgress: "{}", turTamamlandi: true,
    });
    if (path.endsWith("/FinansalTabloYonetimi/TanimSetleri")) return json(route, [{
      id: 1, kod: "rapor-v1:bobi-frs:munferit:normal", ad: "BOBİ FRS Münferit Normal", raporlamaStandardi: "BobiFrs",
      kapsam: "Munferit", donusumTipi: "Normal", aktifMi: true, surumler: [surum],
    }]);
    if (path.endsWith("/FinansalTabloYonetimi/Surumler/31/Tanim")) return json(route, tanim);
    return json(route, request.method() === "GET" ? [] : {});
  });

  await page.goto("/");
  await page.getByLabel("Email").fill("e2e@local.test");
  await page.getByLabel("Şifre").fill("E2E-only-password");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await page.waitForURL("**/Anasayfa");
  await page.goto("/FinansalTabloYonetimi/Surum/31");

  // Sütunlar yatay kalem ağacından birleştirilmiş başlıklarla, satırlar dikey kalemlerle oluşur.
  await expect(page.getByRole("columnheader", { name: "Özkaynaklar" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Ödenmiş sermaye" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Toplam", exact: true })).toBeVisible();
  await expect(page.getByText("3 satır × 3 sütun", { exact: false })).toBeVisible();
  await expect(page.getByText("Özkaynak hücre formülleri")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Dönem başı bakiyeler Ödenmiş sermaye" })).toHaveText("500");
  await expect(page.getByRole("button", { name: "Dönem kârı Ödenmiş sermaye" })).toHaveText("590");

  // Kuralı olmayan hücre eksik sayılır (satır değil hücre bazında).
  await expect(page.getByRole("button", { name: "Eksik formüller (1)" })).toBeVisible();
  await expect(page.getByText("1 hücrenin çalışır hesap kuralı yok", { exact: false })).toBeVisible();

  // Dikey ağaç Excel'deki gibi daraltılır.
  await page.getByRole("row", { name: /Önceki dönem/ }).getByRole("button", { name: "Daralt" }).click();
  await expect(page.getByText("Dönem başı bakiyeler", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Tümünü aç" }).click();

  // Hücreye tıklamak formül çekmecesini hücre adıyla açar; sayfa boyutu değişmez.
  const tabloKutusu = page.locator("table").first();
  const genislik = (await tabloKutusu.boundingBox())!.width;
  await page.getByRole("button", { name: "Dönem başı bakiyeler Yedekler" }).click();
  const cekmece = page.locator(".MuiDrawer-paperAnchorRight");
  await expect(cekmece.getByText("Dönem başı bakiyeler × Yedekler", { exact: true })).toBeVisible();
  await expect(cekmece.getByText("Hücre formülü · Kural #702", { exact: true })).toBeVisible();
  expect(Math.abs((await tabloKutusu.boundingBox())!.width - genislik)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "test-results/ozkaynak-matris-cekmece.png" });
  await page.keyboard.press("Escape");
  await expect(cekmece).toBeHidden();
  await page.screenshot({ path: "test-results/ozkaynak-matris.png", fullPage: true });

  expect(hatalar).toEqual([]);
});
