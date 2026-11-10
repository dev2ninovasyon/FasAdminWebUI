import type { KgkBirlesikOnizlemeHucresi } from "@/api/FinansalTabloYonetimi/Tanimlar";

const anahtar = (x: KgkBirlesikOnizlemeHucresi) =>
  `${x.eslesmeAnahtari}\u0001${x.yataySutunAnahtari ?? ""}\u0001${x.kapsam}\u0001${x.donusumTipi}`;

export const surumTutarlariKarsilastir = (
  guncel: KgkBirlesikOnizlemeHucresi[], onceki: KgkBirlesikOnizlemeHucresi[],
) => {
  const guncelHarita = new Map(guncel.map((x) => [anahtar(x), x]));
  const eskiHarita = new Map(onceki.map((x) => [anahtar(x), x]));
  const farklilar: { hucre: { satir: string; sutun: string | null; kapsam: number }; onceki: number; guncel: number }[] = [];
  let karsilastirilan = 0;
  let tekTarafli = 0;
  for (const hucre of guncel) {
    if (hucre.deger == null) continue;
    const eski = eskiHarita.get(anahtar(hucre));
    if (eski?.deger == null) { tekTarafli++; continue; }
    karsilastirilan++;
    if (Math.abs(hucre.deger - eski.deger) >= 0.005) farklilar.push({
      hucre: { satir: hucre.eslesmeAnahtari, sutun: hucre.yataySutunAnahtari,
        kapsam: hucre.kapsam }, onceki: eski.deger, guncel: hucre.deger,
    });
  }
  for (const hucre of onceki) {
    if (hucre.deger != null && guncelHarita.get(anahtar(hucre))?.deger == null) tekTarafli++;
  }
  return { farklilar, karsilastirilan, tekTarafli };
};
