"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, FormControlLabel, MenuItem, Paper, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  NakitAkisManuelGecmisSayfasi, NakitAkisManuelListe, NakitAkisSatiri,
  nakitAkisManuelDegeriniKaydet, nakitAkisManuelDegeriniKaldir, nakitAkisManuelGecmisiniGetir,
  nakitAkisManuelDegerleriniGetir, nakitAkisSatirlariniGetir,
} from "@/api/FinansalTabloYonetimi/NakitAkisManuelDeger";

const para = (tutar: number | null | undefined) => tutar == null
  ? "Henüz girilmedi"
  : new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(tutar);

export default function NakitAkisDuzeltmeleri() {
  const token = useSelector((state: AppState) => state.userReducer.token);
  const [denetlenenId, setDenetlenenId] = useState("");
  const [yil, setYil] = useState(String(new Date().getFullYear()));
  const [konsolidasyonMu, setKonsolidasyonMu] = useState(false);
  const [satirlar, setSatirlar] = useState<NakitAkisSatiri[]>([]);
  const [seciliSatir, setSeciliSatir] = useState("");
  const [liste, setListe] = useState<NakitAkisManuelListe>({ degerler: [], gecmis: [] });
  const [gecmisSayfasi, setGecmisSayfasi] = useState<NakitAkisManuelGecmisSayfasi | null>(null);
  const [sayfa, setSayfa] = useState(1);
  const [gecmisYenileme, setGecmisYenileme] = useState(0);
  const [gecmisYukleniyor, setGecmisYukleniyor] = useState(false);
  const [gecmisHatasi, setGecmisHatasi] = useState("");
  const [yuklenenBaglam, setYuklenenBaglam] = useState("");
  const [tutar, setTutar] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const onceki = liste.degerler.find((deger) => deger.kaynakAnahtari === seciliSatir);
  const baglam = `${denetlenenId}/${yil}/${konsolidasyonMu}`;
  const baglamHazir = yuklenenBaglam === baglam;

  useEffect(() => {
    if (!token || !baglamHazir || !seciliSatir) {
      setGecmisSayfasi(null);
      return;
    }
    let gecerli = true;
    setGecmisSayfasi(null);
    setGecmisHatasi("");
    setGecmisYukleniyor(true);
    nakitAkisManuelGecmisiniGetir(token, Number(denetlenenId), Number(yil), konsolidasyonMu, seciliSatir, sayfa)
      .then((sonuc) => { if (gecerli) setGecmisSayfasi(sonuc); })
      .catch((error) => { if (gecerli) setGecmisHatasi(error instanceof Error ? error.message : "Geçmiş yüklenemedi."); })
      .finally(() => { if (gecerli) setGecmisYukleniyor(false); });
    return () => { gecerli = false; };
  }, [token, baglamHazir, denetlenenId, yil, konsolidasyonMu, seciliSatir, sayfa, gecmisYenileme]);

  const listele = async () => {
    if (!token || Number(denetlenenId) <= 0 || Number(yil) < 1900) return;
    setHata(""); setMesaj(""); setYukleniyor(true); setYuklenenBaglam("");
    try {
      const [yeniSatirlar, yeniListe] = await Promise.all([
        nakitAkisSatirlariniGetir(token, Number(denetlenenId), Number(yil), konsolidasyonMu),
        nakitAkisManuelDegerleriniGetir(token, Number(denetlenenId), Number(yil), konsolidasyonMu),
      ]);
      setSatirlar(yeniSatirlar);
      setListe(yeniListe);
      setSeciliSatir((anahtar) => yeniSatirlar.some((satir) => satir.sabitAnahtar === anahtar) ? anahtar : "");
      setSayfa(1);
      setGecmisYenileme((deger) => deger + 1);
      setYuklenenBaglam(baglam);
    } catch (error) {
      setSatirlar([]); setSeciliSatir("");
      setHata(error instanceof Error ? error.message : "Düzeltmeler yüklenemedi.");
    }
    finally { setYukleniyor(false); }
  };

  const kaydet = async () => {
    if (!token || !baglamHazir || !seciliSatir || !Number.isFinite(Number(tutar.replace(",", ".")))) return;
    setHata(""); setMesaj(""); setYukleniyor(true);
    try {
      await nakitAkisManuelDegeriniKaydet(token, {
        denetlenenId: Number(denetlenenId), yil: Number(yil), konsolidasyonMu,
        satirAnahtari: seciliSatir, tutar: Number(tutar.replace(",", ".")),
        beklenenOncekiTutar: onceki?.tutar ?? null, aciklama: aciklama.trim(),
      });
      setListe(await nakitAkisManuelDegerleriniGetir(token, Number(denetlenenId), Number(yil), konsolidasyonMu));
      setSayfa(1); setGecmisYenileme((deger) => deger + 1);
      setMesaj("Düzeltme kaydedildi. Sonraki nakit akışı üretiminde bu değer kullanılacak.");
      setAciklama("");
    } catch (error) { setHata(error instanceof Error ? error.message : "Düzeltme kaydedilemedi."); }
    finally { setYukleniyor(false); }
  };

  const formuleDon = async () => {
    if (!token || !baglamHazir || !seciliSatir || !onceki || aciklama.trim().length < 10) return;
    setHata(""); setMesaj(""); setYukleniyor(true);
    try {
      const sonuc = await nakitAkisManuelDegeriniKaldir(token, {
        denetlenenId: Number(denetlenenId), yil: Number(yil), konsolidasyonMu,
        satirAnahtari: seciliSatir, beklenenOncekiTutar: onceki.tutar, aciklama: aciklama.trim(),
      });
      setListe(await nakitAkisManuelDegerleriniGetir(token, Number(denetlenenId), Number(yil), konsolidasyonMu));
      setSayfa(1); setGecmisYenileme((deger) => deger + 1);
      setTutar(""); setAciklama(""); setMesaj(sonuc.message);
    } catch (error) { setHata(error instanceof Error ? error.message : "Manuel düzeltme kaldırılamadı."); }
    finally { setYukleniyor(false); }
  };

  return <PageContainer title="Nakit Akışı Düzeltmeleri" description="Firma ve yıl bazında nakit akışı satır düzeltmeleri">
    <Breadcrumb title="Nakit Akışı Düzeltmeleri" items={[{ to: "/FinansalTabloYonetimi", title: "Finansal Tablo Yönetimi" }]} />
    <ParentCard title="Nakit akışı satır düzeltmesi">
      <Stack spacing={2}>
        <Alert severity="info">Etkin sürümün nakit akışı satırları gösterilir. Manuel değeri kaldırırsanız sonraki üretimde satır yeniden formülle hesaplanır. İşlem geçmişi saklanır.</Alert>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
          <TextField size="small" label="Firma ID" type="number" value={denetlenenId} onChange={(e) => setDenetlenenId(e.target.value)} />
          <TextField size="small" label="Yıl" type="number" value={yil} onChange={(e) => setYil(e.target.value)} />
          <FormControlLabel control={<Switch checked={konsolidasyonMu} onChange={(e) => setKonsolidasyonMu(e.target.checked)} />} label="Konsolide" />
          <Button variant="outlined" onClick={listele} disabled={yukleniyor || Number(denetlenenId) <= 0}>Değerleri getir</Button>
        </Stack>
        <TextField select size="small" fullWidth label="Nakit akışı satırı" value={seciliSatir} disabled={!baglamHazir || yukleniyor} onChange={(e) => { setSeciliSatir(e.target.value); setSayfa(1); setTutar(""); }}>
          {satirlar.map((satir) => <MenuItem key={satir.sabitAnahtar} value={satir.sabitAnahtar}>{satir.ad} · {satir.kod}</MenuItem>)}
        </TextField>
        {seciliSatir && baglamHazir && <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="body2">Geçerli manuel değer: <strong>{para(onceki?.tutar)}</strong></Typography>
          {onceki && <Typography variant="caption" color="text.secondary">Son gerekçe: {onceki.aciklama}</Typography>}
        </Paper>}
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField size="small" label="Yeni tutar" value={tutar} onChange={(e) => setTutar(e.target.value)} inputMode="decimal" />
          <TextField size="small" label="Düzeltme gerekçesi" value={aciklama} onChange={(e) => setAciklama(e.target.value)} inputProps={{ maxLength: 500 }} sx={{ flexGrow: 1 }} />
          <Button variant="contained" onClick={kaydet} disabled={yukleniyor || !baglamHazir || !seciliSatir || !tutar.trim() || aciklama.trim().length < 10}>Kaydet</Button>
          <Button variant="outlined" color="warning" onClick={formuleDon} disabled={yukleniyor || !baglamHazir || !onceki || aciklama.trim().length < 10}>Formüle dön</Button>
        </Stack>
        {hata && <Alert severity="error">{hata}</Alert>}{mesaj && <Alert severity="success">{mesaj}</Alert>}
        {seciliSatir && baglamHazir && <Box>
          <Typography variant="subtitle2" gutterBottom>Önceki değerler ve değişiklik geçmişi</Typography>
          {gecmisHatasi && <Alert severity="error">{gecmisHatasi}</Alert>}
          {gecmisYukleniyor && <Typography variant="body2">Geçmiş yükleniyor...</Typography>}
          {!gecmisYukleniyor && gecmisSayfasi?.kayitlar.length === 0 && <Typography variant="body2" color="text.secondary">Bu satır için henüz değişiklik yok.</Typography>}
          {gecmisSayfasi && gecmisSayfasi.kayitlar.length > 0 && <>
            <Table size="small"><TableHead><TableRow><TableCell>Tarih</TableCell><TableCell align="right">Önceki</TableCell><TableCell align="right">Yeni</TableCell><TableCell>Gerekçe</TableCell><TableCell>Kullanıcı</TableCell></TableRow></TableHead>
              <TableBody>{gecmisSayfasi.kayitlar.map((kayit) => <TableRow key={kayit.id}><TableCell>{new Date(kayit.islemTarihi).toLocaleString("tr-TR")}</TableCell><TableCell align="right">{para(kayit.oncekiTutar)}</TableCell><TableCell align="right">{kayit.yeniTutar === null ? "Formüle dönüldü" : para(kayit.yeniTutar)}</TableCell><TableCell>{kayit.aciklama}</TableCell><TableCell>{kayit.kullaniciId}</TableCell></TableRow>)}</TableBody></Table>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ mt: 1 }}>
              <Typography variant="caption">{gecmisSayfasi.toplam} işlem · Sayfa {gecmisSayfasi.sayfa}</Typography>
              <Button size="small" disabled={gecmisYukleniyor || sayfa <= 1} onClick={() => setSayfa((deger) => deger - 1)}>Önceki</Button>
              <Button size="small" disabled={gecmisYukleniyor || sayfa * gecmisSayfasi.sayfaBoyutu >= gecmisSayfasi.toplam} onClick={() => setSayfa((deger) => deger + 1)}>Sonraki</Button>
            </Stack>
          </>}
        </Box>}
      </Stack>
    </ParentCard>
  </PageContainer>;
}
