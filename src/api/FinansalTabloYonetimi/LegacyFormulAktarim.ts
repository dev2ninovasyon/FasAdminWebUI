import { url } from "@/api/apiBase";

export type LegacyFormulFarki = {
  kuralId: number;
  hedefTuru: string;
  tabloKodu: string;
  hedefAdi: string;
  legacyFormulId: string;
  eskiFormul?: string | null;
  yeniFormul?: string | null;
  durum: "Aktarilabilir" | "IncelemeGerekli";
  aciklama: string;
  aktarilabilirMi: boolean;
};

export type LegacyFormulKarsilastirma = {
  surumId: number;
  tanimSetiId: number;
  taslakMi: boolean;
  kilitliMi: boolean;
  kilitSurumId?: number | null;
  eszamanlilikSurumu: number;
  kaynakSha256: string;
  karsilastirilanKuralSayisi: number;
  farkSayisi: number;
  aktarilabilirFarkSayisi: number;
  incelemeGerektirenFarkSayisi: number;
  farklar: LegacyFormulFarki[];
};

export type LegacyFormulAktarimSonucu = {
  basarili: boolean;
  surumId: number;
  tanimSetiId: number;
  aktarilanKuralSayisi: number;
  eszamanlilikSurumu: number;
  kaynakSha256: string;
  kilitliMi: boolean;
};

const jsonRequest = async <T>(token: string, path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${url}/FinansalTabloYonetimi${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || payload?.Message || "Eski formül aktarımı tamamlanamadı.");
  }
  return payload as T;
};

export const compareLegacyFormuller = (token: string, surumId: number) =>
  jsonRequest<LegacyFormulKarsilastirma>(token, `/Surumler/${surumId}/LegacyFormuller/Karsilastir`);

export const applyLegacyFormuller = (
  token: string,
  surumId: number,
  request: { beklenenEszamanlilikSurumu: number; beklenenKaynakSha256: string }
) => jsonRequest<LegacyFormulAktarimSonucu>(token, `/Surumler/${surumId}/LegacyFormuller/Uygula`, {
  method: "POST",
  body: JSON.stringify(request),
});
