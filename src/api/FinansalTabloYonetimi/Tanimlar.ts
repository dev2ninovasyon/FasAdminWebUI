import { url } from "@/api/apiBase";

export type FinansalTanimSeti = {
  id: number;
  kod: string;
  ad: string;
  raporlamaStandardi: number;
  kapsam: number;
  donusumTipi: number;
  aktifMi: boolean;
  surumler: FinansalSurum[];
};

export type FinansalSurum = {
  id: number;
  tanimSetiId: number;
  surumNo: number;
  etiket: string;
  durum: number | string;
  gecerlilikBaslangici: string;
  gecerlilikBitisi?: string | null;
  kaynakSurumId?: number | null;
  aciklama?: string | null;
  olusturmaTarihi: string;
  guncellemeTarihi?: string | null;
  onayTarihi?: string | null;
  kaynakPaketSurumu?: string | null;
  kaynakPaketSha256?: string | null;
  kaynakVeriSha256?: string | null;
  eszamanlilikSurumu: number;
  tabloSayisi: number;
  kalemSayisi: number;
  formulSayisi: number;
  kontrolKuraliSayisi: number;
};

export type FinansalSurumDetay = {
  surum: FinansalSurum;
  tablolar: Array<{
    id: number;
    kod: string;
    ad: string;
    tabloTuru: number | string;
    nakitAkisYontemi: number | string;
    paraBirimi: string;
    yuvarlamaBasamagi: number;
    sira: number;
    aktifMi: boolean;
    donemKolonlari: Array<{ id: number; sabitAnahtar: string; ad: string; donemDavranisi: number; donemOfseti: number; sira: number; zorunluMu: boolean }>;
    kalemler: Array<{ id: number; ustKalemId?: number | null; sabitAnahtar: string; kod?: string | null; ad: string; sira: number; kalemTuru: number; eksen: number; varsayilanGorunurMu: boolean; aktifMi: boolean }>;
    hucreler: Array<{ id: number; sabitAnahtar: string; dikeyKalemId: number; yatayKalemId: number; aktifMi: boolean }>;
    kurallar: Array<{ id: number; kalemId?: number | null; hucreId?: number | null; hesaplamaTuru: number; isaretPolitikasi: number; bosDegerPolitikasi: number; sabitDeger?: number | null; aciklama?: string | null; hamFormul?: string | null; kgkExcelHedefi?: string | null; aktifMi: boolean; terimler: Array<{ id: number; sira: number; hamTerim?: string | null; kaynakTuru: number; kaynakAnahtari: string; operator: number; degerAlani: number; donemDavranisi: number; donemOfseti: number; katsayi: number; isaretPolitikasi: number; zorunluMu: boolean }> }>;
    kontrolKurallari: Array<{ id: number; kod: string; ad: string; tolerans: number; seviye: number; aktifMi: boolean; terimler: Array<{ id: number; taraf: number; sira: number; kalemSabitAnahtari: string; operator: number; katsayi: number; donemDavranisi: number; donemOfseti: number }> }>;
  }>;
};

export type FinansalSurumDogrulamaSonucu = {
  surumId: number;
  surumEtiketi: string;
  eszamanlilikSurumu: number;
  gecerliMi: boolean;
  tablolar: Array<{
    tabloId: number;
    tabloKod: string;
    gecerliMi: boolean;
    snapshotSha256?: string | null;
    sorunlar: Array<{
      kod: number;
      konum: string;
      aciklama: string;
      hedef?: { hedefTuru: number; sabitAnahtar: string } | null;
    }>;
  }>;
};

const jsonGet = async <T>(token: string, path: string): Promise<T> => {
  const response = await fetch(`${url}/FinansalTabloYonetimi${path}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Finansal tablo tanımları okunamadı.");
  }
  return payload as T;
};

export const getFinansalTanimSetleri = (
  token: string,
  filters: { raporlamaStandardi?: number; kapsam?: number; donusumTipi?: number; aktifMi?: boolean } = {}
) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return jsonGet<FinansalTanimSeti[]>(token, `/TanimSetleri${suffix}`);
};

export const getFinansalSurumDetay = (token: string, surumId: number) =>
  jsonGet<FinansalSurumDetay>(token, `/Surumler/${surumId}/Tanim`);

export type FinansalTabloUretimSonucu = {
  arsivYolu: string;
  arsivKaydiYeniMi: boolean;
  kayit: {
    uretimId: string;
    durum: number;
    baslangicTarihi: string;
    bitisTarihi: string;
    yeniMotorSurumu: string;
    tanimSetiSabitAnahtari: string;
    tanimSurumu: string;
    tabloSabitAnahtari: string;
    donemSabitAnahtari: string;
    girdiSabitAnahtari: string;
    girdiSha256: string;
    tanimSnapshotSha256: string;
    yenidenUretimKaynakId?: string | null;
    degerler: Array<{ hedefTuru: number; hedefSabitAnahtari: string; deger: number }>;
    izler: Array<unknown>;
    sorunlar: Array<{ kod: number; seviye: number; aciklama: string }>;
    hataKodu?: string | null;
    aciklama?: string | null;
  };
};

export type FinansalTabloUretimArsivSonucu = {
  arsivYolu: string;
  yeniMi: boolean;
  kayit: FinansalTabloUretimSonucu["kayit"];
};

export type FinansalTabloUretimIstegi = {
  yeniMotorSurumu: string;
  tanimSetiSabitAnahtari: string;
  tanimSurumu: string;
  girdiSabitAnahtari: string;
  girdiSha256: string;
  calistirmaBaglami: {
    donemEslesmeleri: Array<{
      donemDavranisi: number;
      donemOfseti: number;
      donem: { sabitAnahtar: string; baslangicTarihi: string; bitisTarihi: string };
    }>;
    yuvarlamaBasamagi: number;
    yuvarlamaModu: number;
    degerKaynagiBaglami?: { denetlenenId: number; yil: number; konsolidasyonMu: boolean; denetciId: number; testMizanId?: string | null } | null;
  };
  tabloSabitAnahtari: string;
  donemSabitAnahtari: string;
  raporlamaStandardi: number;
  kapsam: number;
  donusumTipi: number;
  tabloTuru: number | string;
  nakitAkisYontemi: number | string;
  gecerlilikTarihi?: string | null;
  tanimSnapshotSha256?: string;
  uretimId?: string;
  yenidenUretimKaynakId?: string | null;
};

export const createFinansalTabloUretimi = async (
  token: string,
  istek: FinansalTabloUretimIstegi
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Uretimler`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "Finansal tablo üretimi tamamlanamadı.");
  }
  return payload as FinansalTabloUretimSonucu;
};

export type FinansalTabloUretimOnizlemeSonucu = {
  saltOkunur: boolean;
  arsivlendiMi: boolean;
  basariliMi: boolean;
  durum: number;
  motorSurumu: string;
  girdiSabitAnahtari: string;
  girdiSha256: string;
  sonuclar: Array<{
    anahtar: {
      tabloSabitAnahtari: string;
      hedefTuru: number;
      hedefSabitAnahtari: string;
      donemSabitAnahtari: string;
    };
    durum: number;
    deger?: number | null;
    izAnahtari?: string | null;
    hataKodu?: string | null;
    aciklama?: string | null;
  }>;
  hataKodu?: string | null;
  aciklama?: string | null;
};

export const previewFinansalTabloUretimi = async (
  token: string,
  istek: FinansalTabloUretimIstegi
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Uretimler/Onizle`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "Finansal tablo önizlemesi tamamlanamadı.");
  }
  return payload as FinansalTabloUretimOnizlemeSonucu;
};

export const getFinansalTabloUretimi = (token: string, uretimId: string) =>
  jsonGet<FinansalTabloUretimArsivSonucu>(token, `/Uretimler/${uretimId}`);

export const getFinansalTabloUretimGecmisi = (token: string, limit = 100) =>
  jsonGet<FinansalTabloUretimArsivSonucu[]>(token, `/Uretimler?limit=${Math.min(500, Math.max(1, limit))}`);

export type FinansalTabloPilotDurumApiSonucu = {
  yeniMotorEtkin: boolean;
  kontrolluPilotOnayi: boolean;
  kgkTaramaZamanlayiciEtkin: boolean;
  hangfireDevreDisi: boolean;
  hangfireGelistirmedeDevreDisi: boolean;
  dbKaliciArsivEtkin: boolean;
  uretimArsivDeposu: "file" | "db+file" | string;
  kgkCiktiArsivDeposu: "file" | "db+file" | string;
  uretimArsiviEtkin: boolean;
  kgkCiktiArsiviEtkin: boolean;
  kgkArsivle: boolean;
  kgkTaramaAralikDakika: number;
  kgkTaramaMaksimumDeneme: number;
  uretimKayitSayisi: number;
  sonUretimTarihi?: string | null;
  kontrolTarihi: string;
};

export const getFinansalTabloPilotDurumu = (token: string) =>
  jsonGet<FinansalTabloPilotDurumApiSonucu>(token, "/PilotDurumu");

export type FinansalTabloKaliciArsivDurumApiSonucu = {
  dbKaliciArsivEtkin: boolean;
  dbServisleriKayitliMi: boolean;
  migrationUygulanmisMi: boolean;
  durum: "KAPALI" | "UYGULANMIS" | "BEKLIYOR" | "ERISILEMIYOR" | string;
  bekleyenMigrationlar: string[];
  kontrolTarihi: string;
};

export const getFinansalTabloKaliciArsivDurumu = (token: string) =>
  jsonGet<FinansalTabloKaliciArsivDurumApiSonucu>(token, "/KaliciArsivDurumu");

export type FinansalTabloArsivDogrulamaKaydiApiSonucu = {
  uretimId: string;
  uretimArsiviOkunabilir: boolean;
  kgkCiktiSayisi: number;
  kgkCiktiDogrulananSayisi: number;
  kgkCiktiHataliSayisi: number;
  hata?: string | null;
};

export type FinansalTabloArsivDogrulamaApiSonucu = {
  kontrolTarihi: string;
  incelenenUretimSayisi: number;
  dogrulananUretimSayisi: number;
  hataVerenUretimSayisi: number;
  incelenenKgkCiktiSayisi: number;
  dogrulananKgkCiktiSayisi: number;
  hataliKgkCiktiSayisi: number;
  kayitlar: FinansalTabloArsivDogrulamaKaydiApiSonucu[];
};

export const getFinansalTabloArsivDogrulamasi = (token: string, limit = 20) =>
  jsonGet<FinansalTabloArsivDogrulamaApiSonucu>(
    token,
    `/ArsivDogrulama?limit=${Math.min(100, Math.max(1, limit))}`
  );

export type FinansalTabloKaliciArsivHazirlikSorunuApiSonucu = {
  uretimId: string;
  kod: string;
  aciklama: string;
};

export type FinansalTabloKaliciArsivHazirlikApiSonucu = {
  kontrolTarihi: string;
  gecisIcinUygunMu: boolean;
  incelenenUretimSayisi: number;
  tasimaIcinHazirUretimSayisi: number;
  eksikTekrarUretimIstegiSayisi: number;
  hashEksigiSayisi: number;
  basarisizUretimSayisi: number;
  sorunlar: FinansalTabloKaliciArsivHazirlikSorunuApiSonucu[];
};

export const getFinansalTabloKaliciArsivHazirligi = (token: string, limit = 100) =>
  jsonGet<FinansalTabloKaliciArsivHazirlikApiSonucu>(
    token,
    `/KaliciArsivHazirlik?limit=${Math.min(500, Math.max(1, limit))}`
  );

export type FinansalTabloArsivKarsilastirmaKaydiApiSonucu = {
  uretimId: string;
  dbUretimiVarMi: boolean;
  dosyaUretimiVarMi: boolean;
  kimliklerEslesiyorMu: boolean;
  dbKgkCiktiSayisi: number;
  dosyaKgkCiktiSayisi: number;
  kgkCiktilariEslesiyorMu: boolean;
  sorun?: string | null;
};

export type FinansalTabloArsivKarsilastirmaApiSonucu = {
  kontrolTarihi: string;
  incelenenUretimSayisi: number;
  dbUretimSayisi: number;
  dosyaUretimSayisi: number;
  eslesenUretimSayisi: number;
  sadeceDbUretimSayisi: number;
  sadeceDosyaUretimSayisi: number;
  kimlikFarkiSayisi: number;
  kgkFarkiSayisi: number;
  gecisIcinEslesikMi: boolean;
  kayitlar: FinansalTabloArsivKarsilastirmaKaydiApiSonucu[];
};

export const getFinansalTabloArsivKarsilastirmasi = (token: string, limit = 100) =>
  jsonGet<FinansalTabloArsivKarsilastirmaApiSonucu>(
    token,
    `/KaliciArsivKarsilastirma?limit=${Math.min(500, Math.max(1, limit))}`
  );

export type FinansalTabloGolgeKarsilastirmaIstegi = {
  kaynakPaketAnahtari: string;
  kaynakPaketSha256: string;
  legacyMotorSurumu: string;
  yeniMotorSurumu: string;
  yeniTanimSetiSabitAnahtari: string;
  yeniTanimSurumu: string;
  girdiSabitAnahtari: string;
  girdiSha256: string;
  calistirmaBaglami: FinansalTabloUretimIstegi["calistirmaBaglami"];
  politikaKodu: string;
  mutlakTolerans: number;
  yeniTabloSabitAnahtari: string;
  yeniDonemSabitAnahtari: string;
  yeniRaporlamaStandardi?: number | null;
  yeniKapsam?: number | null;
  yeniDonusumTipi?: number | null;
  yeniTabloTuru?: number | null;
  yeniNakitAkisYontemi?: number | null;
  yeniGecerlilikTarihi?: string | null;
  yeniTanimSnapshotSha256?: string;
};

export type FinansalTabloGolgeKarsilastirmaSonucu = {
  durum: number;
  basariliMi: boolean;
  karsilastirma?: {
    durum: number;
    sonucSha256?: string | null;
    ozet?: { legacyKayitSayisi: number; yeniKayitSayisi: number; eslesenAnahtarSayisi: number; birlesikAnahtarSayisi: number; siniflar: Array<{ sinif: number; adet: number }> } | null;
    farklar: Array<{ anahtar: { tabloSabitAnahtari: string; hedefTuru: number; hedefSabitAnahtari: string; donemSabitAnahtari: string }; sinif: number; mutlakFark?: number | null; legacy?: { deger?: number | null } | null; yeni?: { deger?: number | null } | null }>;
    sorunlar: Array<{ kod: number; konum: string; aciklama: string }>;
  } | null;
  sorunlar: Array<{ kod: number; asama: number; konum: string; aciklama: string }>;
};

export const compareFinansalTabloGolge = async (
  token: string,
  istek: FinansalTabloGolgeKarsilastirmaIstegi
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Golge/Karsilastir`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "Legacy/yeni motor gölge karşılaştırması çalıştırılamadı.");
  }
  return payload as FinansalTabloGolgeKarsilastirmaSonucu;
};

export const replayFinansalTabloUretimi = async (
  token: string,
  uretimId: string
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Uretimler/${uretimId}/YenidenUret`, {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "Geçmiş finansal tablo yeniden üretilemedi.");
  }
  return payload as FinansalTabloUretimSonucu;
};

export type FinansalTabloKgkRenderSonucu = {
  dosyaAdi: string;
  sha256: string | null;
};

export const renderFinansalTabloKgk = async (
  token: string,
  uretimId: string,
  sablon: File,
  eslesmelerJson: string
) => {
  const formData = new FormData();
  formData.append("sablon", sablon);
  formData.append("eslesmelerJson", eslesmelerJson);
  const response = await fetch(`${url}/FinansalTabloYonetimi/Uretimler/${uretimId}/KgkRender`, {
    method: "POST",
    headers: { accept: "application/octet-stream", Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK finansal tablo çıktısı oluşturulamadı.");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const dosyaAdi = utf8Name ? decodeURIComponent(utf8Name) : plainName || `${uretimId}-kgk-cikti.xlsx`;
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = dosyaAdi;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
  return { dosyaAdi, sha256: response.headers.get("x-finansaltablo-kgk-sha256") } as FinansalTabloKgkRenderSonucu;
};

export type FinansalTabloKgkUretimArsivKaydi = {
  uretimId: string;
  sablonDosyaAdi: string;
  ciktiDosyaAdi: string;
  sablonSha256: string;
  ciktiSha256: string;
  eslestirmeSha256: string;
  icerikUzunlugu: number;
  arsivYolu: string;
  arsivlemeTarihi: string;
  yeniMi: boolean;
};

export const getFinansalTabloKgkCiktilari = (
  token: string,
  uretimId: string,
  limit = 100
) => jsonGet<FinansalTabloKgkUretimArsivKaydi[]>(
  token,
  `/Uretimler/${uretimId}/KgkCiktilari?limit=${Math.min(500, Math.max(1, limit))}`
);

export const downloadFinansalTabloKgkCiktisi = async (
  token: string,
  uretimId: string,
  ciktiSha256: string
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Uretimler/${uretimId}/KgkCiktilari/${encodeURIComponent(ciktiSha256)}`, {
    headers: { accept: "application/octet-stream", Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.detail || payload?.message || payload?.Message || "Arşivlenmiş KGK çıktısı indirilemedi.");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const dosyaAdi = utf8Name ? decodeURIComponent(utf8Name) : plainName || `${uretimId}-kgk-cikti.xlsx`;
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = dosyaAdi;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
  return response.headers.get("x-finansaltablo-kgk-sha256");
};

export type FinansalSurumKarsilastirma = {
  solSurumId: number;
  solSurumEtiketi: string;
  sagSurumId: number;
  sagSurumEtiketi: string;
  farkSayisi: number;
  farklar: Array<{
    nesneTuru: string;
    anahtar: string;
    degisiklikTuru: string;
    alan?: string | null;
    solDeger?: string | null;
    sagDeger?: string | null;
  }>;
};

export type FinansalSurumYonetimiDurumu = {
  etkin: boolean;
  eskiAkisKorunuyor: boolean;
  acikSurumSecimiZorunlu: boolean;
  aciklama: string;
};

export type FinansalSurumDevreyeAlmaSonucu = {
  surumId: number;
  tanimSetiId: number;
  durum: number | string;
  etkinlikTarihi: string;
  onayTarihi: string;
  eszamanlilikSurumu: number;
  kullanimdanKaldirilanSurumIdleri: number[];
  onayAciklamasi: string;
};

export const getFinansalSurumYonetimiDurumu = (token: string) =>
  jsonGet<FinansalSurumYonetimiDurumu>(token, "/SurumYonetimi/Durum");

export const activateFinansalSurum = async (
  token: string,
  surumId: number,
  istek: { beklenenEszamanlilikSurumu: number; etkinlikTarihi: string; onayAciklamasi: string }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/DevreyeAl`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Sürüm devreye alınamadı.");
  }
  return payload as FinansalSurumDevreyeAlmaSonucu;
};

export const compareFinansalSurumler = (
  token: string,
  solSurumId: number,
  sagSurumId: number
) => jsonGet<FinansalSurumKarsilastirma>(token, `/Surumler/${solSurumId}/Karsilastir/${sagSurumId}`);

export type FinansalSurumMetaGuncelleme = {
  etiket: string;
  gecerlilikBaslangici: string;
  gecerlilikBitisi?: string | null;
  aciklama?: string | null;
  beklenenEszamanlilikSurumu: number;
};

export const updateFinansalSurumMeta = async (
  token: string,
  surumId: number,
  istek: FinansalSurumMetaGuncelleme
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/Meta`, {
    method: "PUT",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Sürüm metadata güncellenemedi.");
  }
  return payload as { success: boolean; surumId: number; eszamanlilikSurumu: number; guncellemeTarihi: string };
};

export const validateFinansalSurum = async (
  token: string,
  surumId: number,
  beklenenEszamanlilikSurumu: number
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/Dogrula`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ beklenenEszamanlilikSurumu }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Taslak sürüm teknik olarak doğrulanamadı.");
  }
  return payload as FinansalSurumDogrulamaSonucu;
};

export type FinansalKalemGuncelleme = {
  ad: string;
  kod?: string | null;
  sira: number;
  kalemTuru: number;
  eksen: number;
  varsayilanGorunurMu: boolean;
  ustKalemId?: number | null;
  beklenenEszamanlilikSurumu: number;
};

export const updateFinansalKalem = async (
  token: string,
  surumId: number,
  tabloId: number,
  kalemId: number,
  istek: FinansalKalemGuncelleme
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/Tablolar/${tabloId}/Kalemler/${kalemId}`, {
    method: "PUT",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Finansal tablo kalemi güncellenemedi.");
  }
  return payload as { success: boolean; kalemId: number; surumId: number; eszamanlilikSurumu: number; guncellemeTarihi: string };
};

export type FinansalKuralTerimiGuncelleme = {
  sira: number;
  hamTerim?: string | null;
  kaynakTuru: number;
  kaynakAnahtari: string;
  operator: number;
  degerAlani: number;
  donemDavranisi: number;
  donemOfseti: number;
  katsayi: number;
  isaretPolitikasi: number;
  zorunluMu: boolean;
};

export type FinansalKuralGuncelleme = {
  hesaplamaTuru: number;
  isaretPolitikasi: number;
  bosDegerPolitikasi: number;
  sabitDeger?: number | null;
  aciklama?: string | null;
  hamFormul?: string | null;
  kgkExcelHedefi?: string | null;
  aktifMi: boolean;
  terimler: FinansalKuralTerimiGuncelleme[];
  beklenenEszamanlilikSurumu: number;
};

export const updateFinansalKural = async (
  token: string,
  surumId: number,
  tabloId: number,
  kuralId: number,
  istek: FinansalKuralGuncelleme
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/Tablolar/${tabloId}/Kurallar/${kuralId}`, {
    method: "PUT",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Hesaplama kuralı güncellenemedi.");
  }
  return payload as { success: boolean; kuralId: number; surumId: number; eszamanlilikSurumu: number; guncellemeTarihi: string };
};

export type FinansalKuralOlusturma = Omit<FinansalKuralGuncelleme, "beklenenEszamanlilikSurumu"> & {
  kalemId: number;
  beklenenEszamanlilikSurumu: number;
};

export const createFinansalKural = async (
  token: string,
  surumId: number,
  tabloId: number,
  istek: FinansalKuralOlusturma
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/Tablolar/${tabloId}/Kurallar`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Hesaplama kuralı oluşturulamadı.");
  }
  return payload as { success: boolean; kuralId: number; surumId: number; tabloId: number; kalemId: number; eszamanlilikSurumu: number; guncellemeTarihi: string };
};

export const publishFinansalSurum = async (
  token: string,
  surumId: number,
  beklenenEszamanlilikSurumu: number
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/Yayinla`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ beklenenEszamanlilikSurumu }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Sürüm yayınlanamadı.");
  }
  return payload as { success: boolean; surumId: number; durum: number | string; eszamanlilikSurumu: number; onayTarihi: string };
};

export const cloneFinansalSurum = async (
  token: string,
  surumId: number,
  istek: { etiket: string; gecerlilikBaslangici: string; gecerlilikBitisi?: string | null; aciklama?: string | null; beklenenKaynakEszamanlilikSurumu?: number }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/Klonla`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Taslak sürüm oluşturulamadı.");
  }
  return payload as { success: boolean; kaynakSurumId: number; surumId: number; surumNo: number; eszamanlilikSurumu: number; durum: number };
};

export type KgkFormatKontrolSonucu = {
  kaynakUrl: string;
  kontrolTarihi: string;
  sayfaSha256: string;
  bulunanDosyaSayisi: number;
  degisenDosyaSayisi: number;
  dosyalar: Array<{
    grup: string;
    baslik: string;
    url: string;
    dosyaAdi: string;
    dosyaTuru: string;
    erisilebilirMi: boolean;
    httpDurumu?: number | null;
    etag?: string | null;
    sonDegistirmeTarihi?: string | null;
    icerikUzunlugu?: number | null;
    sha256?: string | null;
    oncekiSha256?: string | null;
    degistiMi: boolean;
    karsilastirmaVarMi: boolean;
    hata?: string | null;
  }>;
};

export const kontrolEtKgkFormatlari = async (
  token: string,
  istek: { icerikHashleriniHesapla: boolean; oncekiDosyalar?: Array<{ url: string; sha256?: string | null; etag?: string | null; icerikUzunlugu?: number | null }> } = { icerikHashleriniHesapla: false }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/Kontrol`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK formatları kontrol edilemedi.");
  }
  return payload as KgkFormatKontrolSonucu;
};

export const downloadKgkFormat = async (token: string, fileUrl: string) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/Dosya?url=${encodeURIComponent(fileUrl)}`, {
    headers: {
      accept: "application/octet-stream",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK format dosyası indirilemedi.");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  const fallbackName = (() => {
    try {
      return decodeURIComponent(new URL(fileUrl).pathname.split("/").pop() || "kgk-format");
    } catch {
      return "kgk-format";
    }
  })();
  const fileName = utf8Name ? decodeURIComponent(utf8Name) : plainName || fallbackName;
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 0);
  return response.headers.get("x-kgk-sha256");
};

export type KgkArsivKaydi = {
  url: string;
  dosyaAdi: string;
  sha256: string;
  icerikUzunlugu: number;
  arsivYolu: string;
  arsivlemeTarihi: string;
  yeniMi: boolean;
};

export const archiveKgkFormat = async (token: string, fileUrl: string) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/Arsivle`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: fileUrl }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK formatı arşivlenemedi.");
  }
  return payload as KgkArsivKaydi;
};

export type KgkTaramaSonucu = {
  taramaId: string;
  baslangic: string;
  bitis: string;
  kontrol: KgkFormatKontrolSonucu;
  arsivler: KgkArsivKaydi[];
  hatalar: Array<{ url: string; dosyaAdi: string; denemeSayisi: number; hata: string }>;
  toplamDenemeSayisi: number;
};

export type KgkTaramaGecmisi = {
  taramaId: string;
  baslangic: string;
  bitis: string;
  kaynakUrl: string;
  sayfaSha256: string;
  bulunanDosyaSayisi: number;
  degisenDosyaSayisi: number;
  arsivlenenDosyaSayisi: number;
  hataSayisi: number;
  toplamDenemeSayisi: number;
};

export const scanAndArchiveKgkFormats = async (
  token: string,
  istek: {
    icerikHashleriniHesapla: boolean;
    oncekiDosyalar?: Array<{ url: string; sha256?: string | null; etag?: string | null; icerikUzunlugu?: number | null }>;
    arsivle: boolean;
    maksimumDeneme: number;
  }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/TaraVeArsivle`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK taraması tamamlanamadı.");
  }
  return payload as KgkTaramaSonucu;
};

export const getKgkScanHistory = async (token: string, limit = 20) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/TaramaGecmisi?limit=${limit}`, {
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK tarama geçmişi okunamadı.");
  }
  return payload as KgkTaramaGecmisi[];
};

export type KgkWorkbookFarkSonucu = {
  oncekiDosyaAdi: string;
  yeniDosyaAdi: string;
  oncekiSha256: string;
  yeniSha256: string;
  makroVarMi: boolean;
  yapisalDegisiklikVarMi: boolean;
  farkSayisi: number;
  oncekiKalemSayisi: number;
  yeniKalemSayisi: number;
  semantikDegisiklikVarMi: boolean;
  oncekiFormulSayisi: number;
  yeniFormulSayisi: number;
  formulDegisikligiVarMi: boolean;
  kalemFarklari: Array<{
    sabitAnahtar: string;
    degisiklikTuru: string;
    oncekiKalem?: {
      sabitAnahtar: string;
      sayfaAdi: string;
      satirNo: number;
      ad: string;
      girinti: number;
      ustSabitAnahtar?: string | null;
      kalemTuru: string;
      etiketKolonu: string;
    } | null;
    yeniKalem?: {
      sabitAnahtar: string;
      sayfaAdi: string;
      satirNo: number;
      ad: string;
      girinti: number;
      ustSabitAnahtar?: string | null;
      kalemTuru: string;
      etiketKolonu: string;
    } | null;
  }>;
  formulFarklari: Array<{
    sabitAnahtar: string;
    degisiklikTuru: string;
    oncekiFormul?: KgkWorkbookFormulu | null;
    yeniFormul?: KgkWorkbookFormulu | null;
  }>;
  farklar: Array<{
    nesneTuru: string;
    anahtar: string;
    degisiklikTuru: string;
    oncekiDeger?: string | null;
    yeniDeger?: string | null;
  }>;
};

export type KgkWorkbookFormulu = {
  sabitAnahtar: string;
  kalemSabitAnahtari: string;
  sayfaAdi: string;
  hedefHucreAdresi: string;
  kaynakHucreleri: string[];
  hamFormul: string;
  terimler: Array<{
    sira: number;
    kaynakKalemSabitAnahtari: string;
    operator: string;
    kaynakSayfaAdi: string;
    kaynakHucreAdresi: string;
  }>;
  dogrulamaHatalari: string[];
};

export const compareKgkWorkbooks = async (
  token: string,
  oncekiDosya: File,
  yeniDosya: File
) => {
  const formData = new FormData();
  formData.append("onceki", oncekiDosya);
  formData.append("yeni", yeniDosya);
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/WorkbookKarsilastir`, {
    method: "POST",
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK workbook karşılaştırılamadı.");
  }
  return payload as KgkWorkbookFarkSonucu;
};

export const compareArchivedKgkWorkbooks = async (
  token: string,
  istek: { url: string; oncekiSha256: string; yeniSha256: string }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/ArsivWorkbookKarsilastir`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: istek.url,
      oncekiSha256: istek.oncekiSha256,
      yeniSha256: istek.yeniSha256,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "Arşivlenmiş KGK workbook karşılaştırılamadı.");
  }
  return payload as KgkWorkbookFarkSonucu;
};

export const applyKgkKalemFarklari = async (
  token: string,
  surumId: number,
  istek: {
    beklenenEszamanlilikSurumu: number;
    kalemFarklari: KgkWorkbookFarkSonucu["kalemFarklari"];
    sayfaTabloEslestirmeleri?: Record<string, number>;
    aciklama?: string | null;
  }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/KgkKalemFarklariniUygula`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK kalem farkları taslağa uygulanamadı.");
  }
  return payload as {
    success: boolean;
    surumId: number;
    eszamanlilikSurumu: number;
    eklenenKalemSayisi: number;
    pasifeAlinanKalemSayisi: number;
    guncellenenKalemSayisi: number;
    islenenAnahtarlar: string[];
  };
};

export const applyKgkFormulFarklari = async (
  token: string,
  surumId: number,
  istek: {
    beklenenEszamanlilikSurumu: number;
    formulFarklari: KgkWorkbookFarkSonucu["formulFarklari"];
    sayfaTabloEslestirmeleri?: Record<string, number>;
    aciklama?: string | null;
  }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${surumId}/KgkFormulFarklariniUygula`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK formül farkları taslağa uygulanamadı.");
  }
  return payload as {
    success: boolean;
    surumId: number;
    eszamanlilikSurumu: number;
    eklenenFormulSayisi: number;
    guncellenenFormulSayisi: number;
    pasifeAlinanFormulSayisi: number;
    yazilanTerimSayisi: number;
    islenenAnahtarlar: string[];
  };
};
