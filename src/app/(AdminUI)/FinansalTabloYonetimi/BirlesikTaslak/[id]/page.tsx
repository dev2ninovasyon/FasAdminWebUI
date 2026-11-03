"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getKgkBirlesikTaslak, getKgkBirlesikFormulSurumleri, getKgkBirlesikSonFormulSurumu,
  saveKgkBirlesikFormulVaryanti, KgkBirlesikTaslakDetay, KgkBirlesikFormulSurumu,
} from "@/api/FinansalTabloYonetimi/Tanimlar";

type Gecmis = Pick<KgkBirlesikFormulSurumu, "id" | "surumNo" | "aciklama" | "olusturmaTarihi">;

export default function BirlesikTaslakSayfasi() {
  const params = useParams();
  const id = Number(params.id);
  const token = useSelector((state: AppState) => state.userReducer.token);
  const [taslak, setTaslak] = useState<KgkBirlesikTaslakDetay | null>(null);
  const [son, setSon] = useState<KgkBirlesikFormulSurumu | null>(null);
  const [gecmis, setGecmis] = useState<Gecmis[]>([]);
  const [tabloAdi, setTabloAdi] = useState("");
  const [arama, setArama] = useState("");
  const [satirAnahtari, setSatirAnahtari] = useState("");
  const [kapsam, setKapsam] = useState(1);
  const [donusumTipi, setDonusumTipi] = useState(1);
  const [formul, setFormul] = useState("");
  const [dipnot, setDipnot] = useState("");
  const [kaynak, setKaynak] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (!token || !Number.isInteger(id) || id <= 0) return;
    let aktif = true;
    Promise.all([
      getKgkBirlesikTaslak(token, id),
      getKgkBirlesikSonFormulSurumu(token, id),
      getKgkBirlesikFormulSurumleri(token, id),
    ]).then(([kaynakTaslak, formulSurumu, tarihce]) => {
      if (!aktif) return;
      setTaslak(kaynakTaslak);
      setTabloAdi((eski) => eski || kaynakTaslak.icerik.tablolar[0]?.ad || "");
      setSon(formulSurumu);
      setGecmis(tarihce);
    }).catch((error) => { if (aktif) setHata(error instanceof Error ? error.message : "Taslak okunamadı."); });
    return () => { aktif = false; };
  }, [token, id]);

  useEffect(() => {
    const onceki = son?.varyantlar?.find((x) => x.tabloAdi === tabloAdi &&
      x.eslesmeAnahtari === satirAnahtari && x.kapsam === kapsam && x.donusumTipi === donusumTipi);
    setFormul(onceki?.hamFormul || "");
    setDipnot(onceki?.dipnot || "");
    setKaynak(onceki?.kaynak || "");
  }, [son, tabloAdi, satirAnahtari, kapsam, donusumTipi]);

  const tablo = taslak?.icerik.tablolar.find((x) => x.ad === tabloAdi);
  const gorunenSatirlar = (tablo?.kalemler || []).filter((x) =>
    x.eslesmeAnahtari.toLocaleLowerCase("tr-TR").includes(arama.toLocaleLowerCase("tr-TR"))).slice(0, 100);
  const satir = tablo?.kalemler.find((x) => x.eslesmeAnahtari === satirAnahtari);
  const mevcut = son?.varyantlar?.find((x) => x.tabloAdi === tabloAdi &&
    x.eslesmeAnahtari === satirAnahtari && x.kapsam === kapsam && x.donusumTipi === donusumTipi);

  useEffect(() => {
    if (satir && !satir.munferitMi && satir.konsolideMi) setKapsam(2);
    if (satir && satir.munferitMi && !satir.konsolideMi) setKapsam(1);
  }, [satir?.eslesmeAnahtari, satir?.munferitMi, satir?.konsolideMi]);

  const kaydet = async () => {
    if (!token || !taslak || !satir || yukleniyor) return;
    setHata(""); setMesaj(""); setYukleniyor(true);
    try {
      const sonuc = await saveKgkBirlesikFormulVaryanti(token, id, son?.surumNo || 0, {
        tabloAdi, eslesmeAnahtari: satirAnahtari, kapsam, donusumTipi,
        hamFormul: formul.trim() || null, dipnot: dipnot.trim() || null,
        hesaplamaKurali: null, kaynak: kaynak.trim() || null,
      }, aciklama.trim());
      const [guncel, tarihce] = await Promise.all([
        getKgkBirlesikSonFormulSurumu(token, id), getKgkBirlesikFormulSurumleri(token, id),
      ]);
      setSon(guncel); setGecmis(tarihce);
      setMesaj(`Formül sürümü #${sonuc.surumNo} kaydedildi. Önceki sürüm korundu.`);
      setAciklama("");
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Formül kaydedilemedi.");
    } finally {
      setYukleniyor(false);
    }
  };

  return <PageContainer title="Birleşik KGK taslağı" description="KGK kalemleri ve formül varyantları">
    <Breadcrumb title="Birleşik KGK taslağı" items={[{ title: "Finansal Tablolar", to: "/FinansalTabloYonetimi" }, { title: "Birleşik taslak" }]} />
    <ParentCard title={taslak ? `KGK taslağı #${taslak.ozet.id}` : "KGK taslağı yükleniyor"}>
      <Stack spacing={2}>
        {hata && <Alert severity="error" onClose={() => setHata("")}>{hata}</Alert>}
        {mesaj && <Alert severity="success" onClose={() => setMesaj("")}>{mesaj}</Alert>}
        {taslak && <Typography variant="body2" color="text.secondary">
          {taslak.ozet.tabloSayisi} tablo · {taslak.ozet.ortakKalemSayisi} ortak satır · {taslak.ozet.kapsamaOzelKalemSayisi} kapsama özel satır
          {taslak.ozet.belirsizEslesmeSayisi > 0 && ` · ${taslak.ozet.belirsizEslesmeSayisi} belirsiz eşleşme`}
        </Typography>}
        <Alert severity="info">Bu alandaki ham formüller ve dipnotlar taslak önerisidir. Rapor hesaplamasına bağlanmadan önce çalıştırılabilir kural olarak doğrulanmalıdır.</Alert>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField select size="small" label="Tablo" value={tabloAdi} onChange={(e) => { setTabloAdi(e.target.value); setSatirAnahtari(""); }} sx={{ minWidth: 280 }}>
            {taslak?.icerik.tablolar.map((x) => <MenuItem key={x.ad} value={x.ad}>{x.ad}</MenuItem>)}
          </TextField>
          <TextField size="small" label="Satır ara" value={arama} onChange={(e) => setArama(e.target.value)} fullWidth />
        </Stack>
        <TextField select size="small" label="KGK satırı" value={satirAnahtari} onChange={(e) => setSatirAnahtari(e.target.value)} fullWidth
          helperText="İlk 100 eşleşme gösterilir; arayarak daraltın. Belirsiz eşleşmelere formül atanamaz.">
          {gorunenSatirlar.map((x) => <MenuItem key={x.eslesmeAnahtari} value={x.eslesmeAnahtari} disabled={x.durum === "Belirsiz"}>
            {x.eslesmeAnahtari} · {x.durum}
          </MenuItem>)}
        </TextField>
        {satir && <Paper variant="outlined" sx={{ p: 1.5 }}><Stack spacing={1.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField select size="small" label="Kapsam" value={kapsam} onChange={(e) => setKapsam(Number(e.target.value))} sx={{ minWidth: 180 }}>
              {satir.munferitMi && <MenuItem value={1}>Münferit</MenuItem>}
              {satir.konsolideMi && <MenuItem value={2}>Konsolide</MenuItem>}
            </TextField>
            <TextField select size="small" label="Formül türü" value={donusumTipi} onChange={(e) => setDonusumTipi(Number(e.target.value))} sx={{ minWidth: 200 }}>
              <MenuItem value={1}>Normal</MenuItem><MenuItem value={2}>Enflasyon düzeltmesi</MenuItem>
            </TextField>
          </Stack>
          {mevcut && <Typography variant="caption" color="text.secondary">Bu kapsam ve formül türü için kayıtlı değer mevcut; düzenleme yeni revizyon oluşturur.</Typography>}
          <TextField label="Ham formül" value={formul} onChange={(e) => setFormul(e.target.value)} multiline minRows={2} fullWidth />
          <TextField label="Dipnot" value={dipnot} onChange={(e) => setDipnot(e.target.value)} fullWidth />
          <TextField label="Kaynak açıklaması" value={kaynak} onChange={(e) => setKaynak(e.target.value)} fullWidth />
          <TextField label="Değişiklik nedeni" value={aciklama} onChange={(e) => setAciklama(e.target.value)} fullWidth />
          <Box><Button variant="contained" onClick={kaydet} disabled={yukleniyor || satir.durum === "Belirsiz" ||
            (!formul.trim() && !dipnot.trim()) || !aciklama.trim()}>{yukleniyor ? "Kaydediliyor..." : "Yeni revizyon olarak kaydet"}</Button></Box>
        </Stack></Paper>}
        <Box>
          <Typography variant="subtitle2">Formül revizyonları</Typography>
          {gecmis.length === 0 ? <Typography variant="body2" color="text.secondary">Henüz kayıt yok.</Typography> :
            gecmis.slice(0, 10).map((x) => <Typography key={x.id} variant="body2">#{x.surumNo} · {new Date(x.olusturmaTarihi).toLocaleString("tr-TR")} · {x.aciklama}</Typography>)}
        </Box>
      </Stack>
    </ParentCard>
  </PageContainer>;
}
