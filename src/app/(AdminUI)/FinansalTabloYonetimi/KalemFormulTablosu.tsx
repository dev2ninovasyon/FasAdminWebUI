"use client";

import { useMemo, useState } from "react";
import {
  Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from "@mui/material";
import { IconChevronDown, IconChevronRight, IconChevronsDown, IconChevronsUp, IconSearch, IconX } from "@tabler/icons-react";
import type { FinansalSurumDetay } from "@/api/FinansalTabloYonetimi/Tanimlar";
import { EXCEL, EXCEL_SATIR_YUKSEKLIGI, excelBaslikHucresi, excelFormulYazisi } from "./excelStili";

type Tablo = FinansalSurumDetay["tablolar"][number];
type Kalem = Tablo["kalemler"][number];
type Kural = Tablo["kurallar"][number];
type Satir = { kalem: Kalem; derinlik: number; altSayisi: number; ust: number | null };
type SutunBasligi = { kalem: Kalem; colSpan: number; rowSpan: number };

export const KALEM_TURLERI = ["", "Başlık", "Veri", "Ara toplam", "Toplam", "Manuel"];

// Özkaynak başlıkları Excel'deki gibi sarılır; sabit yükseklik yapışkan başlık ofsetlerini korur.
const BASLIK_YUKSEKLIGI = 52;

const aramaAnahtari = (deger: string) => deger.toLocaleLowerCase("tr-TR").replaceAll("ı", "i")
  .normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Kuralın ham formülünü, yoksa terimlerinden okunur bir Excel benzeri ifade üretir. */
export const kuralFormulMetni = (kural: Kural | undefined, kalemler: Kalem[]) => {
  if (!kural) return "";
  if (kural.hamFormul?.trim()) return kural.hamFormul.trim();
  if (kural.hesaplamaTuru === 4) return String(kural.sabitDeger ?? "");
  if (kural.hesaplamaTuru === 5) return "Manuel";
  const adlar = new Map(kalemler.map((x) => [x.sabitAnahtar, x.ad]));
  const govde = [...kural.terimler].sort((a, b) => a.sira - b.sira).map((t, i) => {
    const kaynak = t.kaynakTuru === 3 ? `[${adlar.get(t.kaynakAnahtari) ?? t.kaynakAnahtari}]` : t.kaynakAnahtari;
    return `${t.operator === 2 ? "−" : i === 0 ? "" : "+"}${kaynak}${t.donemDavranisi === 2 ? " (önceki)" : ""}`;
  }).join(" ");
  return kural.hesaplamaTuru === 3 ? `ALT: ${govde}` : govde;
};

/** Özkaynak hücresinin okunur adı: "Dikey kalem × Yatay kalem". */
export const hucreAdi = (tablo: Tablo, hucreId: number | null | undefined) => {
  const hucre = tablo.hucreler.find((h) => h.id === hucreId);
  const ad = (id?: number) => tablo.kalemler.find((k) => k.id === id)?.ad ?? "?";
  return hucre ? `${ad(hucre.dikeyKalemId)} × ${ad(hucre.yatayKalemId)}` : "Özkaynak hücresi";
};

const agacOlustur = (kalemler: Kalem[]): Satir[] => {
  const idler = new Set(kalemler.map((x) => x.id));
  const cocuklar = new Map<number | null, Kalem[]>();
  kalemler.forEach((k) => {
    const ust = k.ustKalemId && k.ustKalemId !== k.id && idler.has(k.ustKalemId) ? k.ustKalemId : null;
    cocuklar.set(ust, [...(cocuklar.get(ust) ?? []), k]);
  });
  const sonuc: Satir[] = [];
  const ziyaret = new Set<number>();
  const gez = (ust: number | null, derinlik: number) => [...(cocuklar.get(ust) ?? [])]
    .sort((a, b) => a.sira - b.sira || a.id - b.id)
    .forEach((kalem) => {
      if (ziyaret.has(kalem.id)) return;
      ziyaret.add(kalem.id);
      sonuc.push({ kalem, derinlik, ust, altSayisi: cocuklar.get(kalem.id)?.length ?? 0 });
      gez(kalem.id, derinlik + 1);
    });
  gez(null, 0);
  kalemler.filter((k) => !ziyaret.has(k.id)).forEach((kalem) => sonuc.push({ kalem, derinlik: 0, ust: null, altSayisi: 0 }));
  return sonuc;
};

/** Yatay (sütun) kalem ağacını Excel'deki gibi birleştirilmiş başlık satırlarına ve veri sütunlarına çevirir. */
const sutunBasliklari = (agac: Satir[]) => {
  const cocuklar = new Map<number | null, Satir[]>();
  agac.forEach((x) => cocuklar.set(x.ust, [...(cocuklar.get(x.ust) ?? []), x]));
  const yaprakSayisi = (id: number): number => {
    const altlar = cocuklar.get(id) ?? [];
    return altlar.length === 0 ? 1 : altlar.reduce((toplam, x) => toplam + yaprakSayisi(x.kalem.id), 0);
  };
  const seviyeSayisi = Math.max(1, ...agac.map((x) => x.derinlik + 1));
  const satirlar: SutunBasligi[][] = Array.from({ length: seviyeSayisi }, () => []);
  agac.forEach((x) => satirlar[x.derinlik].push({
    kalem: x.kalem, colSpan: yaprakSayisi(x.kalem.id), rowSpan: x.altSayisi > 0 ? 1 : seviyeSayisi - x.derinlik,
  }));
  return { yapraklar: agac.filter((x) => x.altSayisi === 0).map((x) => x.kalem), satirlar };
};

type Props = {
  tablo: Tablo;
  seciliKalemId: number;
  seciliKuralId: number;
  onKalemSec: (kalem: Kalem, kural?: Kural) => void;
  onHucreKuraliSec: (kural: Kural) => void;
};

/**
 * Sürüm tablosunu Excel görünümünde ve formülleriyle listeler. Yatay eksenli kalemi olan tablolar
 * (özkaynak) satır = dikey kalem, sütun = yatay kalem matrisi olarak gösterilir; formül hücrededir.
 */
export default function KalemFormulTablosu({ tablo, seciliKalemId, seciliKuralId, onKalemSec, onHucreKuraliSec }: Props) {
  const [arama, setArama] = useState("");
  const [yalnizEksik, setYalnizEksik] = useState(false);
  const [kapali, setKapali] = useState<Set<number>>(new Set());
  const matrisMi = tablo.kalemler.some((k) => k.eksen === 3);
  const agac = useMemo(() => agacOlustur(tablo.kalemler.filter((k) => !matrisMi || k.eksen !== 3)), [tablo.kalemler, matrisMi]);
  const matris = useMemo(() => sutunBasliklari(agacOlustur(tablo.kalemler.filter((k) => k.eksen === 3))), [tablo.kalemler]);
  const kuralByKalem = useMemo(() => new Map(tablo.kurallar.filter((x) => x.kalemId).map((x) => [x.kalemId!, x])), [tablo.kurallar]);
  const kuralByHucre = useMemo(() => new Map(tablo.kurallar.filter((x) => x.hucreId).map((x) => [x.hucreId!, x])), [tablo.kurallar]);
  const hucreler = useMemo(() => new Map(tablo.hucreler.map((h) => [`${h.dikeyKalemId}:${h.yatayKalemId}`, h])), [tablo.hucreler]);
  const nakitAkisMi = tablo.kod.startsWith("NAKIT_AKIS");
  const kuralEksikMi = (kural?: Kural) => !kural || !kural.aktifMi || kural.hesaplamaTuru === 5;
  // Matriste eksiklik hücre bazındadır; düz tabloda satır bazında.
  const eksikHucreler = useMemo(() => new Set(matrisMi && !nakitAkisMi
    ? tablo.hucreler.filter((h) => h.aktifMi && kuralEksikMi(kuralByHucre.get(h.id))).map((h) => h.id) : []),
  [tablo.hucreler, kuralByHucre, matrisMi, nakitAkisMi]);
  const eksikMi = (kalem: Kalem) => matrisMi
    ? tablo.hucreler.some((h) => h.dikeyKalemId === kalem.id && eksikHucreler.has(h.id))
    : kalem.aktifMi && !nakitAkisMi && kalem.kalemTuru !== 1 && kuralEksikMi(kuralByKalem.get(kalem.id));
  const eksikSayisi = matrisMi ? eksikHucreler.size : tablo.kalemler.filter(eksikMi).length;

  const satirlar = useMemo(() => {
    const aranan = aramaAnahtari(arama.trim());
    const ustler = new Map(agac.map((x) => [x.kalem.id, x.ust]));
    const ustleriyle = (secilenler: Satir[]) => {
      const goster = new Set<number>();
      secilenler.forEach((x) => { for (let a: number | null = x.kalem.id; a && !goster.has(a); a = ustler.get(a) ?? null) goster.add(a); });
      return agac.filter((x) => goster.has(x.kalem.id));
    };
    if (aranan || yalnizEksik) {
      return ustleriyle(agac.filter((x) =>
        (!aranan || aramaAnahtari(`${x.kalem.ad} ${x.kalem.kod ?? ""} ${x.kalem.sabitAnahtar}`).includes(aranan)) &&
        (!yalnizEksik || eksikMi(x.kalem))));
    }
    const sonuc: Satir[] = [];
    let gizli = Number.POSITIVE_INFINITY;
    for (const satir of agac) {
      if (satir.derinlik > gizli) continue;
      gizli = Number.POSITIVE_INFINITY;
      sonuc.push(satir);
      if (satir.altSayisi > 0 && kapali.has(satir.kalem.id)) gizli = satir.derinlik;
    }
    return sonuc;
  }, [agac, kapali, arama, yalnizEksik, kuralByKalem, eksikHucreler, nakitAkisMi, matrisMi, tablo.hucreler]);
  const formulSayisi = tablo.kurallar.filter((x) => x.aktifMi).length;
  const filtreli = Boolean(arama.trim()) || yalnizEksik;

  const hucreSx = { py: 0.25, px: 1, borderRight: "1px solid", borderRightColor: EXCEL.izgara, borderBottom: "1px solid", borderBottomColor: EXCEL.izgara };
  const seviyeSayisi = matrisMi ? matris.satirlar.length : 1;
  const baslikYuksekligi = matrisMi ? BASLIK_YUKSEKLIGI : EXCEL_SATIR_YUKSEKLIGI;
  const kalemSutunu = matrisMi ? { position: "sticky", left: 52, zIndex: 1 } as const : {};

  const kalemHucresi = (satir: Satir, secili: boolean, baslik: boolean) => <TableCell sx={{ ...hucreSx, ...kalemSutunu,
    pl: 0.5 + Math.min(satir.derinlik, 8) * 2, minWidth: matrisMi ? 260 : undefined, maxWidth: 420,
    bgcolor: matrisMi ? (baslik ? EXCEL.baslikSatiri : "background.paper") : undefined,
    borderRightColor: matrisMi ? EXCEL.kenar : EXCEL.izgara,
    outline: secili ? `2px solid ${EXCEL.yesil}` : "none", outlineOffset: -2 }}>
    <Stack direction="row" spacing={0.5} alignItems="center">
      {satir.altSayisi > 0 && !filtreli ? <IconButton size="small" sx={{ p: 0.25 }} aria-label={kapali.has(satir.kalem.id) ? "Aç" : "Daralt"}
        onClick={(e) => { e.stopPropagation(); setKapali((eski) => {
          const yeni = new Set(eski);
          if (yeni.has(satir.kalem.id)) yeni.delete(satir.kalem.id); else yeni.add(satir.kalem.id);
          return yeni;
        }); }}>
        {kapali.has(satir.kalem.id) ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
      </IconButton> : <Box sx={{ width: 24, flexShrink: 0 }} />}
      <Typography variant="body2" noWrap title={satir.kalem.sabitAnahtar}
        sx={{ fontSize: 13, fontWeight: baslik || satir.altSayisi > 0 || satir.kalem.kalemTuru === 4 ? 700 : 400 }}>{satir.kalem.ad}</Typography>
    </Stack>
  </TableCell>;

  const matrisHucresi = (satir: Satir, sutun: Kalem) => {
    const hucre = hucreler.get(`${satir.kalem.id}:${sutun.id}`);
    const kural = hucre ? kuralByHucre.get(hucre.id) : undefined;
    const formul = kuralFormulMetni(kural, tablo.kalemler);
    const eksik = hucre ? eksikHucreler.has(hucre.id) : false;
    const secili = Boolean(kural && kural.id === seciliKuralId);
    const ac = () => { if (kural) onHucreKuraliSec(kural); };
    return <TableCell key={sutun.id} onClick={ac} role={kural ? "button" : undefined} tabIndex={kural ? 0 : -1}
      aria-label={`${satir.kalem.ad} ${sutun.ad}`} onKeyDown={(e) => { if (e.key === "Enter") ac(); }}
      title={hucre ? formul || "Bu hücrenin hesap kuralı yok." : undefined}
      sx={{ ...hucreSx, minWidth: 120, maxWidth: 180, px: 0.75, cursor: kural ? "cell" : "default",
        bgcolor: !hucre ? EXCEL.bos : secili ? EXCEL.seciliHucre : "inherit",
        outline: secili ? `2px solid ${EXCEL.yesil}` : "none", outlineOffset: -2,
        "&:hover": kural && !secili ? { outline: `1px solid ${EXCEL.yesil}`, outlineOffset: -1 } : undefined }}>
      {hucre && <Typography noWrap sx={{ ...excelFormulYazisi, fontSize: 12, color: eksik ? "warning.main" : kural?.aktifMi === false ? "text.disabled" : "text.primary" }}>
        {eksik && !formul ? "kural yok" : formul}
      </Typography>}
    </TableCell>;
  };

  // width 0 + minWidth: kaydırmalı tablonun içerik genişliği sayfa sarmalayıcısını taşırmasın.
  return <Stack spacing={1} sx={{ width: 0, minWidth: "100%" }}>
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField size="small" placeholder="Kalem ara" value={arama} onChange={(e) => setArama(e.target.value)} sx={{ width: 300, maxWidth: "100%" }}
        slotProps={{ input: {
          startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment>,
          endAdornment: arama ? <InputAdornment position="end"><IconButton size="small" aria-label="Aramayı temizle" onClick={() => setArama("")}><IconX size={14} /></IconButton></InputAdornment> : undefined,
        } }} />
      <Tooltip title="Tümünü aç"><IconButton size="small" aria-label="Tümünü aç" onClick={() => setKapali(new Set())}><IconChevronsDown size={18} /></IconButton></Tooltip>
      <Tooltip title="Tümünü daralt"><IconButton size="small" aria-label="Tümünü daralt" onClick={() => setKapali(new Set(agac.filter((x) => x.altSayisi > 0).map((x) => x.kalem.id)))}><IconChevronsUp size={18} /></IconButton></Tooltip>
      {eksikSayisi > 0 && <Button size="small" variant={yalnizEksik ? "contained" : "outlined"} color="warning"
        onClick={() => setYalnizEksik((deger) => !deger)}>Eksik formüller ({eksikSayisi})</Button>}
      <Box sx={{ flex: 1 }} />
      <Typography variant="caption" color="text.secondary">
        {matrisMi ? `${agac.length} satır × ${matris.yapraklar.length} sütun` : `${tablo.kalemler.length} kalem`} · {formulSayisi} formül
      </Typography>
    </Stack>
    {eksikSayisi > 0 && <Alert severity="warning" sx={{ py: 0 }}>
      {eksikSayisi} {matrisMi ? "hücrenin" : "satırın"} çalışır hesap kuralı yok. Alt kalemleri bulunan satırlar doğrulanmadan otomatik toplama çevrilmez.
    </Alert>}
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "calc(100vh - 300px)", minHeight: 320, borderRadius: 0, borderColor: EXCEL.kenar,
      scrollPaddingLeft: matrisMi ? 52 + 260 : 52, scrollPaddingTop: baslikYuksekligi * seviyeSayisi }}>
      <Table size="small" stickyHeader sx={{ borderCollapse: "separate" }}>
        <TableHead>
          {matrisMi ? matris.satirlar.map((seviye, i) => <TableRow key={i}>
            {i === 0 && <>
              <TableCell rowSpan={seviyeSayisi} sx={{ ...excelBaslikHucresi, width: 52, textAlign: "center", position: "sticky", left: 0, top: 0, zIndex: 4 }}>Sıra</TableCell>
              <TableCell rowSpan={seviyeSayisi} sx={{ ...excelBaslikHucresi, minWidth: 260, position: "sticky", left: 52, top: 0, zIndex: 4 }}>Kalem</TableCell>
            </>}
            {seviye.map((b) => <TableCell key={b.kalem.id} colSpan={b.colSpan} rowSpan={b.rowSpan} title={b.kalem.ad}
              sx={{ ...excelBaslikHucresi, height: BASLIK_YUKSEKLIGI * b.rowSpan, top: i * BASLIK_YUKSEKLIGI, textAlign: "center",
                verticalAlign: "middle", fontSize: 11.5, lineHeight: 1.25, whiteSpace: "normal",
                minWidth: b.colSpan === 1 ? 120 : undefined, maxWidth: b.colSpan === 1 ? 180 : undefined }}>
              <Box sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.kalem.ad}</Box>
            </TableCell>)}
          </TableRow>) : <TableRow>
            <TableCell sx={{ ...excelBaslikHucresi, width: 52, textAlign: "center", position: "sticky", left: 0, zIndex: 4 }}>Sıra</TableCell>
            <TableCell sx={{ ...excelBaslikHucresi, minWidth: 220 }}>Kalem</TableCell>
            <TableCell sx={{ ...excelBaslikHucresi, width: 84 }}>Tür</TableCell>
            <TableCell sx={{ ...excelBaslikHucresi, minWidth: 180 }}>Formül</TableCell>
          </TableRow>}
        </TableHead>
        <TableBody>
          {satirlar.map((satir) => {
            const { kalem } = satir;
            const kural = kuralByKalem.get(kalem.id);
            const secili = !matrisMi && kalem.id === seciliKalemId;
            const baslik = kalem.kalemTuru === 1;
            const sira = <TableCell sx={{ ...hucreSx, position: "sticky", left: 0, zIndex: 1, textAlign: "center", fontSize: 12,
              bgcolor: secili ? EXCEL.seciliBaslik : EXCEL.baslik, color: secili ? EXCEL.yesil : "text.secondary",
              fontWeight: secili ? 700 : 400, borderRightColor: EXCEL.kenar, borderBottomColor: EXCEL.kenar }}>{kalem.sira}</TableCell>;
            if (matrisMi) {
              return <TableRow key={kalem.id} sx={{ height: EXCEL_SATIR_YUKSEKLIGI, opacity: kalem.aktifMi ? 1 : 0.5,
                bgcolor: baslik ? EXCEL.baslikSatiri : "background.paper" }}>
                {sira}
                {kalemHucresi(satir, false, baslik)}
                {matris.yapraklar.map((sutun) => matrisHucresi(satir, sutun))}
              </TableRow>;
            }
            const formul = kuralFormulMetni(kural, tablo.kalemler);
            return <TableRow key={kalem.id} onClick={() => onKalemSec(kalem, kural)} sx={{
              height: EXCEL_SATIR_YUKSEKLIGI, cursor: "cell", opacity: kalem.aktifMi ? 1 : 0.5,
              bgcolor: secili ? EXCEL.seciliHucre : baslik ? EXCEL.baslikSatiri : "background.paper",
              "&:hover td:not(:first-of-type)": secili ? undefined : { bgcolor: "action.hover" },
            }}>
              {sira}
              {kalemHucresi(satir, secili, baslik)}
              <TableCell sx={{ ...hucreSx, fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
                {eksikMi(kalem) ? "Formül eksik" : KALEM_TURLERI[kalem.kalemTuru] || "—"}
              </TableCell>
              <TableCell sx={{ ...hucreSx, maxWidth: 420 }} title={formul || undefined}>
                <Typography noWrap sx={{ ...excelFormulYazisi, color: kural && !kural.aktifMi ? "text.disabled" : "text.primary" }}>
                  {eksikMi(kalem) ? <Box component="span" sx={{ color: "warning.main", fontFamily: "inherit" }}>Hesap kuralı tamamlanmalı</Box> :
                    formul || (baslik ? "" : <Box component="span" sx={{ color: "text.disabled" }}>formül yok</Box>)}
                </Typography>
              </TableCell>
            </TableRow>;
          })}
          {satirlar.length === 0 && <TableRow><TableCell colSpan={matrisMi ? 2 + matris.yapraklar.length : 4}>
            <Typography variant="body2" color="text.secondary">{filtreli ? "Filtreyle eşleşen kalem yok." : "Bu tabloda kalem yok."}</Typography>
          </TableCell></TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
  </Stack>;
}
