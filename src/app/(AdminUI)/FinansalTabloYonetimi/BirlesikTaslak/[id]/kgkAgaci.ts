import type { KgkBirlesikSatir, KgkKaynakKalemi, KgkMatrisSutunu } from "@/api/FinansalTabloYonetimi/Tanimlar";

export type KgkAgacSatiri = {
  anahtar: string;
  ad: string;
  derinlik: number;
  ust: string | null;
  altSayisi: number;
  baslikMi: boolean;
  kalem: KgkBirlesikSatir;
  munferit?: KgkKaynakKalemi;
  konsolide?: KgkKaynakKalemi;
};

export type KgkSutunBasligi = { sutun: KgkMatrisSutunu; colSpan: number; rowSpan: number };

const kapsamEtiketi = /\s*\((Münferit|Konsolide)\)\s*/gi;

export const aramaAnahtari = (deger: string) => deger.toLocaleLowerCase("tr-TR")
  .replaceAll("ı", "i")
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "");

/** KGK kaynak satırlarındaki üst bağlarından Excel sırasıyla girintili ağaç üretir. */
export const kgkAgaciOlustur = (kalemler: KgkBirlesikSatir[]): KgkAgacSatiri[] => {
  const sahip = new Map<string, string>();
  kalemler.forEach((kalem) => [...(kalem.munferitKaynaklari ?? []), ...(kalem.konsolideKaynaklari ?? [])]
    .forEach((kaynak) => sahip.set(kaynak.sabitAnahtar, kalem.eslesmeAnahtari)));
  const anahtarlar = new Set(kalemler.map((x) => x.eslesmeAnahtari));
  const dugumler = kalemler.map((kalem) => {
    const munferit = kalem.munferitKaynaklari?.[0];
    const konsolide = kalem.konsolideKaynaklari?.[0];
    const ana = munferit ?? konsolide;
    const yolSonu = kalem.eslesmeAnahtari.lastIndexOf("/");
    let ust = ana ? (ana.ustSabitAnahtar ? sahip.get(ana.ustSabitAnahtar) ?? null : null)
      : yolSonu > 0 ? kalem.eslesmeAnahtari.slice(0, yolSonu) : null;
    if (ust === kalem.eslesmeAnahtari || (ust && !anahtarlar.has(ust))) ust = null;
    return {
      anahtar: kalem.eslesmeAnahtari,
      ad: ana ? ana.ad.replace(kapsamEtiketi, " ").trim() : kalem.eslesmeAnahtari.slice(yolSonu + 1),
      ust, kalem, munferit, konsolide,
      baslikMi: ana?.kalemTuru === "Baslik",
    };
  });
  type Dugum = (typeof dugumler)[number];
  const cocuklar = new Map<string | null, Dugum[]>();
  dugumler.forEach((x) => cocuklar.set(x.ust, [...(cocuklar.get(x.ust) ?? []), x]));
  // Yalnız konsolidede olan satır, konsolide sırasında kendinden önceki ortak satırın arkasına yerleşir.
  const sira = (x: Dugum, kardesler: Dugum[]) => {
    if (x.munferit) return x.munferit.satirNo;
    if (!x.konsolide) return Number.MAX_SAFE_INTEGER;
    const onceki = kardesler.filter((k) => k.munferit && k.konsolide && k.konsolide.satirNo < x.konsolide!.satirNo)
      .sort((a, b) => b.konsolide!.satirNo - a.konsolide!.satirNo)[0];
    return (onceki?.munferit?.satirNo ?? 0) + x.konsolide.satirNo / 100000;
  };
  const sonuc: KgkAgacSatiri[] = [];
  const ziyaret = new Set<string>();
  const gez = (ust: string | null, derinlik: number) => {
    const kardesler = cocuklar.get(ust) ?? [];
    kardesler.map((x) => ({ x, s: sira(x, kardesler) })).sort((a, b) => a.s - b.s).forEach(({ x }) => {
      if (ziyaret.has(x.anahtar)) return;
      ziyaret.add(x.anahtar);
      sonuc.push({ ...x, derinlik, altSayisi: cocuklar.get(x.anahtar)?.length ?? 0 });
      gez(x.anahtar, derinlik + 1);
    });
  };
  gez(null, 0);
  dugumler.filter((x) => !ziyaret.has(x.anahtar))
    .forEach((x) => sonuc.push({ ...x, ust: null, derinlik: 0, altSayisi: 0 }));
  return sonuc;
};

/** Arama varsa eşleşen satırları üst kalemleriyle; yoksa kapalı dalları gizleyerek döndürür. */
export const gorunurSatirlar = (agac: KgkAgacSatiri[], kapali: Set<string>, arama: string) => {
  const aranan = aramaAnahtari(arama.trim());
  if (aranan) {
    const ustler = new Map(agac.map((x) => [x.anahtar, x.ust]));
    const goster = new Set<string>();
    agac.filter((x) => aramaAnahtari(x.ad).includes(aranan) || aramaAnahtari(x.anahtar).includes(aranan))
      .forEach((x) => {
        for (let a: string | null = x.anahtar; a && !goster.has(a); a = ustler.get(a) ?? null) goster.add(a);
      });
    return agac.filter((x) => goster.has(x.anahtar));
  }
  const sonuc: KgkAgacSatiri[] = [];
  let gizliDerinlik = Number.POSITIVE_INFINITY;
  for (const satir of agac) {
    if (satir.derinlik > gizliDerinlik) continue;
    gizliDerinlik = Number.POSITIVE_INFINITY;
    sonuc.push(satir);
    if (satir.altSayisi > 0 && kapali.has(satir.anahtar)) gizliDerinlik = satir.derinlik;
  }
  return sonuc;
};

/** Özkaynak sütun hiyerarşisini birleştirilmiş başlık satırlarına ve veri sütunlarına çevirir. */
export const sutunBasliklari = (sutunlar: KgkMatrisSutunu[]) => {
  const harita = new Map(sutunlar.map((x) => [x.sabitAnahtar, x]));
  const derinlik = (x: KgkMatrisSutunu) => {
    let d = 0;
    const ziyaret = new Set<string>();
    for (let u = x.ustSabitAnahtar; u && harita.has(u) && !ziyaret.has(u); u = harita.get(u)!.ustSabitAnahtar) {
      ziyaret.add(u);
      d++;
    }
    return d;
  };
  const yapraklar = sutunlar.filter((x) => x.ilkSutunNo === x.sonSutunNo &&
    !sutunlar.some((alt) => alt.ustSabitAnahtar === x.sabitAnahtar))
    .sort((a, b) => a.ilkSutunNo - b.ilkSutunNo);
  const seviyeSayisi = Math.max(1, ...sutunlar.map((x) => derinlik(x) + 1));
  const satirlar: KgkSutunBasligi[][] = Array.from({ length: seviyeSayisi }, () => []);
  sutunlar.forEach((x) => {
    const yaprakMi = yapraklar.includes(x);
    const kapsanan = yapraklar.filter((y) => y.sayfaAdi === x.sayfaAdi &&
      y.ilkSutunNo >= x.ilkSutunNo && y.sonSutunNo <= x.sonSutunNo).length;
    if (kapsanan === 0) return;
    const d = derinlik(x);
    satirlar[d].push({ sutun: x, colSpan: yaprakMi ? 1 : kapsanan, rowSpan: yaprakMi ? seviyeSayisi - d : 1 });
  });
  satirlar.forEach((s) => s.sort((a, b) => a.sutun.ilkSutunNo - b.sutun.ilkSutunNo));
  return { yapraklar, satirlar };
};
