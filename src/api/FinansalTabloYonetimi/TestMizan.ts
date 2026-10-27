import { url } from "@/api/apiBase";

export type FinansalTabloTestMizanSatiri = {
  detayKodu: string;
  hesapAdi: string;
  borc: number;
  alacak: number;
  raporBorc: number;
  raporAlacak: number;
  bakiye: number;
  kontrolBakiye: number;
  bakiyeTransferFisiHaric: number;
  paraBirimi: string;
};

export type FinansalTabloTestMizan = {
  id: string;
  ad: string;
  denetlenenId: number;
  yil: number;
  konsolidasyonMu: boolean;
  olusturmaTarihi: string;
  sha256: string;
  satirlar: FinansalTabloTestMizanSatiri[];
};

export type FinansalTabloTestMizanOlusturmaIstegi = {
  ad: string;
  denetlenenId: number;
  yil: number;
  konsolidasyonMu: boolean;
  satirlar: Array<{
    detayKodu: string;
    hesapAdi?: string;
    borc: number;
    alacak: number;
    raporBorc?: number;
    raporAlacak?: number;
    bakiye?: number;
    kontrolBakiye?: number;
    bakiyeTransferFisiHaric?: number;
    paraBirimi?: string;
  }>;
};

export type FinansalTabloMevcutMizanSatiri = {
  detayKodu?: string | null;
  hesapAdi?: string | null;
  borcBakiye?: number | null;
  alacakBakiye?: number | null;
  bakiye?: number | null;
  raporBorc?: number | null;
  raporAlacak?: number | null;
  kontrolBakiye?: number | null;
  bakiyeTransferFisiHaric?: number | null;
  paraBirimi?: string | null;
};

const jsonRequest = async <T>(token: string, path: string, init?: RequestInit) => {
  const response = await fetch(`${url}/FinansalTabloYonetimi${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Test mizanı işlemi tamamlanamadı.");
  }
  return payload as T;
};

export const getFinansalTabloMevcutMizani = async (
  token: string,
  denetlenenId: number,
  yil: number,
  konsolidasyonMu: boolean
) => {
  const response = await fetch(
    `${url}/Donusum/DonusumMizan?denetlenenId=${encodeURIComponent(denetlenenId)}&yil=${encodeURIComponent(yil)}&konsolidasyonMu=${konsolidasyonMu}`,
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.Message || "Mevcut dönüşüm mizanı okunamadı.");
  }
  const satirlar = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(satirlar)) {
    throw new Error("Mevcut dönüşüm mizanı beklenen satır listesini döndürmedi.");
  }
  return satirlar as FinansalTabloMevcutMizanSatiri[];
};

export const createFinansalTabloTestMizani = (
  token: string,
  istek: FinansalTabloTestMizanOlusturmaIstegi
) => jsonRequest<FinansalTabloTestMizan>(token, "/TestMizanlari", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(istek),
});

export const getFinansalTabloTestMizanlari = (token: string, limit = 50) =>
  jsonRequest<FinansalTabloTestMizan[]>(token, `/TestMizanlari?limit=${Math.min(200, Math.max(1, limit))}`);

export const getFinansalTabloTestMizani = (token: string, id: string) =>
  jsonRequest<FinansalTabloTestMizan>(token, `/TestMizanlari/${encodeURIComponent(id)}`);
