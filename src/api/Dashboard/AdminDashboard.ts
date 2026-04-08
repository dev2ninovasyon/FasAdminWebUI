import { apiFetch } from "@/api/apiBase";
import { getDenetciOdemeBilgileri } from "@/api/DenetciIslemleri/DenetciIslemleri";

export type DashboardDenetci = {
  id: number;
  firmaAdi: string;
  firmaUnvani: string;
  email: string;
  tel: string;
  il: string;
  aktifmi: boolean;
  kayitTarihi: string | null;
};

export type DashboardDenetlenen = {
  id: number;
  denetciId: number;
  firmaAdi: string;
  yetkili: string;
  email: string;
  tel: string;
  denetimTuru: string;
  aktifmi: boolean;
  createdAt: string | null;
  importedAt: string | null;
};

export type DashboardOdemeYenileme = {
  denetciId: number;
  firmaAdi: string;
  bitisTarihi: string | null;
  kalanGun: number | null;
  mevcutFirmaSayisi: number;
  sirketKota: number;
};

export type AdminDashboardOverview = {
  denetciSayisi: number;
  aktifDenetciSayisi: number;
  pasifDenetciSayisi: number;
  denetlenenSayisi: number;
  aktifDenetlenenSayisi: number;
  pasifDenetlenenSayisi: number;
  sonEklenenDenetciler: DashboardDenetci[];
  sonEklenenDenetlenenler: DashboardDenetlenen[];
  yaklasanYenilemeler: DashboardOdemeYenileme[];
};

const normalizeDate = (value: unknown) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  return value;
};

const toTime = (value?: string | null, fallback = 0) => {
  if (!value) {
    return fallback;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? fallback : parsed;
};

const startOfToday = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

const diffInDays = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const today = startOfToday();
  const normalizedTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );

  return Math.ceil(
    (normalizedTarget.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const normalizeDenetci = (item: any): DashboardDenetci => ({
  id: Number(item?.id ?? item?.Id ?? 0),
  firmaAdi: item?.firmaAdi ?? item?.FirmaAdi ?? "",
  firmaUnvani: item?.firmaUnvani ?? item?.FirmaUnvani ?? "",
  email: item?.email ?? item?.Email ?? "",
  tel: item?.tel ?? item?.Tel ?? "",
  il: item?.il ?? item?.Il ?? "",
  aktifmi: Boolean(item?.aktifmi ?? item?.Aktifmi),
  kayitTarihi: normalizeDate(item?.kayitTarihi ?? item?.KayitTarihi),
});

const normalizeDenetlenen = (item: any): DashboardDenetlenen => ({
  id: Number(item?.id ?? item?.Id ?? 0),
  denetciId: Number(item?.denetciId ?? item?.DenetciId ?? 0),
  firmaAdi: item?.firmaAdi ?? item?.FirmaAdi ?? "",
  yetkili: item?.yetkili ?? item?.Yetkili ?? "",
  email: item?.email ?? item?.Email ?? "",
  tel: item?.tel ?? item?.Tel ?? "",
  denetimTuru: item?.denetimTuru ?? item?.DenetimTuru ?? "",
  aktifmi: Boolean(item?.aktifmi ?? item?.Aktifmi),
  createdAt: normalizeDate(item?.createdAt ?? item?.CreatedAt),
  importedAt: normalizeDate(item?.importedAt ?? item?.ImportedAt),
});

export const getAdminDashboardOverview = async (
  token: string
): Promise<AdminDashboardOverview> => {
  const [denetciResponse, denetlenenResponse] = await Promise.all([
    apiFetch("/Denetci/Hepsi", { method: "GET", token }),
    apiFetch("/Denetlenen/Hepsi", { method: "GET", token }),
  ]);

  if (!denetciResponse.ok) {
    throw new Error("Denetçi verileri alınamadı.");
  }

  if (!denetlenenResponse.ok) {
    throw new Error("Denetlenen verileri alınamadı.");
  }

  const denetciData = await denetciResponse.json();
  const denetlenenData = await denetlenenResponse.json();

  const denetciler = Array.isArray(denetciData)
    ? denetciData.map(normalizeDenetci)
    : [];

  const denetlenenler = Array.isArray(denetlenenData)
    ? denetlenenData.map(normalizeDenetlenen)
    : [];

  const sonEklenenDenetciler = [...denetciler]
    .sort(
      (a, b) =>
        toTime(b.kayitTarihi, b.id) - toTime(a.kayitTarihi, a.id)
    )
    .slice(0, 4);

  const sonEklenenDenetlenenler = [...denetlenenler]
    .sort((a, b) => {
      const bDate = b.createdAt || b.importedAt;
      const aDate = a.createdAt || a.importedAt;
      return toTime(bDate, b.id) - toTime(aDate, a.id);
    })
    .slice(0, 4);

  const odemeBilgileriListesi = await Promise.all(
    denetciler.map(async (denetci) => {
      try {
        const odemeBilgileri = await getDenetciOdemeBilgileri(token, denetci.id);
        const bitisTarihi = normalizeDate(
          odemeBilgileri?.bitisTarihi ?? odemeBilgileri?.BitisTarihi
        );

        return {
          denetciId: denetci.id,
          firmaAdi: denetci.firmaAdi,
          bitisTarihi,
          kalanGun: diffInDays(bitisTarihi),
          mevcutFirmaSayisi: Number(
            odemeBilgileri?.mevcutFirmaSayisi ??
              odemeBilgileri?.MevcutFirmaSayisi ??
              0
          ),
          sirketKota: Number(
            odemeBilgileri?.sirketKota ?? odemeBilgileri?.SirketKota ?? 0
          ),
        } as DashboardOdemeYenileme;
      } catch {
        return null;
      }
    })
  );

  const yaklasanYenilemeler = odemeBilgileriListesi
    .filter((item): item is DashboardOdemeYenileme => item !== null)
    .filter(
      (item) =>
        item.kalanGun !== null &&
        item.kalanGun >= 0 &&
        item.kalanGun <= 45
    )
    .sort((a, b) => (a.kalanGun ?? 9999) - (b.kalanGun ?? 9999))
    .slice(0, 6);

  const aktifDenetciSayisi = denetciler.filter((item) => item.aktifmi).length;
  const aktifDenetlenenSayisi = denetlenenler.filter(
    (item) => item.aktifmi
  ).length;

  return {
    denetciSayisi: denetciler.length,
    aktifDenetciSayisi,
    pasifDenetciSayisi: Math.max(denetciler.length - aktifDenetciSayisi, 0),
    denetlenenSayisi: denetlenenler.length,
    aktifDenetlenenSayisi,
    pasifDenetlenenSayisi: Math.max(
      denetlenenler.length - aktifDenetlenenSayisi,
      0
    ),
    sonEklenenDenetciler,
    sonEklenenDenetlenenler,
    yaklasanYenilemeler,
  };
};
