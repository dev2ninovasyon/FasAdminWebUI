"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { useParams } from "next/navigation";
import {
  Alert, Box, Button, Chip, IconButton, InputAdornment, List, ListItem, ListItemButton, ListItemText, MenuItem, Paper, Popover,
  Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from "@mui/material";
import {
  IconCalculator, IconChevronDown, IconChevronRight, IconChevronsDown, IconChevronsUp, IconHistory, IconSearch, IconX,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getKgkBirlesikTaslak, getKgkBirlesikFormulSurumleri, getKgkBirlesikSonFormulSurumu, getKgkBirlesikFormulSurumu, getKgkBirlesikFormulHazirligi, previewKgkBirlesikFormulSurumu,
  saveKgkBirlesikFormulVaryanti, KgkBirlesikTaslakDetay, KgkBirlesikFormulSurumu, KgkBirlesikFormulVaryanti,
  KgkBirlesikFormulHazirligi, KgkBirlesikOnizlemeHucresi, KgkBirlesikOnizlemeSonucu, KgkMatrisSutunu,
} from "@/api/FinansalTabloYonetimi/Tanimlar";
import { getFinansalTabloTestMizanlari, FinansalTabloTestMizan } from "@/api/FinansalTabloYonetimi/TestMizan";
import { KgkAgacSatiri, gorunurSatirlar, kgkAgaciOlustur, sutunBasliklari } from "./kgkAgaci";
import { EXCEL, EXCEL_SATIR_YUKSEKLIGI as SATIR_YUKSEKLIGI, excelBaslikHucresi } from "../../excelStili";
import FormulCekmecesi from "../../FormulCekmecesi";

type Gecmis = Pick<KgkBirlesikFormulSurumu, "id" | "surumNo" | "aciklama" | "olusturmaTarihi">;
type Hucre = { satir: string; sutun: string | null; kapsam: number };
type Form = { formul: string; dipnot: string; kaynak: string };

// Formüller tek tiptir: enflasyon düzeltmesi kodda uygulanır, ayrı enflasyon formülü girilmez.
const NORMAL = 1;
const KAPSAMLAR = [1, 2];
const KAPSAM = ["", "Münferit", "Konsolide"];
// Özkaynak başlıkları Excel'deki gibi sarılır; sabit yükseklik yapışkan başlık ofsetlerini korur.
const HARF_YUKSEKLIGI = 22;
const BASLIK_YUKSEKLIGI = 52;
const BOS_FORM: Form = { formul: "", dipnot: "", kaynak: "" };
const CEKMECE_GENISLIGI = 440;
const tutar = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
const hucreAnahtari = (satir: string, sutun: string | null, kapsam: number, donusum: number) =>
  `${satir}\u0001${sutun ?? ""}\u0001${kapsam}\u0001${donusum}`;
// Tablo anahtarı invariant büyük harftir ("FINANSAL"); okunur ad KGK dosya başlığından alınır.
const tabloEtiketi = (tablo: KgkBirlesikTaslakDetay["icerik"]["tablolar"][number]) =>
  (tablo.munferit?.baslik || tablo.konsolide?.baslik || tablo.ad).replace(/\s*\((Münferit|Konsolide)\)\s*/gi, " ").trim();
const kapsamKaynagi = (satir: KgkAgacSatiri, kapsam: number) => kapsam === 1 ? satir.munferit : satir.konsolide;
const kullanilabilir = (satir: KgkAgacSatiri, kapsam: number) => satir.kalem.durum !== "Belirsiz" &&
  (kapsam === 1 ? satir.kalem.munferitMi : satir.kalem.konsolideMi);

export default function BirlesikTaslakSayfasi() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const token = useSelector((state: AppState) => state.userReducer.token);
  const [taslak, setTaslak] = useState<KgkBirlesikTaslakDetay | null>(null);
  const [son, setSon] = useState<KgkBirlesikFormulSurumu | null>(null);
  const [karsilastirma, setKarsilastirma] = useState<KgkBirlesikFormulSurumu | null>(null);
  const [karsilastirmaYukleniyor, setKarsilastirmaYukleniyor] = useState(false);
  const [hazirlik, setHazirlik] = useState<KgkBirlesikFormulHazirligi | null>(null);
  const [gecmis, setGecmis] = useState<Gecmis[]>([]);
  const [testMizanlari, setTestMizanlari] = useState<FinansalTabloTestMizan[]>([]);
  const [tabloAdi, setTabloAdi] = useState("");
  const [arama, setArama] = useState("");
  const [kapali, setKapali] = useState<Set<string>>(new Set());
  const [matrisKapsam, setMatrisKapsam] = useState(1);
  const [secili, setSecili] = useState<Hucre | null>(null);
  const [form, setForm] = useState<Form>(BOS_FORM);
  const [kayitliForm, setKayitliForm] = useState<Form>(BOS_FORM);
  const [aciklama, setAciklama] = useState("");
  const [onizleme, setOnizleme] = useState<KgkBirlesikOnizlemeSonucu | null>(null);
  const [testMizanId, setTestMizanId] = useState("");
  const [degerMizani, setDegerMizani] = useState<string | null>(null);
  const [hesaplaniyor, setHesaplaniyor] = useState(false);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [gecmisAnchor, setGecmisAnchor] = useState<HTMLElement | null>(null);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    if (!token || !Number.isInteger(id) || id <= 0) return;
    let aktif = true;
    setTaslak(null);
    setSon(null);
    setKarsilastirma(null);
    setHazirlik(null);
    setGecmis([]);
    setTabloAdi("");
    setSecili(null);
    setOnizleme(null);
    setHata("");
    Promise.all([
      getKgkBirlesikTaslak(token, id),
      getKgkBirlesikSonFormulSurumu(token, id),
      getKgkBirlesikFormulHazirligi(token, id),
      getKgkBirlesikFormulSurumleri(token, id),
      getFinansalTabloTestMizanlari(token, 20).catch(() => [] as FinansalTabloTestMizan[]),
    ]).then(([kaynakTaslak, formulSurumu, kapsamDurumu, tarihce, mizanlar]) => {
      if (!aktif) return;
      setTaslak(kaynakTaslak);
      setTabloAdi(kaynakTaslak.icerik.tablolar[0]?.ad || "");
      setSon(formulSurumu);
      setHazirlik(kapsamDurumu);
      setGecmis(tarihce);
      setTestMizanlari(mizanlar);
      setTestMizanId((eski) => eski || mizanlar[0]?.id || "");
    }).catch((error) => { if (aktif) setHata(error instanceof Error ? error.message : "Taslak okunamadı."); });
    return () => { aktif = false; };
  }, [token, id]);

  const tablo = taslak?.icerik.tablolar.find((x) => x.ad === tabloAdi);
  const matrisMi = Boolean(tablo?.munferit?.sutunlar?.length || tablo?.konsolide?.sutunlar?.length);
  const agac = useMemo(() => kgkAgaciOlustur(tablo?.kalemler ?? []), [tablo]);
  const satirlar = useMemo(() => gorunurSatirlar(agac, kapali, arama), [agac, kapali, arama]);
  const satirHaritasi = useMemo(() => new Map(agac.map((x) => [x.anahtar, x])), [agac]);
  const matris = useMemo(() => sutunBasliklari(
    (matrisKapsam === 1 ? tablo?.munferit?.sutunlar : tablo?.konsolide?.sutunlar) ?? []), [tablo, matrisKapsam]);
  const varyantlar = useMemo(() => new Map((son?.varyantlar ?? []).filter((x) => x.tabloAdi === tabloAdi)
    .map((x) => [hucreAnahtari(x.eslesmeAnahtari, x.yataySutunAnahtari, x.kapsam, x.donusumTipi), x])), [son, tabloAdi]);
  const sonuclar = useMemo(() => new Map<string, KgkBirlesikOnizlemeHucresi>(
    onizleme && onizleme.tabloAdi === tabloAdi && onizleme.formulSurumNo === son?.surumNo
      ? onizleme.hucreler.map((x) => [hucreAnahtari(x.eslesmeAnahtari, x.yataySutunAnahtari, x.kapsam, x.donusumTipi), x])
      : []), [onizleme, tabloAdi, son?.surumNo]);
  const hataliSayisi = [...sonuclar.values()].filter((x) => x.hata).length;
  const seciliSatir = secili ? satirHaritasi.get(secili.satir) : undefined;
  const seciliSutun = secili?.sutun ? matris.yapraklar.find((x) => x.sabitAnahtar === secili.sutun) : undefined;
  const seciliSonuc = secili ? sonuclar.get(hucreAnahtari(secili.satir, secili.sutun, secili.kapsam, NORMAL)) : undefined;
  const eskiKayit = secili ? karsilastirma?.varyantlar.find((x) => x.tabloAdi === tabloAdi &&
    x.eslesmeAnahtari === secili.satir && x.yataySutunAnahtari === secili.sutun &&
    x.kapsam === secili.kapsam && x.donusumTipi === NORMAL) : undefined;
  const degisti = form.formul !== kayitliForm.formul || form.dipnot !== kayitliForm.dipnot || form.kaynak !== kayitliForm.kaynak;

  const denetle = useCallback(async (mizanId: string | null) => {
    if (!token || !son?.surumNo || !tabloAdi) return;
    setHesaplaniyor(true);
    try {
      setOnizleme(await previewKgkBirlesikFormulSurumu(token, id, { formulSurumNo: son.surumNo, tabloAdi, testMizanId: mizanId }));
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Formüller motorla denetlenemedi.");
    } finally {
      setHesaplaniyor(false);
    }
  }, [token, id, son?.surumNo, tabloAdi]);

  useEffect(() => { void denetle(degerMizani); }, [denetle, degerMizani]);

  const sec = (hucre: Hucre) => {
    if (degisti && !window.confirm("Kaydedilmemiş formül değişikliği var. Vazgeçilsin mi?")) return;
    const kayit = varyantlar.get(hucreAnahtari(hucre.satir, hucre.sutun, hucre.kapsam, NORMAL));
    const yeni = { formul: kayit?.hamFormul ?? "", dipnot: kayit?.dipnot ?? "", kaynak: kayit?.kaynak ?? "" };
    setSecili(hucre); setForm(yeni); setKayitliForm(yeni); setAciklama(""); setMesaj("");
  };

  const kapat = () => {
    if (degisti && !window.confirm("Kaydedilmemiş formül değişikliği var. Vazgeçilsin mi?")) return;
    setSecili(null);
  };

  const tabloDegistir = (ad: string) => {
    if (degisti && !window.confirm("Kaydedilmemiş formül değişikliği var. Vazgeçilsin mi?")) return;
    setTabloAdi(ad); setSecili(null); setKapali(new Set()); setArama("");
  };

  const gecmisSurumuAc = async (surumNo: number) => {
    setGecmisAnchor(null);
    if (!token || surumNo === son?.surumNo) { setKarsilastirma(null); return; }
    setKarsilastirmaYukleniyor(true);
    try {
      setKarsilastirma(await getKgkBirlesikFormulSurumu(token, id, surumNo));
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Önceki formül sürümü okunamadı.");
    } finally {
      setKarsilastirmaYukleniyor(false);
    }
  };

  const kaydet = async () => {
    if (!token || !secili || !seciliSatir || kaydediliyor || (!form.formul.trim() && !form.dipnot.trim())) return;
    setHata(""); setMesaj(""); setKaydediliyor(true);
    const varsayilan = `${seciliSatir.ad} · ${KAPSAM[secili.kapsam]}${seciliSutun ? ` · ${seciliSutun.ad}` : ""} formülü güncellendi`;
    try {
      const varyant: KgkBirlesikFormulVaryanti = {
        tabloAdi, eslesmeAnahtari: secili.satir, yataySutunAnahtari: secili.sutun,
        kapsam: secili.kapsam, donusumTipi: NORMAL,
        hamFormul: form.formul.trim() || null, dipnot: form.dipnot.trim() || null,
        hesaplamaKurali: null, kaynak: form.kaynak.trim() || null,
      };
      const sonuc = await saveKgkBirlesikFormulVaryanti(token, id, son?.surumNo || 0, varyant,
        (aciklama.trim() || varsayilan).slice(0, 500));
      const [guncel, kapsamDurumu, tarihce] = await Promise.all([
        getKgkBirlesikSonFormulSurumu(token, id), getKgkBirlesikFormulHazirligi(token, id),
        getKgkBirlesikFormulSurumleri(token, id),
      ]);
      setSon(guncel); setHazirlik(kapsamDurumu); setGecmis(tarihce);
      setKayitliForm(form); setAciklama("");
      setMesaj(`Alt sürüm #${sonuc.surumNo} kaydedildi; önceki sürümler korunuyor.`);
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Formül kaydedilemedi.");
    } finally {
      setKaydediliyor(false);
    }
  };

  const tusla = (olay: KeyboardEvent) => {
    if (olay.key === "Enter" && (olay.ctrlKey || olay.metaKey)) { olay.preventDefault(); void kaydet(); }
  };

  const formulHucresi = (satir: KgkAgacSatiri, sutun: KgkMatrisSutunu | null, kapsam: number) => {
    const sutunAnahtari = sutun?.sabitAnahtar ?? null;
    const acik = kullanilabilir(satir, kapsam) && (!sutun || Boolean(kapsamKaynagi(satir, kapsam)));
    const anahtar = hucreAnahtari(satir.anahtar, sutunAnahtari, kapsam, NORMAL);
    const kayit = varyantlar.get(anahtar);
    const sonuc = sonuclar.get(anahtar);
    const seciliMi = secili?.satir === satir.anahtar && secili.sutun === sutunAnahtari && secili.kapsam === kapsam;
    const ac = () => acik && sec({ satir: satir.anahtar, sutun: sutunAnahtari, kapsam });
    return <TableCell key={anahtar} onClick={ac} tabIndex={acik ? 0 : -1} role={acik ? "button" : undefined}
      aria-label={`${satir.ad} ${sutun ? sutun.ad : KAPSAM[kapsam]}`}
      onKeyDown={(e) => { if (e.key === "Enter") ac(); }}
      title={!acik ? (satir.kalem.durum === "Belirsiz" ? "Belirsiz eşleşme; formül atanamaz." : `Bu satır ${KAPSAM[kapsam].toLocaleLowerCase("tr-TR")} tabloda yok.`)
        : sonuc?.hata || kayit?.hamFormul || kayit?.dipnot || "Formül eklemek için tıklayın"}
      sx={{
        minWidth: sutun ? 120 : 260, maxWidth: sutun ? 180 : 420, py: 0.25, px: 0.75, cursor: acik ? "cell" : "not-allowed", position: "relative",
        borderRight: "1px solid", borderRightColor: EXCEL.izgara, borderBottomColor: EXCEL.izgara,
        bgcolor: !acik ? EXCEL.bos : seciliMi ? EXCEL.seciliHucre : "inherit",
        outline: seciliMi ? `2px solid ${EXCEL.yesil}` : "none", outlineOffset: -2,
        "&::before": sonuc?.hata ? { content: '""', position: "absolute", top: 0, left: 0,
          borderTop: "7px solid", borderTopColor: "error.main", borderRight: "7px solid transparent" } : undefined,
        "&:hover": acik && !seciliMi ? { outline: `1px solid ${EXCEL.yesil}`, outlineOffset: -1 } : undefined,
      }}>
      {acik && (kayit?.hamFormul || kayit?.dipnot) ? <Stack direction="row" spacing={1} alignItems="baseline">
        <Typography noWrap variant="body2" sx={{ flex: 1, minWidth: 0, fontFamily: "Consolas, monospace", fontSize: 12.5 }}>
          {kayit.hamFormul || <Box component="span" sx={{ color: "text.secondary", fontFamily: "inherit" }}>yalnız dipnot</Box>}
        </Typography>
        {sonuc?.hata ? <Typography variant="caption" color="error.main" sx={{ flexShrink: 0 }}>#HATA</Typography>
          : sonuc?.deger != null ? <Typography variant="caption" sx={{ flexShrink: 0, fontVariantNumeric: "tabular-nums", color: "text.secondary" }}>
            {tutar.format(sonuc.deger)}</Typography> : null}
        {kayit.dipnot && <Tooltip title={`Dipnot ${kayit.dipnot}`}><Box component="span" sx={{ flexShrink: 0, fontSize: 11, px: 0.5,
          border: "1px solid", borderColor: EXCEL.kenar, borderRadius: 0.5, color: "text.secondary" }}>{kayit.dipnot}</Box></Tooltip>}
      </Stack> : null}
    </TableCell>;
  };

  const satirEtiketi = (satir: KgkAgacSatiri, kapsam: number) => {
    const no = matrisMi ? kapsamKaynagi(satir, kapsam)?.satirNo : satir.munferit?.satirNo ?? satir.konsolide?.satirNo;
    const farkliNo = !matrisMi && satir.munferit && satir.konsolide && satir.munferit.satirNo !== satir.konsolide.satirNo;
    const aramada = Boolean(arama.trim());
    return <>
      <TableCell sx={{ position: "sticky", left: 0, zIndex: 1, bgcolor: secili?.satir === satir.anahtar ? EXCEL.seciliBaslik : EXCEL.baslik,
        color: secili?.satir === satir.anahtar ? EXCEL.yesil : "text.secondary", fontWeight: secili?.satir === satir.anahtar ? 700 : 400,
        fontSize: 12, textAlign: "center", px: 0.5, width: 56, borderRight: "1px solid", borderRightColor: EXCEL.kenar, borderBottomColor: EXCEL.kenar }}
        title={farkliNo ? `Münferit ${satir.munferit!.satirNo} · Konsolide ${satir.konsolide!.satirNo}` : undefined}>
        {no ?? ""}
      </TableCell>
      <TableCell sx={{ position: "sticky", left: 56, zIndex: 1, bgcolor: satir.baslikMi ? EXCEL.baslikSatiri : "background.paper", py: 0.25, pr: 1,
        pl: 0.5 + Math.min(satir.derinlik, 8) * 2, minWidth: 280, maxWidth: 420,
        borderRight: "1px solid", borderRightColor: EXCEL.kenar, borderBottomColor: EXCEL.izgara }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {satir.altSayisi > 0 && !aramada ? <IconButton size="small" sx={{ p: 0.25 }}
            aria-label={kapali.has(satir.anahtar) ? "Aç" : "Daralt"}
            onClick={() => setKapali((eski) => {
              const yeni = new Set(eski);
              if (yeni.has(satir.anahtar)) yeni.delete(satir.anahtar); else yeni.add(satir.anahtar);
              return yeni;
            })}>
            {kapali.has(satir.anahtar) ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
          </IconButton> : <Box sx={{ width: 24, flexShrink: 0 }} />}
          <Typography variant="body2" noWrap title={satir.anahtar}
            sx={{ fontWeight: satir.baslikMi || satir.altSayisi > 0 ? 700 : 400, fontSize: 13, cursor: "default" }}>
            {satir.ad}
          </Typography>
          {satir.kalem.durum === "YalnizKonsolide" &&
            <Chip size="small" variant="outlined" color="primary" label="Yalnız konsolide" />}
          {satir.kalem.durum === "YalnizMunferit" &&
            <Chip size="small" variant="outlined" label="Yalnız münferit" />}
          {satir.kalem.durum === "Belirsiz" && <Chip size="small" color="warning" variant="outlined" label="Belirsiz" />}
          {satir.kalem.durum === "YapiFarki" && <Chip size="small" variant="outlined" label="Yapı farkı" />}
        </Stack>
      </TableCell>
    </>;
  };

  const ustHucre = excelBaslikHucresi;
  const varyantDurumu = (kapsam: number) =>
    onizleme?.tabloAdi === tabloAdi ? onizleme.varyantlar.find((x) => x.kapsam === kapsam && x.donusumTipi === NORMAL) : undefined;
  const seviyeSayisi = matrisMi ? matris.satirlar.length : 1;
  const baslikUstu = matrisMi ? HARF_YUKSEKLIGI : 0;
  const solBaslik = (seviyeSayisi: number, ust: number) => <>
    <TableCell rowSpan={seviyeSayisi} sx={{ ...ustHucre, position: "sticky", left: 0, top: ust, zIndex: 4, width: 56, textAlign: "center" }}>Satır</TableCell>
    <TableCell rowSpan={seviyeSayisi} sx={{ ...ustHucre, position: "sticky", left: 56, top: ust, zIndex: 4, minWidth: 280 }}>KGK kalemi</TableCell>
  </>;
  const harfHucresi = { ...ustHucre, height: HARF_YUKSEKLIGI, py: 0, fontSize: 11.5, fontWeight: 400, color: "text.secondary", textAlign: "center" } as const;

  const formulSayisi = (son?.varyantlar ?? []).filter((x) => x.tabloAdi === tabloAdi).length;
  const tabloEksikleri = hazirlik?.sonuc.eksikler.filter((x) => x.tabloAdi === tabloAdi) ?? [];
  const tabloYapiSorunlari = hazirlik?.sonuc.yapiSorunlari.filter((x) => x.startsWith(`${tabloAdi} /`)) ?? [];
  const sonGecmis = gecmis[0];

  return <PageContainer title="Birleşik KGK formülleri" description="KGK kalemleri ve formül alt sürümleri">
    <Breadcrumb title="Birleşik KGK formülleri" items={[{ title: "Finansal Tablolar", to: "/FinansalTabloYonetimi" }, { title: "Birleşik taslak" }]} />
    <ParentCard title={taslak ? `KGK taslağı #${taslak.ozet.id}` : "KGK taslağı yükleniyor"}>
      <Stack spacing={1.5}>
        {hata && <Alert severity="error" onClose={() => setHata("")}>{hata}</Alert>}
        {mesaj && <Alert severity="success" onClose={() => setMesaj("")}>{mesaj}</Alert>}
        {hazirlik && !hazirlik.sonuc.hazirMi && <Alert severity="error">
          Formül kapsamı eksik: {hazirlik.sonuc.mevcutFormulSayisi}/{hazirlik.sonuc.gerekliFormulSayisi} gerekli hücre dolu;
          {" "}{hazirlik.sonuc.eksikler.length} eksik formül, {hazirlik.sonuc.yapiSorunlari.length} yapı sorunu,
          {" "}{hazirlik.sonuc.derlemeSorunlari.length} derleme sorunu var.
          Bu taslak üretim için hazır değildir. Aşağıdaki tabloda eksik hücreleri tamamlayıp tekrar denetleyin.
        </Alert>}
        {hazirlik?.sonuc.hazirMi && <Alert severity="info">
          Gerekli formüller mevcut. Üretime geçmeden motor hesapları ve gerçek mizan karşılaştırması ayrıca doğrulanmalıdır.
        </Alert>}
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }} justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {taslak ? `${taslak.ozet.tabloSayisi} tablo · ${taslak.icerik.tablolar.reduce((toplam, x) => toplam + x.kalemler.length, 0)} satır` : "Yükleniyor"}
            {" · "}Formüller yeni motorla derlenir ve örnek mizanla salt okunur hesaplanır; yayındaki tablolar, eski raporlar ve dipnotlar değişmez.
          </Typography>
          <Button size="small" variant="text" color="inherit" startIcon={<IconHistory size={16} />}
            onClick={(e) => setGecmisAnchor(e.currentTarget)} disabled={gecmis.length === 0} sx={{ flexShrink: 0 }}>
            {son ? `Alt sürüm #${son.surumNo}` : "Henüz alt sürüm yok"}
          </Button>
        </Stack>
        <Popover open={Boolean(gecmisAnchor)} anchorEl={gecmisAnchor} onClose={() => setGecmisAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
          <List dense sx={{ width: 380, maxHeight: 360, overflowY: "auto" }}>
            {son?.kaynakSurum && son.kaynakSurum.birlesikTaslakId !== id &&
              <ListItem divider>
                <Button size="small" href={`/FinansalTabloYonetimi/BirlesikTaslak/${son.kaynakSurum.birlesikTaslakId}`}>
                  Kaynak KGK taslağı #{son.kaynakSurum.birlesikTaslakId} · alt sürüm #{son.kaynakSurum.surumNo}
                </Button>
              </ListItem>}
            {gecmis.map((x) => <ListItem key={x.id} divider disablePadding>
              <ListItemButton onClick={() => void gecmisSurumuAc(x.surumNo)} disabled={karsilastirmaYukleniyor}>
                <ListItemText primary={`#${x.surumNo} · ${x.aciklama}`}
                  secondary={`${new Date(x.olusturmaTarihi).toLocaleString("tr-TR")} · ${x.surumNo === son?.surumNo ? "Güncel" : "Karşılaştır"}`} />
              </ListItemButton>
            </ListItem>)}
          </List>
        </Popover>
        {karsilastirma && <Alert severity="info" onClose={() => setKarsilastirma(null)}>
          Güncel alt sürüm #{son?.surumNo} ile önceki alt sürüm #{karsilastirma.surumNo} karşılaştırılıyor.
          Eski sürüm salt okunurdur; kaydettiğiniz değişiklikler yeni bir alt sürüm oluşturur.
          {karsilastirma.kaynakSurum && karsilastirma.kaynakSurum.birlesikTaslakId !== id &&
            <Button size="small" href={`/FinansalTabloYonetimi/BirlesikTaslak/${karsilastirma.kaynakSurum.birlesikTaslakId}`}>
              Kaynak taslağı aç
            </Button>}
        </Alert>}

        <Tabs value={tablo ? tabloAdi : false} onChange={(_, ad) => tabloDegistir(ad)} variant="scrollable" scrollButtons="auto"
          sx={{ minHeight: 40, borderBottom: 1, borderColor: "divider", "& .MuiTab-root": { minHeight: 40, textTransform: "none" } }}>
          {taslak?.icerik.tablolar.map((x) => <Tab key={x.ad} value={x.ad}
            label={tabloEtiketi(x)} />)}
        </Tabs>

        {tabloEksikleri.length > 0 && <Alert severity="warning">
          Bu tabloda {tabloEksikleri.length} eksik formül var. İlk eksikler:{" "}
          {tabloEksikleri.slice(0, 6).map((x, i) => <Button key={`${x.eslesmeAnahtari}-${x.kapsam}-${x.yataySutunAnahtari}`} size="small"
            onClick={() => { setArama(x.kalemAdi); setMatrisKapsam(x.kapsam); }}>
            {i + 1}. {x.kalemAdi} ({KAPSAM[x.kapsam]})
          </Button>)}
        </Alert>}
        {tabloYapiSorunlari.length > 0 && <Alert severity="error">{tabloYapiSorunlari.slice(0, 4).join("; ")}</Alert>}
        {hazirlik?.sonuc.derlemeSorunlari.some((x) => x.startsWith(`${tabloAdi} /`)) &&
          <Alert severity="error">{hazirlik.sonuc.derlemeSorunlari.filter((x) => x.startsWith(`${tabloAdi} /`)).join("; ")}</Alert>}

        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
          <TextField size="small" placeholder="Satır ara" value={arama} onChange={(e) => setArama(e.target.value)}
            sx={{ minWidth: 240, flex: { md: "0 1 320px" } }}
            slotProps={{ input: {
              startAdornment: <InputAdornment position="start"><IconSearch size={16} /></InputAdornment>,
              endAdornment: arama ? <InputAdornment position="end"><IconButton size="small" aria-label="Aramayı temizle" onClick={() => setArama("")}><IconX size={14} /></IconButton></InputAdornment> : undefined,
            } }} />
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Tümünü aç"><span><IconButton size="small" aria-label="Tümünü aç" onClick={() => setKapali(new Set())}><IconChevronsDown size={18} /></IconButton></span></Tooltip>
            <Tooltip title="Tümünü daralt"><span><IconButton size="small" aria-label="Tümünü daralt" onClick={() => setKapali(new Set(agac.filter((x) => x.altSayisi > 0).map((x) => x.anahtar)))}><IconChevronsUp size={18} /></IconButton></span></Tooltip>
          </Stack>
          {matrisMi && <Stack direction="row" spacing={1}>
            <ToggleButtonGroup size="small" exclusive value={matrisKapsam} onChange={(_, v) => { if (v) { setMatrisKapsam(v); setSecili(null); } }}>
              <ToggleButton value={1}>Münferit</ToggleButton><ToggleButton value={2}>Konsolide</ToggleButton>
            </ToggleButtonGroup>
          </Stack>}
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" color={hataliSayisi ? "error.main" : "text.secondary"} sx={{ whiteSpace: "nowrap" }}>
            {formulSayisi} formül{hataliSayisi ? ` · ${hataliSayisi} hatalı` : ""}{hesaplaniyor ? " · denetleniyor" : ""}
          </Typography>
          {testMizanlari.length > 1 && <TextField select size="small" label="Örnek mizan" value={testMizanId}
            onChange={(e) => setTestMizanId(e.target.value)} sx={{ minWidth: 200 }}>
            {testMizanlari.map((x) => <MenuItem key={x.id} value={x.id}>{x.ad} · {x.yil}{x.konsolidasyonMu ? " · konsolide" : ""}</MenuItem>)}
          </TextField>}
          <Tooltip title={testMizanlari.length === 0 ? "Önce Finansal Tablolar ekranında test mizanı oluşturun." : testMizanlari.length === 1 ? `Örnek mizan: ${testMizanlari[0].ad}` : ""}>
            <span><Button size="small" variant="outlined" startIcon={<IconCalculator size={16} />}
              disabled={!son || !testMizanId || hesaplaniyor}
              onClick={() => { if (degerMizani === testMizanId) void denetle(testMizanId); else setDegerMizani(testMizanId); }}>
              Örnek mizanla hesapla
            </Button></span>
          </Tooltip>
        </Stack>
        {onizleme?.testMizanAdi && onizleme.tabloAdi === tabloAdi && <Typography variant="caption" color="text.secondary">
          Değerler “{onizleme.testMizanAdi}” test mizanından, alt sürüm #{onizleme.formulSurumNo} ile hesaplandı (cari dönem bakiyesi).
        </Typography>}
        {onizleme?.tabloAdi === tabloAdi && !onizleme.tamMi && <Alert severity="error">
          Bu önizleme kısmi bir formül testidir; finansal tablo olarak kullanılmamalıdır.
          {" "}{onizleme.eksikFormulSayisi} eksik formül, {onizleme.yapiSorunuSayisi} yapı sorunu var.
          Motor hatalarını da hücrelerde kontrol edin.
        </Alert>}

        <Box>
          {/* width 0 + minWidth: kaydırmalı tablonun içerik genişliği sayfa sarmalayıcısını taşırmasın. */}
          <TableContainer component={Paper} variant="outlined" sx={{ width: 0, minWidth: "100%", maxHeight: "calc(100vh - 330px)", minHeight: 320,
            borderRadius: 0, borderColor: EXCEL.kenar, scrollPaddingLeft: 56 + 280,
            scrollPaddingTop: matrisMi ? HARF_YUKSEKLIGI + BASLIK_YUKSEKLIGI * seviyeSayisi : SATIR_YUKSEKLIGI }}>
            <Table size="small" stickyHeader sx={{ borderCollapse: "separate" }}>
              <TableHead>
                {matrisMi ? <>
                  {/* Excel sütun harfleri: KGK dosyasındaki sütunla birebir eşleşir. */}
                  <TableRow>
                    <TableCell sx={{ ...harfHucresi, position: "sticky", left: 0, top: 0, zIndex: 5, width: 56 }} />
                    <TableCell sx={{ ...harfHucresi, position: "sticky", left: 56, top: 0, zIndex: 5 }}>A</TableCell>
                    {matris.yapraklar.map((s) => <TableCell key={s.sabitAnahtar} sx={{ ...harfHucresi, top: 0,
                      ...(secili?.sutun === s.sabitAnahtar ? { bgcolor: EXCEL.seciliBaslik, color: EXCEL.yesil, fontWeight: 700 } : {}) }}>{s.sutun}</TableCell>)}
                  </TableRow>
                  {matris.satirlar.map((seviye, i) => <TableRow key={i}>
                    {i === 0 && solBaslik(seviyeSayisi, baslikUstu)}
                    {seviye.map((b) => <TableCell key={b.sutun.sabitAnahtar} colSpan={b.colSpan} rowSpan={b.rowSpan} title={b.sutun.ad}
                      sx={{ ...ustHucre, height: BASLIK_YUKSEKLIGI * b.rowSpan, top: HARF_YUKSEKLIGI + i * BASLIK_YUKSEKLIGI,
                        textAlign: "center", verticalAlign: "middle", minWidth: b.colSpan === 1 ? 120 : undefined, maxWidth: b.colSpan === 1 ? 180 : undefined,
                        fontSize: 11.5, lineHeight: 1.25, whiteSpace: "normal" }}>
                      <Box sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.sutun.ad}</Box>
                    </TableCell>)}
                  </TableRow>)}
                </> : <TableRow>
                  {solBaslik(1, 0)}
                  {KAPSAMLAR.map((k) => {
                    const durum = varyantDurumu(k);
                    return <TableCell key={k} sx={{ ...ustHucre, top: 0, textAlign: "center" }} title={durum?.aciklama ?? undefined}>
                      {KAPSAM[k]}
                      {durum?.hataliHucreSayisi ? <Typography component="span" variant="caption" color="error.main"> · {durum.hataliHucreSayisi} hata</Typography> : null}
                    </TableCell>;
                  })}
                </TableRow>}
              </TableHead>
              <TableBody>
                {satirlar.map((satir) => <TableRow key={satir.anahtar} sx={{ height: SATIR_YUKSEKLIGI,
                  bgcolor: satir.baslikMi ? EXCEL.baslikSatiri : "background.paper" }}>
                  {satirEtiketi(satir, matrisKapsam)}
                  {matrisMi
                    ? matris.yapraklar.map((s) => formulHucresi(satir, s, matrisKapsam))
                    : KAPSAMLAR.map((k) => <Fragment key={k}>{formulHucresi(satir, null, k)}</Fragment>)}
                </TableRow>)}
                {taslak && satirlar.length === 0 && <TableRow><TableCell colSpan={8}>
                  <Typography variant="body2" color="text.secondary">{arama ? "Aramayla eşleşen satır yok." : "Bu tabloda satır yok."}</Typography>
                </TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>

        </Box>
      </Stack>
      <FormulCekmecesi acik={Boolean(secili && seciliSatir)} genislik={CEKMECE_GENISLIGI} onKapat={kapat} onKeyDown={tusla}
        baslik={seciliSatir?.ad}
        altBaslik={secili && seciliSatir ? <>
          {KAPSAM[secili.kapsam]}{seciliSutun ? ` · ${seciliSutun.ad}` : ""}
          {kapsamKaynagi(seciliSatir, secili.kapsam) ? ` · Excel satırı ${kapsamKaynagi(seciliSatir, secili.kapsam)!.satirNo}` : ""}
        </> : null}>
        {secili && seciliSatir && <Stack spacing={1.5}>
          {karsilastirma && <Alert severity="info" sx={{ py: 0 }}>
            <Typography variant="caption" sx={{ display: "block", fontWeight: 700 }}>
              Alt sürüm #{karsilastirma.surumNo} · {new Date(karsilastirma.olusturmaTarihi).toLocaleString("tr-TR")}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "Consolas, monospace", overflowWrap: "anywhere" }}>
              {eskiKayit?.hamFormul || "Bu hücrede formül yoktu."}
            </Typography>
            {eskiKayit?.dipnot && <Typography variant="caption">Dipnot: {eskiKayit.dipnot}</Typography>}
            {eskiKayit?.hamFormul && eskiKayit.hamFormul !== kayitliForm.formul &&
              <Button size="small" onClick={() => setForm({ formul: eskiKayit.hamFormul ?? "",
                dipnot: eskiKayit.dipnot ?? "", kaynak: eskiKayit.kaynak ?? "" })}>
                Eski formülü düzenleyiciye al
              </Button>}
          </Alert>}
          <TextField label="Formül" value={form.formul} multiline minRows={3} fullWidth
            onChange={(e) => setForm((x) => ({ ...x, formul: e.target.value }))}
            slotProps={{
              htmlInput: { spellCheck: false, style: { fontFamily: "Consolas, monospace", fontSize: 13 } },
              input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.25 }}>
                <Typography sx={{ fontStyle: "italic", fontFamily: "Cambria, Georgia, serif", color: EXCEL.yesil, fontWeight: 700 }}>fx</Typography>
              </InputAdornment> },
            }}
            helperText={matrisMi ? "Hesap kodu önekleri: 500 + 501 - 502"
              : "Hesap kodu (100), satır (C12), TOPLA(C10:C15) veya ALT. Satır numarası tablonun Satır sütunundadır."} />
          {seciliSonuc?.hata && <Alert severity="error" sx={{ py: 0 }}>{seciliSonuc.hata}</Alert>}
          {!seciliSonuc?.hata && seciliSonuc?.deger != null && <Typography variant="body2">
            Örnek mizan sonucu: <strong>{tutar.format(seciliSonuc.deger)}</strong>
          </Typography>}
          <TextField size="small" label="Dipnot" value={form.dipnot} fullWidth
            onChange={(e) => setForm((x) => ({ ...x, dipnot: e.target.value }))} />
          <TextField size="small" label="Kaynak notu" value={form.kaynak} fullWidth
            onChange={(e) => setForm((x) => ({ ...x, kaynak: e.target.value }))} />
          <TextField size="small" label="Değişiklik nedeni" value={aciklama} fullWidth placeholder="Boş bırakılırsa otomatik yazılır"
            onChange={(e) => setAciklama(e.target.value)} />
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" onClick={kaydet} sx={{ bgcolor: EXCEL.yesil, "&:hover": { bgcolor: EXCEL.koyuYesil } }}
              disabled={kaydediliyor || !degisti || (!form.formul.trim() && !form.dipnot.trim())}>
              {kaydediliyor ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button color="inherit" onClick={kapat}>Vazgeç</Button>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: "right" }}>
              Ctrl+Enter · alt sürüm #{(son?.surumNo ?? 0) + 1}
            </Typography>
          </Stack>
          {sonGecmis && <Typography variant="caption" color="text.secondary">
            Son kayıt #{sonGecmis.surumNo} · {new Date(sonGecmis.olusturmaTarihi).toLocaleString("tr-TR")}
          </Typography>}
        </Stack>}
      </FormulCekmecesi>
    </ParentCard>
  </PageContainer>;
}
