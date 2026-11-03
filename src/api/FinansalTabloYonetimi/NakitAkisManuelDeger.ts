import { url } from "@/api/apiBase";

export type NakitAkisSatiri = { sabitAnahtar: string; ad: string; sira: number; kod: string };
export type NakitAkisManuelDegeri = {
  id: number; denetlenenId: number; yil: number; konsolidasyonMu: boolean;
  kaynakAnahtari: string; tutar: number; aciklama: string;
  guncelleyenKullaniciId: number; guncellemeTarihi: string;
};
export type NakitAkisManuelGecmisi = {
  id: number; kaynakAnahtari: string; oncekiTutar: number | null; yeniTutar: number;
  aciklama: string; kullaniciId: number; islemTarihi: string;
};
export type NakitAkisManuelListe = {
  degerler: NakitAkisManuelDegeri[]; gecmis: NakitAkisManuelGecmisi[];
};

const istek = async <T>(token: string, yol: string, init?: RequestInit): Promise<T> => {
  const yanit = await fetch(`${url}/FinansalTabloYonetimi/${yol}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers || {}) },
  });
  const veri = await yanit.json().catch(() => ({}));
  if (!yanit.ok) throw new Error(veri.message || "Nakit akışı düzeltmesi tamamlanamadı.");
  return veri as T;
};

export const nakitAkisSatirlariniGetir = (
  token: string, denetlenenId: number, yil: number, konsolidasyonMu: boolean
) => istek<NakitAkisSatiri[]>(token,
  `NakitAkisSatirlari?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`);

export const nakitAkisManuelDegerleriniGetir = (
  token: string, denetlenenId: number, yil: number, konsolidasyonMu: boolean
) => istek<NakitAkisManuelListe>(token,
  `NakitAkisManuelDegerleri?denetlenenId=${denetlenenId}&yil=${yil}&konsolidasyonMu=${konsolidasyonMu}`);

export const nakitAkisManuelDegeriniKaydet = (token: string, veri: {
  denetlenenId: number; yil: number; konsolidasyonMu: boolean; satirAnahtari: string;
  tutar: number; beklenenOncekiTutar: number | null; aciklama: string;
}) => istek<NakitAkisManuelDegeri>(token, "NakitAkisManuelDegerleri", {
  method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(veri),
});
