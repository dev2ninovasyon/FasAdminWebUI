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
  kgkAnaSurumId?: number | null;
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
    kurallar: Array<{ id: number; kalemId?: number | null; hucreId?: number | null; hesaplamaTuru: number; isaretPolitikasi: number; bosDegerPolitikasi: number; sabitDeger?: number | null; aciklama?: string | null; hamFormul?: string | null; kgkExcelHedefi?: string | null; aktifMi: boolean; terimler: Array<{ id: number; sira: number; hamTerim?: string | null; kaynakTuru: number; kaynakAnahtari: string; operator: number; degerAlani: number; donemDavranisi: number; donemOfseti: number; katsayi: number; isaretPolitikasi: number; zorunluMu: boolean; hesaplamaSekli: number; karsilastirmaDegerAlani: number; karsilastirmaDonemDavranisi: number; karsilastirmaDonemOfseti: number; karsilastirmaIsaretPolitikasi: number; farkYonu: number; sonucIsaretPolitikasi: number; katsayiKaynakTuru?: number | null; katsayiKaynakAnahtari?: string | null; katsayiDonemDavranisi?: number; katsayiDonemOfseti?: number; asgariMutlakFark?: number }> }>;
    kontrolKurallari: Array<{ id: number; kod: string; ad: string; tolerans: number; seviye: number; aktifMi: boolean; terimler: Array<{ id: number; taraf: number; sira: number; kalemSabitAnahtari: string; operator: number; katsayi: number; donemDavranisi: number; donemOfseti: number }> }>;
  }>;
};

export type FinansalTabloTabloRevizyonu = {
  id: number;
  surumId: number;
  tabloId: number;
  tabloKod: string;
  revizyonNo: number;
  surumEszamanlilikSurumu: number;
  islem: string;
  hedefAnahtar?: string | null;
  aciklama: string;
  degisiklikJson?: string | null;
  kullaniciId?: number | null;
  tarih: string;
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

// API enum alanlarını metin olarak döndürür ("Veri", "Satir"); formlar sayısal kod beklediği için
// tanım yanıtı tek noktada sayısal koda çevrilir.
const ENUM_KODLARI: Record<string, Record<string, number>> = {
  kalemTuru: { Baslik: 1, Veri: 2, AraToplam: 3, Toplam: 4, Manuel: 5 },
  eksen: { Satir: 1, Dikey: 2, Yatay: 3 },
  hesaplamaTuru: { HesapFormulu: 1, SatirFormulu: 2, AltKalemToplami: 3, SabitDeger: 4, ManuelDeger: 5 },
  isaretPolitikasi: { OlduguGibi: 1, MutlakDeger: 2, YalnizPozitif: 3, YalnizNegatif: 4, TersIsaret: 5 },
  bosDegerPolitikasi: { SifirKabulEt: 1, Uyari: 2, Hata: 3 },
  kaynakTuru: { HesapKodu: 1, HesapKoduOneki: 2, Kalem: 3, OncekiUretimDegeri: 4, SistemParametresi: 5, Sabit: 6 },
  operator: { Topla: 1, Cikar: 2 },
  degerAlani: {
    Bakiye: 1, Borc: 2, Alacak: 3, RaporBorc: 4, RaporAlacak: 5, KontrolBakiye: 6, BakiyeTransferFisiHaric: 7,
    RaporBorcTransferFisiHaric: 8, RaporAlacakTransferFisiHaric: 9, KontrolBakiyeTransferFisiHaric: 10,
  },
  donemDavranisi: { CariDonem: 1, OncekiDonem: 2, Acilis: 3, Degisim: 4, Ozel: 5 },
  hesaplamaSekli: { Deger: 1, DonemFarki: 2 },
  farkYonu: { KaynakEksiKarsilastirma: 1, KarsilastirmaEksiKaynak: 2 },
  seviye: { Bilgi: 1, Uyari: 2, Hata: 3 },
  taraf: { Sol: 1, Sag: 2 },
  kapsam: { Munferit: 1, Konsolide: 2 },
  donusumTipi: { Normal: 1, EnflasyonDuzeltilmis: 2 },
};
const ENUM_ESLERI: Record<string, string> = {
  karsilastirmaDegerAlani: "degerAlani", karsilastirmaDonemDavranisi: "donemDavranisi",
  karsilastirmaIsaretPolitikasi: "isaretPolitikasi", sonucIsaretPolitikasi: "isaretPolitikasi",
  katsayiKaynakTuru: "kaynakTuru", katsayiDonemDavranisi: "donemDavranisi",
};

const enumlariSayiyaCevir = <T>(deger: T): T => {
  if (Array.isArray(deger)) return deger.map(enumlariSayiyaCevir) as T;
  if (!deger || typeof deger !== "object") return deger;
  return Object.fromEntries(Object.entries(deger).map(([alan, icerik]) => {
    const kodlar = ENUM_KODLARI[ENUM_ESLERI[alan] ?? alan];
    if (kodlar && typeof icerik === "string" && icerik in kodlar) return [alan, kodlar[icerik]];
    return [alan, enumlariSayiyaCevir(icerik)];
  })) as T;
};

export const getFinansalSurumDetay = async (token: string, surumId: number) =>
  enumlariSayiyaCevir(await jsonGet<FinansalSurumDetay>(token, `/Surumler/${surumId}/Tanim`));

export const getFinansalTabloTabloRevizyonlari = (token: string, surumId: number) =>
  jsonGet<FinansalTabloTabloRevizyonu[]>(token, `/Surumler/${surumId}/TabloRevizyonlari`);

export type FinansalTabloAnaTabloGecisi = {
  id: number;
  denetlenenId: number;
  yil: number;
  konsolidasyonMu: boolean;
  surumId: number;
  surumEtiketi: string;
  surumEszamanlilikSurumu: number;
  testMizanId: string;
  testMizanSha256: string;
  hazirlikKanitiSha256: string;
  dogrulananTabloSayisi: number;
  dogrulananDonemSayisi: number;
  durum: 1 | 2 | 3;
  yeniMotorEtkin: boolean;
  hazirlikTarihi: string;
  etkinlestirmeTarihi?: string | null;
  geriAlmaTarihi?: string | null;
  aciklama?: string | null;
  eszamanlilikSurumu: number;
};

const anaTabloGecisIstegi = async <T>(token: string, path: string, body: unknown): Promise<T> => {
  const response = await fetch(`${url}/FinansalTabloYonetimi${path}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "Ana tablo geçişi tamamlanamadı.");
  }
  return payload as T;
};

export const getFinansalTabloAnaTabloGecisleri = (
  token: string,
  filtre: { denetlenenId?: number; yil?: number } = {}
) => {
  const query = new URLSearchParams();
  if (filtre.denetlenenId) query.set("denetlenenId", String(filtre.denetlenenId));
  if (filtre.yil) query.set("yil", String(filtre.yil));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return jsonGet<FinansalTabloAnaTabloGecisi[]>(token, `/AnaTabloGecisleri${suffix}`);
};

export type AnaTabloGecmisKaydi = {
  id: number;
  denetlenenId: number;
  yil: number;
  konsolidasyonMu: boolean;
  hedefSurumId: number;
  arsivlemeTarihi: string;
  satirSayisi: number;
  ozkaynakSatirSayisi: number;
  icerikSha256: string;
};

export type AnaTabloGecmisSatiri = {
  Id: number;
  TabloAdi: string;
  KalemKodu: string;
  KalemAdi: string;
  Dipnot: string | null;
  TutarYil1: number;
  TutarYil2: number;
  TutarYil3: number;
};

export type AnaTabloGecmisOzkaynakSatiri = {
  Id: number;
  DikeyKalemAdi: string;
  YatayKalemAdi: string;
  Dipnot: string | null;
  Tutar: number;
};

export const getFinansalTabloAnaTabloGecmisi = (
  token: string,
  filtre: { denetlenenId: number; yil: number; konsolidasyonMu: boolean; sayfa: number }
) => {
  const query = new URLSearchParams(Object.entries(filtre).map(([key, value]) => [key, String(value)]));
  return jsonGet<{ kayitlar: AnaTabloGecmisKaydi[]; toplam: number; sayfa: number; sayfaBoyutu: number }>(
    token, `/AnaTabloGecmisi?${query}`
  );
};

export const getFinansalTabloAnaTabloGecmisiDetayi = (token: string, id: number) =>
  jsonGet<AnaTabloGecmisKaydi & {
    satirlar: AnaTabloGecmisSatiri[];
    ozkaynaklar: AnaTabloGecmisOzkaynakSatiri[];
  }>(token, `/AnaTabloGecmisi/${id}`);

export const prepareFinansalTabloAnaTabloGecisi = (
  token: string,
  istek: { surumId: number; testMizanId: string; aciklama?: string | null }
) => anaTabloGecisIstegi<FinansalTabloAnaTabloGecisi>(token, "/AnaTabloGecisleri/Hazirla", istek);

export const activateFinansalTabloAnaTabloGecisi = (
  token: string,
  id: number,
  istek: { beklenenEszamanlilikSurumu: number; onayMetni: string; aciklama?: string | null }
) => anaTabloGecisIstegi<FinansalTabloAnaTabloGecisi>(token, `/AnaTabloGecisleri/${id}/Etkinlestir`, istek);

export const rollbackFinansalTabloAnaTabloGecisi = (
  token: string,
  id: number,
  istek: { beklenenEszamanlilikSurumu: number; aciklama?: string | null }
) => anaTabloGecisIstegi<FinansalTabloAnaTabloGecisi>(token, `/AnaTabloGecisleri/${id}/GeriAl`, istek);

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

export type FinansalTabloSistemDurumApiSonucu = {
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

export const getFinansalTabloSistemDurumu = (token: string) =>
  jsonGet<FinansalTabloSistemDurumApiSonucu>(token, "/SistemDurumu");

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

export type FinansalTabloOtomatikKgkExcelSonucu = {
  dosyaAdi: string;
  sha256: string | null;
  sablonSha256: string | null;
  kaynakDonemKodu: string | null;
  tanimSurumu: string | null;
  doldurulanHucreSayisi: number;
  eslesmeyenDegerSayisi: number;
};

export const createAutomaticFinansalTabloKgkExcel = async (
  token: string,
  uretimId: string
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Uretimler/${uretimId}/KgkExcel/Otomatik`, {
    method: "POST",
    headers: { accept: "application/octet-stream", Authorization: `Bearer ${token}` },
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
  const sayiyaDonustur = (deger: string | null) => {
    const sayi = Number(deger);
    return Number.isFinite(sayi) ? sayi : 0;
  };
  const kodlanmisSurum = response.headers.get("x-finansaltablo-tanim-surum");
  return {
    dosyaAdi,
    sha256: response.headers.get("x-finansaltablo-kgk-sha256"),
    sablonSha256: response.headers.get("x-finansaltablo-kgk-sablon-sha256"),
    kaynakDonemKodu: response.headers.get("x-finansaltablo-kgk-kaynak-donem"),
    tanimSurumu: kodlanmisSurum ? decodeURIComponent(kodlanmisSurum) : null,
    doldurulanHucreSayisi: sayiyaDonustur(response.headers.get("x-finansaltablo-kgk-doldurulan-hucre")),
    eslesmeyenDegerSayisi: sayiyaDonustur(response.headers.get("x-finansaltablo-kgk-eslesmeyen-deger")),
  } as FinansalTabloOtomatikKgkExcelSonucu;
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
  mevcutRaporlarKorunuyor: boolean;
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
  hesaplamaSekli: number;
  karsilastirmaDegerAlani: number;
  karsilastirmaDonemDavranisi: number;
  karsilastirmaDonemOfseti: number;
  karsilastirmaIsaretPolitikasi: number;
  farkYonu: number;
  sonucIsaretPolitikasi: number;
  katsayiKaynakTuru?: number | null;
  katsayiKaynakAnahtari?: string | null;
  katsayiDonemDavranisi: number;
  katsayiDonemOfseti: number;
  asgariMutlakFark: number;
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
  kaynakDonemKodu?: string | null;
  kaynakDonemAdi?: string | null;
  gecerlilikBaslangici?: string | null;
  gecerlilikBitisi?: string | null;
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

export type KgkArsivKalemi = {
  sabitAnahtar: string;
  sayfaAdi: string;
  satirNo: number;
  ad: string;
  girinti: number;
  ustSabitAnahtar?: string | null;
  kalemTuru: string;
  etiketKolonu: string;
};

export const getKgkArsivKalemleri = (token: string, dosyaUrl: string, sha256: string) => {
  const query = new URLSearchParams({ url: dosyaUrl, sha256 });
  return jsonGet<{ dosyaAdi: string; sha256: string; kalemSayisi: number; kalemler: KgkArsivKalemi[] }>(
    token, `/Kgk/ArsivKalemleri?${query}`
  );
};

export type KgkKapsamFarki = {
  eslesmeAnahtari: string;
  durum: "Belirsiz" | "YalnizKonsolide" | "YalnizMunferit" | "YapiFarki";
  munferit?: KgkArsivKalemi | null;
  konsolide?: KgkArsivKalemi | null;
};

export type KgkKapsamKarsilastirmaSonucu = {
  munferitKalemSayisi: number;
  konsolideKalemSayisi: number;
  ortakKalemSayisi: number;
  belirsizEslesmeSayisi: number;
  farklar: KgkKapsamFarki[];
};

export const getKgkKapsamFarklari = (token: string, munferit: { url: string; sha256: string }, konsolide: { url: string; sha256: string }) => {
  const query = new URLSearchParams({
    munferitUrl: munferit.url, munferitSha256: munferit.sha256,
    konsolideUrl: konsolide.url, konsolideSha256: konsolide.sha256,
  });
  return jsonGet<KgkKapsamKarsilastirmaSonucu>(token, `/Kgk/KapsamFarklari?${query}`);
};

export type KgkKaynakDonemi = {
  kod: string;
  ad: string;
  gecerlilikBaslangici?: string | null;
  gecerlilikBitisi?: string | null;
  kaynakUrl: string;
  onerilenMi: boolean;
};

export const getKgkKaynakDonemleri = (
  token: string,
  raporlamaDonemiBitisTarihi?: string
) => jsonGet<KgkKaynakDonemi[]>(
  token,
  `/Kgk/KaynakDonemleri${raporlamaDonemiBitisTarihi ? `?raporlamaDonemiBitisTarihi=${encodeURIComponent(raporlamaDonemiBitisTarihi)}` : ""}`
);

export const kontrolEtKgkFormatlari = async (
  token: string,
  istek: {
    icerikHashleriniHesapla: boolean;
    oncekiDosyalar?: Array<{ url: string; sha256?: string | null; etag?: string | null; icerikUzunlugu?: number | null }>;
    kaynakDonemKodu?: string | null;
    raporlamaDonemiBitisTarihi?: string | null;
  } = { icerikHashleriniHesapla: false }
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
  anaSurumId?: number | null;
  anaSurumNo?: number | null;
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
  kaynakDonemKodu?: string | null;
  kaynakDonemAdi?: string | null;
  anaSurumId?: number | null;
  anaSurumNo?: number | null;
};

export type KgkAnaSurum = {
  id: number;
  kaynakDonemKodu: string;
  surumNo: number;
  kaynakUrl: string;
  dosyaManifestiSha256: string;
  dosyaSayisi: number;
  olusturmaTarihi: string;
  surumler: Array<{
    id: number;
    tanimSetiId: number;
    tanimSetiKodu: string;
    surumNo: number;
    durum: number | string;
    eszamanlilikSurumu: number;
    ornekMizanHazirMi: boolean;
    birlesikTaslakId?: number | null;
    birlesikFormulSurumuId?: number | null;
    raporlamaStandardi?: number | string;
    kapsam?: number | string;
  }>;
};

export const getKgkAnaSurumler = (token: string) =>
  jsonGet<KgkAnaSurum[]>(token, "/Kgk/AnaSurumler");

export type KgkBirlesikTaslakOzeti = {
  id: number;
  kgkAnaSurumId: number;
  raporlamaStandardi: number;
  olusturucuSurumu: number;
  tabloSayisi: number;
  ortakKalemSayisi: number;
  kapsamaOzelKalemSayisi: number;
  belirsizEslesmeSayisi: number;
};

export const createKgkBirlesikTaslak = async (
  token: string, anaSurumId: number, raporlamaStandardi: number
): Promise<KgkBirlesikTaslakOzeti> => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/AnaSurumler/${anaSurumId}/BirlesikTaslak`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ raporlamaStandardi }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Birleşik KGK taslağı oluşturulamadı.");
  return payload as KgkBirlesikTaslakOzeti;
};

export type KgkKaynakKalemi = {
  sabitAnahtar: string;
  sayfaAdi: string;
  satirNo: number;
  ad: string;
  girinti: number;
  ustSabitAnahtar: string | null;
  kalemTuru: string;
};

export type KgkBirlesikSatir = {
  eslesmeAnahtari: string;
  durum: string;
  munferitMi: boolean;
  konsolideMi: boolean;
  munferitKaynaklari?: KgkKaynakKalemi[] | null;
  konsolideKaynaklari?: KgkKaynakKalemi[] | null;
};

export type KgkMatrisSutunu = {
  sabitAnahtar: string;
  sayfaAdi: string;
  sutun: string;
  baslikSatiri: number;
  ad: string;
  ustSabitAnahtar: string | null;
  ilkSutunNo: number;
  sonSutunNo: number;
};

export type KgkMatrisHucresi = { sayfaAdi: string; satirNo: number; sutun: string; excelFormuluMu: boolean; hamFormul: string | null };
export type KgkBirlesikKaynak = { baslik?: string | null; sutunlar?: KgkMatrisSutunu[] | null; matrisHucreleri?: KgkMatrisHucresi[] | null };

export type KgkBirlesikTaslakDetay = {
  ozet: KgkBirlesikTaslakOzeti;
  guncelOlusturucuSurumu: number;
  icerik: { raporlamaStandardi: number; tablolar: Array<{
    ad: string; kalemler: KgkBirlesikSatir[];
    munferit: KgkBirlesikKaynak; konsolide: KgkBirlesikKaynak;
  }> };
};

export type KgkBirlesikFormulVaryanti = {
  tabloAdi: string;
  eslesmeAnahtari: string;
  yataySutunAnahtari: string | null;
  kapsam: number;
  donusumTipi: number;
  hamFormul: string | null;
  dipnot: string | null;
  hesaplamaKurali: null;
  kaynak: string | null;
};

export type KgkExcelFormulAdaylari = {
  taslakId: number; formulSurumNo: number; toplam: number; eklenecek: number;
  mevcutAyni: number; yoneticiFormuluVar: number;
  adaylar: Array<{ varyant: KgkBirlesikFormulVaryanti; hucreAdresi: string; durum: string; aciklama: string | null }>;
};

export const getKgkExcelFormulAdaylari = async (token: string, id: number) =>
  enumlariSayiyaCevir(await jsonGet<KgkExcelFormulAdaylari>(token,
    `/Kgk/BirlesikTaslaklar/${id}/KgkExcelFormulAdaylari`));

export type KgkBirlesikFormulSurumu = {
  id: number;
  birlesikTaslakId: number;
  surumNo: number;
  kaynakSurumId: number | null;
  kaynakSurum?: { id: number; birlesikTaslakId: number; surumNo: number } | null;
  icerikSha256: string;
  aciklama: string;
  olusturmaTarihi: string;
  varyantlar: KgkBirlesikFormulVaryanti[];
};

export const previewKgkBirlesikTaslak = async (
  token: string, id: number, formulSurumNo: number, tabloAdi: string, testMizanId: string
): Promise<KgkBirlesikOnizlemeSonucu> => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/BirlesikTaslaklar/${id}/Onizle`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ formulSurumNo, tabloAdi, testMizanId }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "KGK önizlemesi oluşturulamadı.");
  return payload as KgkBirlesikOnizlemeSonucu;
};

export const previewKgkBirlesikGercekMizan = async (
  token: string, id: number, formulSurumNo: number, tabloAdi: string,
  denetlenenId: number, yil: number, kapsam: number
): Promise<KgkBirlesikOnizlemeSonucu> => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/BirlesikTaslaklar/${id}/GercekMizanOnizle`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ formulSurumNo, tabloAdi, denetlenenId, yil, kapsam }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Gerçek mizan önizlemesi oluşturulamadı.");
  return payload as KgkBirlesikOnizlemeSonucu;
};

export type KgkKismiRaporOzeti = {
  id: string;
  birlesikTaslakId: number;
  birlesikFormulSurumuId: number;
  kgkAnaSurumId: number;
  hesaplananHucreSayisi: number;
  hesaplanmayanHucreSayisi: number;
  icerikSha256: string;
  olusturmaTarihi: string;
};

export type KgkKismiRaporDetayi = KgkKismiRaporOzeti & {
  denetlenenId: number;
  yil: number;
  konsolidasyonMu: boolean;
  mizanSha256: string;
  icerik: {
    raporlamaStandardi: number;
    kapsam: number;
    yil: number;
    tablolar: Array<{
      ad: string;
      kalemler: Array<{ sabitAnahtar: string; ad: string; satirNo: number; kalemTuru: string; ustSabitAnahtar: string | null }>;
      sutunlar: Array<{ sabitAnahtar: string; ad: string }>;
      eslesmeler: Array<{ eslesmeAnahtari: string; munferitKaynaklari: Array<{ ad: string }>; konsolideKaynaklari: Array<{ ad: string }> }>;
      hucreler: KgkBirlesikOnizlemeSonucu["hucreler"];
    }>;
  };
};

export const publishKgkKismiRapor = async (token: string, id: number,
  beklenenFormulSurumNo: number, denetlenenId: number, yil: number, kapsam: number
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/BirlesikTaslaklar/${id}/KismiRaporYayinla`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ beklenenFormulSurumNo, denetlenenId, yil, kapsam }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Kısmi rapor yayımlanamadı.");
  return payload as { id: string; hesaplananHucreSayisi: number; hesaplanmayanHucreSayisi: number; zatenYayinda: boolean };
};

export const getKgkKismiRapor = (token: string, id: string) =>
  jsonGet<KgkKismiRaporDetayi>(token, `/Kgk/KismiRaporlar/${encodeURIComponent(id)}`);

export const listKgkKismiRaporlar = (token: string, denetlenenId: number, yil: number, konsolidasyonMu: boolean) =>
  jsonGet<KgkKismiRaporOzeti[]>(token, `/Kgk/KismiRaporlar?${new URLSearchParams({
    denetlenenId: String(denetlenenId), yil: String(yil), konsolidasyonMu: String(konsolidasyonMu),
  })}`);

export const createKgkBirlesikYayinTaslagi = async (
  token: string, id: number, beklenenFormulSurumNo: number,
  gecerlilikBaslangici: string, aciklama: string
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/BirlesikTaslaklar/${id}/YayinTaslagiOlustur`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ beklenenFormulSurumNo, gecerlilikBaslangici: `${gecerlilikBaslangici}T00:00:00`, aciklama }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "KGK yayın taslakları oluşturulamadı.");
  return payload as {
    formulSurumNo: number;
    zatenOlusturulmus?: boolean;
    surumler: Array<{ id: number; surumNo: number; kapsam: number; tabloSayisi: number }>;
  };
};

export const getKgkBirlesikTaslak = (token: string, id: number) =>
  jsonGet<KgkBirlesikTaslakDetay>(token, `/Kgk/BirlesikTaslaklar/${id}`);

export const getKgkBirlesikFormulSurumleri = (token: string, id: number) =>
  jsonGet<Array<Pick<KgkBirlesikFormulSurumu, "id" | "surumNo" | "aciklama" | "olusturmaTarihi">>>(
    token, `/Kgk/BirlesikTaslaklar/${id}/FormulSurumleri`);

export const getKgkBirlesikSonFormulSurumu = async (
  token: string, id: number
): Promise<KgkBirlesikFormulSurumu | null> => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/BirlesikTaslaklar/${id}/FormulSurumleri/Son`, {
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (response.status === 404) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Formül sürümü okunamadı.");
  return enumlariSayiyaCevir(payload as KgkBirlesikFormulSurumu);
};

export const getKgkBirlesikFormulSurumu = async (token: string, id: number, surumNo: number) =>
  enumlariSayiyaCevir(await jsonGet<KgkBirlesikFormulSurumu>(token,
    `/Kgk/BirlesikTaslaklar/${id}/FormulSurumleri/${surumNo}`));

export type KgkBirlesikFormulHazirligi = {
  surumNo: number;
  derlenebilirFormulSayisi?: number | null;
  eksikAltHucreBagimliligiSayisi?: number | null;
  digerMotorHatasiSayisi?: number | null;
  sonuc: {
    hazirMi: boolean;
    gerekliFormulSayisi: number;
    mevcutFormulSayisi: number;
    eksikler: Array<{
      tabloAdi: string; eslesmeAnahtari: string; kapsam: number;
      yataySutunAnahtari: string | null; kalemAdi: string; satirNo: number;
    }>;
    yapiSorunlari: string[];
    derlemeSorunlari: string[];
  };
};

export const getKgkBirlesikFormulHazirligi = async (token: string, id: number) =>
  enumlariSayiyaCevir(await jsonGet<KgkBirlesikFormulHazirligi>(token,
    `/Kgk/BirlesikTaslaklar/${id}/FormulHazirligi`));

export const saveKgkBirlesikFormulVaryanti = async (
  token: string, id: number, beklenenSurumNo: number,
  varyant: KgkBirlesikFormulVaryanti, aciklama: string
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/BirlesikTaslaklar/${id}/FormulVaryantlari`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ beklenenSurumNo, varyant, aciklama }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Formül varyantı kaydedilemedi.");
  return payload as { id: number; surumNo: number; varyantSayisi: number };
};

export const saveKgkBirlesikExcelToplamlari = async (
  token: string, id: number, beklenenSurumNo: number, varyantlar: KgkBirlesikFormulVaryanti[]
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/BirlesikTaslaklar/${id}/FormulVaryantlari/Toplu`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ beklenenSurumNo, varyantlar, aciklama: "KGK Excel toplamları aktarıldı" }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "KGK Excel toplamları kaydedilemedi.");
  return payload as { id: number; surumNo: number; eklenenVaryantSayisi: number };
};

export type KgkBirlesikOnizlemeHucresi = {
  eslesmeAnahtari: string;
  yataySutunAnahtari: string | null;
  kapsam: number;
  donusumTipi: number;
  hazirMi: boolean;
  deger: number | null;
  hata: string | null;
};

export type KgkBirlesikOnizlemeSonucu = {
  formulSurumNo: number;
  tabloAdi: string;
  eksikFormulSayisi: number;
  yapiSorunuSayisi: number;
  tamMi: boolean;
  testMizanId: string | null;
  testMizanAdi: string | null;
  motorSurumu: string;
  varyantlar: Array<{
    kapsam: number; donusumTipi: number; durum: string; aciklama: string | null;
    hazirHucreSayisi: number; hataliHucreSayisi: number;
  }>;
  hucreler: KgkBirlesikOnizlemeHucresi[];
};

/** Formül alt sürümünü yeni motorla derler; test mizanı verilirse salt okunur hesaplar. */
export const previewKgkBirlesikFormulSurumu = async (
  token: string, id: number, istek: { formulSurumNo: number; tabloAdi: string; testMizanId?: string | null }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/BirlesikTaslaklar/${id}/Onizle`, {
    method: "POST",
    headers: { accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(istek),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || "Formüller motorla denetlenemedi.");
  return enumlariSayiyaCevir(payload as KgkBirlesikOnizlemeSonucu);
};

export const activateKgkAnaSurum = async (
  token: string,
  anaSurumId: number,
  istek: {
    etkinlikTarihi: string;
    onayAciklamasi: string;
    surumler: Array<{ surumId: number; eszamanlilikSurumu: number }>;
  }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Kgk/AnaSurumler/${anaSurumId}/DevreyeAl`, {
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
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK ana sürümü devreye alınamadı.");
  }
  return payload as {
    anaSurumId: number;
    etkinlikTarihi: string;
    surumler: FinansalSurumDevreyeAlmaSonucu[];
  };
};

export const scanAndArchiveKgkFormats = async (
  token: string,
  istek: {
    icerikHashleriniHesapla: boolean;
    oncekiDosyalar?: Array<{ url: string; sha256?: string | null; etag?: string | null; icerikUzunlugu?: number | null }>;
    arsivle: boolean;
    maksimumDeneme: number;
    kaynakDonemKodu?: string | null;
    raporlamaDonemiBitisTarihi?: string | null;
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
    if (response.status === 405) {
      throw new Error("KGK tarama isteği API tarafından kabul edilmedi (HTTP 405). Admin arayüzü ile yayımlı API sürümü veya istek yolu uyuşmuyor. API sürümünü ve /Kgk/TaraVeArsivle POST yolunu kontrol edin.");
    }
    const neden = payload?.detail || payload?.message || payload?.Message || payload?.title;
    throw new Error(neden || `KGK taraması tamamlanamadı (HTTP ${response.status}). API yanıtını kontrol edin.`);
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

export const createKgkTaslakFromDifferences = async (
  token: string,
  kaynakSurumId: number,
  istek: {
    etiket: string;
    gecerlilikBaslangici: string;
    gecerlilikBitisi?: string | null;
    aciklama?: string | null;
    beklenenKaynakEszamanlilikSurumu: number;
    kalemFarklari: KgkWorkbookFarkSonucu["kalemFarklari"];
    kgkAnaSurumId?: number;
    kgkDosyaUrl?: string;
    kgkDosyaSha256?: string;
  }
) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi/Surumler/${kaynakSurumId}/KgkTaslakOlustur`, {
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
    throw new Error(payload?.detail || payload?.message || payload?.Message || "KGK farklarından taslak oluşturulamadı.");
  }
  return payload as {
    success: boolean;
    kaynakSurumId: number;
    surumId: number;
    surumNo: number;
    durum: number;
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
