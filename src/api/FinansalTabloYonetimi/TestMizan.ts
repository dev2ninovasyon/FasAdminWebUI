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
