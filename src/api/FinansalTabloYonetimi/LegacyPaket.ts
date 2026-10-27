import { url } from "@/api/apiBase";

export type LegacyImportPackage = Record<string, unknown>;

export type LegacyImportOutputManifest = {
  schemaVersion: string;
  sourceVersion: string;
  sourceSha256: string;
  reconciliation: Record<string, unknown>;
  outputs: Array<{
    file: string;
    sha256: string;
    logicalRecordCount: number;
  }>;
  schemas: string[];
};

export type LegacyPaketOnay = {
  aciklama: string;
  farkKodlari: string[];
};

export type LegacyPaketIstegi = {
  surumId: number;
  beklenenEszamanlilikSurumu: number;
  beklenenKaynakSha256: string;
  paket: LegacyImportPackage;
  manifest: LegacyImportOutputManifest;
  farkOnayi?: LegacyPaketOnay;
};

export type LegacyPaketSonucu = {
  onizlemeMi: boolean;
  yazildiMi: boolean;
  tabloSayisi: number;
  kalemSayisi: number;
  hucreSayisi: number;
  hesaplamaKuraliSayisi: number;
  kuralTerimiSayisi: number;
  eszamanlilikSurumu: number;
  sorunlar: Array<{
    kod: string;
    konum: string;
    aciklama: string;
    bloklayiciMi: boolean;
  }>;
  kaliteRaporu?: {
    kaynakSurumu: string;
    kaynakSha256: string;
    paketSha256: string;
    tanimSetiSayisi: number;
    tabloSayisi: number;
    kalemSayisi: number;
    formulSayisi: number;
    doluFormulSayisi: number;
    terimSayisi: number;
    aktarilacakTabloSayisi: number;
    aktarilacakKalemSayisi: number;
    aktarilacakHucreSayisi: number;
    aktarilacakFormulSayisi: number;
    aktarilacakTerimSayisi: number;
    uyariSayisi: number;
    hataSayisi: number;
    bloklayiciSorunSayisi: number;
    kayitMutabakatiBasariliMi: boolean;
    otomatikAktarimaHazirMi: boolean;
    sayimMutabakatiBasariliMi: boolean;
    onayGerekiyorMu: boolean;
    uygulamayaHazirMi: boolean;
  };
};

const postLegacyPaket = async (
  token: string,
  path: "Onizle" | "Uygula",
  istek: LegacyPaketIstegi
): Promise<LegacyPaketSonucu> => {
  const response = await fetch(
    `${url}/FinansalTabloYonetimi/LegacyPaket/${path}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(istek),
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload?.message || payload?.Message || "Legacy paketi işlenemedi.";
    throw new Error(message);
  }

  return payload as LegacyPaketSonucu;
};

export const previewLegacyPaket = (token: string, istek: LegacyPaketIstegi) =>
  postLegacyPaket(token, "Onizle", istek);

export const applyLegacyPaket = (token: string, istek: LegacyPaketIstegi) =>
  postLegacyPaket(token, "Uygula", istek);
