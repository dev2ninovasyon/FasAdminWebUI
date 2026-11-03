"use client";

import { useMemo, useState } from "react";
import {
  Box, IconButton, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from "@mui/material";
import { IconChevronDown, IconChevronRight, IconChevronsDown, IconChevronsUp, IconSearch, IconX } from "@tabler/icons-react";
import type { FinansalSurumDetay } from "@/api/FinansalTabloYonetimi/Tanimlar";
import { EXCEL, EXCEL_SATIR_YUKSEKLIGI, excelBaslikHucresi, excelFormulYazisi } from "./excelStili";

type Tablo = FinansalSurumDetay["tablolar"][number];
type Kalem = Tablo["kalemler"][number];
type Kural = Tablo["kurallar"][number];
type Satir = { kalem: Kalem; derinlik: number; altSayisi: number; ust: number | null };

export const KALEM_TURLERI = ["", "Başlık", "Veri", "Ara toplam", "Toplam", "Manuel"];

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

type Props = {
  tablo: Tablo;
  seciliKalemId: number;
  seciliKuralId: number;
  onKalemSec: (kalem: Kalem, kural?: Kural) => void;
  onHucreKuraliSec: (kural: Kural) => void;
};

/** Sürüm tablosunun kalem kırılımlarını Excel görünümünde ve formülleriyle listeler. */
export default function KalemFormulTablosu({ tablo, seciliKalemId, seciliKuralId, onKalemSec, onHucreKuraliSec }: Props) {
  const [arama, setArama] = useState("");
  const [kapali, setKapali] = useState<Set<number>>(new Set());
  const agac = useMemo(() => agacOlustur(tablo.kalemler), [tablo.kalemler]);
  const kuralByKalem = useMemo(() => new Map(tablo.kurallar.filter((x) => x.kalemId).map((x) => [x.kalemId!, x])), [tablo.kurallar]);
  const hucreKurallari = useMemo(() => tablo.kurallar.filter((x) => x.hucreId).map((kural) => {
    const hucre = tablo.hucreler.find((h) => h.id === kural.hucreId);
    const dikey = tablo.kalemler.find((k) => k.id === hucre?.dikeyKalemId);
    const yatay = tablo.kalemler.find((k) => k.id === hucre?.yatayKalemId);
    return { kural, ad: `${dikey?.ad ?? "?"} × ${yatay?.ad ?? "?"}` };
  }), [tablo]);
  const satirlar = useMemo(() => {
    const aranan = aramaAnahtari(arama.trim());
    if (aranan) {
      const ustler = new Map(agac.map((x) => [x.kalem.id, x.ust]));
      const goster = new Set<number>();
      agac.filter((x) => aramaAnahtari(`${x.kalem.ad} ${x.kalem.kod ?? ""} ${x.kalem.sabitAnahtar}`).includes(aranan))
        .forEach((x) => { for (let a: number | null = x.kalem.id; a && !goster.has(a); a = ustler.get(a) ?? null) goster.add(a); });
      return agac.filter((x) => goster.has(x.kalem.id));
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
  }, [agac, kapali, arama]);
  const formulSayisi = tablo.kurallar.filter((x) => x.aktifMi).length;

  const hucreSx = { py: 0.25, px: 1, borderRight: "1px solid", borderRightColor: EXCEL.izgara, borderBottom: "1px solid", borderBottomColor: EXCEL.izgara };

  // width 0: kaydırmalı tablonun içerik genişliği sayfa sarmalayıcısını taşırmasın.
  return <Stack spacing={1} sx={{ flex: 1, minWidth: 0, width: { xs: "100%", lg: 0 } }}>
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField size="small" placeholder="Kalem ara" value={arama} onChange={(e) => setArama(e.target.value)} sx={{ width: 300, maxWidth: "100%" }}
        slotProps={{ input: {
          startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment>,
          endAdornment: arama ? <InputAdornment position="end"><IconButton size="small" aria-label="Aramayı temizle" onClick={() => setArama("")}><IconX size={14} /></IconButton></InputAdornment> : undefined,
        } }} />
      <Tooltip title="Tümünü aç"><IconButton size="small" aria-label="Tümünü aç" onClick={() => setKapali(new Set())}><IconChevronsDown size={18} /></IconButton></Tooltip>
      <Tooltip title="Tümünü daralt"><IconButton size="small" aria-label="Tümünü daralt" onClick={() => setKapali(new Set(agac.filter((x) => x.altSayisi > 0).map((x) => x.kalem.id)))}><IconChevronsUp size={18} /></IconButton></Tooltip>
      <Box sx={{ flex: 1 }} />
      <Typography variant="caption" color="text.secondary">{tablo.kalemler.length} kalem · {formulSayisi} formül</Typography>
    </Stack>
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "calc(100vh - 300px)", minHeight: 320, borderRadius: 0, borderColor: EXCEL.kenar, scrollPaddingLeft: 52, scrollPaddingTop: EXCEL_SATIR_YUKSEKLIGI }}>
      <Table size="small" stickyHeader sx={{ borderCollapse: "separate" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...excelBaslikHucresi, width: 52, textAlign: "center", position: "sticky", left: 0, zIndex: 4 }}>Sıra</TableCell>
            <TableCell sx={{ ...excelBaslikHucresi, minWidth: 220 }}>Kalem</TableCell>
            <TableCell sx={{ ...excelBaslikHucresi, width: 84 }}>Tür</TableCell>
            <TableCell sx={{ ...excelBaslikHucresi, minWidth: 180 }}>Formül</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {satirlar.map(({ kalem, derinlik, altSayisi }) => {
            const kural = kuralByKalem.get(kalem.id);
            const secili = kalem.id === seciliKalemId;
            const baslik = kalem.kalemTuru === 1;
            const formul = kuralFormulMetni(kural, tablo.kalemler);
            return <TableRow key={kalem.id} onClick={() => onKalemSec(kalem, kural)} sx={{
              height: EXCEL_SATIR_YUKSEKLIGI, cursor: "cell", opacity: kalem.aktifMi ? 1 : 0.5,
              bgcolor: secili ? EXCEL.seciliHucre : baslik ? EXCEL.baslikSatiri : "background.paper",
              "&:hover td:not(:first-of-type)": secili ? undefined : { bgcolor: "action.hover" },
            }}>
              <TableCell sx={{ ...hucreSx, position: "sticky", left: 0, zIndex: 1, textAlign: "center", fontSize: 12,
                bgcolor: secili ? EXCEL.seciliBaslik : EXCEL.baslik, color: secili ? EXCEL.yesil : "text.secondary",
                fontWeight: secili ? 700 : 400, borderRightColor: EXCEL.kenar, borderBottomColor: EXCEL.kenar }}>{kalem.sira}</TableCell>
              <TableCell sx={{ ...hucreSx, pl: 0.5 + Math.min(derinlik, 8) * 2, maxWidth: 420,
                outline: secili ? `2px solid ${EXCEL.yesil}` : "none", outlineOffset: -2 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {altSayisi > 0 && !arama.trim() ? <IconButton size="small" sx={{ p: 0.25 }} aria-label={kapali.has(kalem.id) ? "Aç" : "Daralt"}
                    onClick={(e) => { e.stopPropagation(); setKapali((eski) => {
                      const yeni = new Set(eski);
                      if (yeni.has(kalem.id)) yeni.delete(kalem.id); else yeni.add(kalem.id);
                      return yeni;
                    }); }}>
                    {kapali.has(kalem.id) ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
                  </IconButton> : <Box sx={{ width: 24, flexShrink: 0 }} />}
                  <Typography variant="body2" noWrap title={kalem.sabitAnahtar}
                    sx={{ fontSize: 13, fontWeight: baslik || altSayisi > 0 || kalem.kalemTuru === 4 ? 700 : 400 }}>{kalem.ad}</Typography>
                </Stack>
              </TableCell>
              <TableCell sx={{ ...hucreSx, fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
                {KALEM_TURLERI[kalem.kalemTuru] || "—"}{kalem.eksen === 3 ? " · sütun" : ""}
              </TableCell>
              <TableCell sx={{ ...hucreSx, maxWidth: 420 }} title={formul || undefined}>
                <Typography noWrap sx={{ ...excelFormulYazisi, color: kural && !kural.aktifMi ? "text.disabled" : "text.primary" }}>
                  {formul || (baslik ? "" : <Box component="span" sx={{ color: "text.disabled" }}>formül yok</Box>)}
                </Typography>
              </TableCell>
            </TableRow>;
          })}
          {hucreKurallari.length > 0 && !arama.trim() && <>
            <TableRow><TableCell colSpan={4} sx={{ ...excelBaslikHucresi, position: "static" }}>Özkaynak hücre formülleri</TableCell></TableRow>
            {hucreKurallari.map(({ kural, ad }) => <TableRow key={`h${kural.id}`} onClick={() => onHucreKuraliSec(kural)} sx={{
              height: EXCEL_SATIR_YUKSEKLIGI, cursor: "cell", bgcolor: kural.id === seciliKuralId ? EXCEL.seciliHucre : "background.paper" }}>
              <TableCell sx={{ ...hucreSx, bgcolor: EXCEL.baslik, textAlign: "center", fontSize: 12, color: "text.secondary" }}>—</TableCell>
              <TableCell colSpan={2} sx={hucreSx}><Typography variant="body2" noWrap sx={{ fontSize: 13 }}>{ad}</Typography></TableCell>
              <TableCell sx={hucreSx}><Typography noWrap sx={excelFormulYazisi}>{kuralFormulMetni(kural, tablo.kalemler)}</Typography></TableCell>
            </TableRow>)}
          </>}
          {satirlar.length === 0 && <TableRow><TableCell colSpan={4}>
            <Typography variant="body2" color="text.secondary">{arama ? "Aramayla eşleşen kalem yok." : "Bu tabloda kalem yok."}</Typography>
          </TableCell></TableRow>}
        </TableBody>
      </Table>
    </TableContainer>
  </Stack>;
}
