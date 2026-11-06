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
  getKgkBirlesikFormulHazirligi, createKgkBirlesikYayinTaslagi, saveKgkBirlesikFormulVaryanti,
  previewKgkBirlesikTaslak, KgkBirlesikOnizlemeSonucu,
  previewKgkBirlesikGercekMizan,
  publishKgkKismiRapor, getKgkKismiRapor, listKgkKismiRaporlar,
  KgkKismiRaporOzeti, KgkKismiRaporDetayi,
  KgkBirlesikTaslakDetay, KgkBirlesikFormulSurumu, KgkBirlesikFormulHazirligi,
} from "@/api/FinansalTabloYonetimi/Tanimlar";
import { FinansalTabloTestMizan, getFinansalTabloTestMizanlari } from "@/api/FinansalTabloYonetimi/TestMizan";

type Gecmis = Pick<KgkBirlesikFormulSurumu, "id" | "surumNo" | "aciklama" | "olusturmaTarihi">;

export default function BirlesikTaslakSayfasi() {
  const params = useParams();
  const id = Number(params.id);
  const user = useSelector((state: AppState) => state.userReducer);
  const token = user.token;
  const [taslak, setTaslak] = useState<KgkBirlesikTaslakDetay | null>(null);
  const [son, setSon] = useState<KgkBirlesikFormulSurumu | null>(null);
  const [surumGuncelMi, setSurumGuncelMi] = useState(false);
  const [hazirlik, setHazirlik] = useState<KgkBirlesikFormulHazirligi | null>(null);
  const [hazirlikHatasi, setHazirlikHatasi] = useState("");
  const [gecmis, setGecmis] = useState<Gecmis[]>([]);
  const [tabloAdi, setTabloAdi] = useState("");
  const [arama, setArama] = useState("");
  const [yalnizEksikler, setYalnizEksikler] = useState(false);
  const [satirAnahtari, setSatirAnahtari] = useState("");
  const [sutunAnahtari, setSutunAnahtari] = useState("");
  const [kapsam, setKapsam] = useState(1);
  const [formul, setFormul] = useState("");
  const [dipnot, setDipnot] = useState("");
  const [kaynak, setKaynak] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [yayinTarihi, setYayinTarihi] = useState("");
  const [yayinAciklamasi, setYayinAciklamasi] = useState("");
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [testMizanlari, setTestMizanlari] = useState<FinansalTabloTestMizan[]>([]);
  const [testMizanId, setTestMizanId] = useState("");
  const [onizleme, setOnizleme] = useState<KgkBirlesikOnizlemeSonucu | null>(null);
  const [onizlemeHatasi, setOnizlemeHatasi] = useState("");
  const [onizlemeYukleniyor, setOnizlemeYukleniyor] = useState(false);
  const [yayinDenetlenenId, setYayinDenetlenenId] = useState("");
  const [yayinYil, setYayinYil] = useState("");
  const [kismiYayinlar, setKismiYayinlar] = useState<KgkKismiRaporOzeti[]>([]);
  const [seciliRapor, setSeciliRapor] = useState<KgkKismiRaporDetayi | null>(null);
  const [raporSayfasi, setRaporSayfasi] = useState(0);
  const [kismiYayinYukleniyor, setKismiYayinYukleniyor] = useState(false);
  const [kismiYayinHatasi, setKismiYayinHatasi] = useState("");
  const [gercekOnizleme, setGercekOnizleme] = useState<KgkBirlesikOnizlemeSonucu | null>(null);
  const [gercekOnizlemeYukleniyor, setGercekOnizlemeYukleniyor] = useState(false);

  useEffect(() => {
    if (!yayinDenetlenenId && user.denetlenenId) setYayinDenetlenenId(String(user.denetlenenId));
    if (!yayinYil && user.yil) setYayinYil(String(user.yil));
  }, [user.denetlenenId, user.yil, yayinDenetlenenId, yayinYil]);

  useEffect(() => {
    setSeciliRapor(null);
    setRaporSayfasi(0);
  }, [yayinDenetlenenId, yayinYil, kapsam]);
  useEffect(() => { setGercekOnizleme(null); },
    [yayinDenetlenenId, yayinYil, kapsam, tabloAdi, son?.surumNo]);

  useEffect(() => {
    if (!token || !Number(yayinDenetlenenId) || !Number(yayinYil)) return;
    let aktif = true;
    listKgkKismiRaporlar(token, Number(yayinDenetlenenId), Number(yayinYil), kapsam === 2)
      .then((kayitlar) => { if (aktif) setKismiYayinlar(kayitlar); })
      .catch(() => { if (aktif) setKismiYayinlar([]); });
    return () => { aktif = false; };
  }, [token, yayinDenetlenenId, yayinYil, kapsam]);

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
      setSurumGuncelMi(true);
      setGecmis(tarihce);
    }).catch((error) => { if (aktif) setHata(error instanceof Error ? error.message : "Taslak okunamadı."); });
    getKgkBirlesikFormulHazirligi(token, id).then((durum) => {
      if (aktif) { setHazirlik(durum); setHazirlikHatasi(""); }
    }).catch((error) => {
      if (aktif) { setHazirlik(null); setHazirlikHatasi(error instanceof Error ? error.message : "Formül hazırlığı okunamadı."); }
    });
    getFinansalTabloTestMizanlari(token, 100).then((mizanlar) => {
      if (aktif) setTestMizanlari(mizanlar);
    }).catch(() => { if (aktif) setTestMizanlari([]); });
    return () => { aktif = false; };
  }, [token, id]);

  useEffect(() => {
    const onceki = son?.varyantlar?.find((x) => x.tabloAdi === tabloAdi &&
      x.eslesmeAnahtari === satirAnahtari && x.yataySutunAnahtari === (sutunAnahtari || null) &&
      x.kapsam === kapsam && x.donusumTipi === 1);
    setFormul(onceki?.hamFormul || "");
    setDipnot(onceki?.dipnot || "");
    setKaynak(onceki?.kaynak || "");
  }, [son, tabloAdi, satirAnahtari, sutunAnahtari, kapsam]);

  const tablo = taslak?.icerik.tablolar.find((x) => x.ad === tabloAdi);
  const matrisSutunlari = (kapsam === 1 ? tablo?.munferit : tablo?.konsolide)?.sutunlar || [];
  const veriSutunlari = matrisSutunlari.filter((x) => x.ilkSutunNo === x.sonSutunNo &&
    !matrisSutunlari.some((alt) => alt.ustSabitAnahtar === x.sabitAnahtar));
  const sutunHaritasi = new Map(matrisSutunlari.map((x) => [x.sabitAnahtar, x]));
  const sutunDerinligi = (anahtar: string | null) => {
    let derinlik = 0;
    const ziyaret = new Set<string>();
    while (anahtar && sutunHaritasi.has(anahtar) && !ziyaret.has(anahtar)) {
      ziyaret.add(anahtar);
      derinlik++;
      anahtar = sutunHaritasi.get(anahtar)?.ustSabitAnahtar || null;
    }
    return derinlik;
  };
  const eksikAnahtarlar = new Set((hazirlik?.sonuc.eksikler || [])
    .filter((x) => x.tabloAdi === tabloAdi && x.kapsam === kapsam)
    .map((x) => x.eslesmeAnahtari));
  const gorunenSatirlar = (tablo?.kalemler || []).filter((x) => {
    const kaynak = (kapsam === 1 ? x.munferitKaynaklari : x.konsolideKaynaklari)?.[0];
    const aranan = arama.toLocaleLowerCase("tr-TR");
    return (kapsam === 1 ? x.munferitMi : x.konsolideMi) &&
      (!yalnizEksikler || eksikAnahtarlar.has(x.eslesmeAnahtari)) &&
      (`${kaynak?.ad || ""} ${kaynak?.satirNo || ""} ${x.eslesmeAnahtari}`)
        .toLocaleLowerCase("tr-TR").includes(aranan);
  }).slice(0, 100);
  const satir = tablo?.kalemler.find((x) => x.eslesmeAnahtari === satirAnahtari);
  const mevcut = son?.varyantlar?.find((x) => x.tabloAdi === tabloAdi &&
    x.eslesmeAnahtari === satirAnahtari && x.yataySutunAnahtari === (sutunAnahtari || null) &&
    x.kapsam === kapsam && x.donusumTipi === 1);
  const arsivTablosu = seciliRapor?.icerik.tablolar.find((x) => x.ad === tabloAdi);
  const arsivHucreleri = arsivTablosu?.hucreler || [];

  useEffect(() => { setSutunAnahtari(""); }, [tabloAdi, kapsam]);
  useEffect(() => { setOnizleme(null); setOnizlemeHatasi(""); }, [tabloAdi, testMizanId, son?.surumNo]);

  const onizle = async () => {
    if (!token || !son || !tabloAdi || !testMizanId || onizlemeYukleniyor) return;
    setOnizlemeHatasi(""); setOnizlemeYukleniyor(true);
    try {
      setOnizleme(await previewKgkBirlesikTaslak(token, id, son.surumNo, tabloAdi, testMizanId));
    } catch (error) {
      setOnizlemeHatasi(error instanceof Error ? error.message : "Önizleme oluşturulamadı.");
    } finally {
      setOnizlemeYukleniyor(false);
    }
  };

  const kismiYayinla = async () => {
    const firmaId = Number(yayinDenetlenenId);
    const yil = Number(yayinYil);
    if (!token || !son || !surumGuncelMi || !Number.isInteger(firmaId) || firmaId <= 0 ||
      !Number.isInteger(yil) || yil < 1900 || yil > 2200 || kismiYayinYukleniyor) return;
    setKismiYayinHatasi(""); setKismiYayinYukleniyor(true);
    try {
      const yayin = await publishKgkKismiRapor(token, id, son.surumNo, firmaId, yil, kapsam);
      const [detay, kayitlar] = await Promise.all([
        getKgkKismiRapor(token, yayin.id),
        listKgkKismiRaporlar(token, firmaId, yil, kapsam === 2),
      ]);
      setSeciliRapor(detay); setKismiYayinlar(kayitlar); setRaporSayfasi(0);
      setMesaj(`${yayin.hesaplananHucreSayisi} tutar hesaplandı; ${yayin.hesaplanmayanHucreSayisi} tutar hesaplanmadı. Kısmi rapor arşive kaydedildi.`);
    } catch (error) {
      setKismiYayinHatasi(error instanceof Error ? error.message : "Kısmi rapor yayımlanamadı.");
    } finally {
      setKismiYayinYukleniyor(false);
    }
  };

  const gercekMizaniOnizle = async () => {
    const firmaId = Number(yayinDenetlenenId);
    const yil = Number(yayinYil);
    if (!token || !son || !tabloAdi || !Number.isInteger(firmaId) || firmaId <= 0 ||
      !Number.isInteger(yil) || yil < 1900 || yil > 2200 || gercekOnizlemeYukleniyor) return;
    setKismiYayinHatasi(""); setGercekOnizlemeYukleniyor(true);
    try {
      setGercekOnizleme(await previewKgkBirlesikGercekMizan(token, id,
        son.surumNo, tabloAdi, firmaId, yil, kapsam));
    } catch (error) {
      setKismiYayinHatasi(error instanceof Error ? error.message : "Gerçek mizan önizlemesi oluşturulamadı.");
    } finally {
      setGercekOnizlemeYukleniyor(false);
    }
  };

  const raporAc = async (raporId: string) => {
    if (!token) return;
    setKismiYayinHatasi("");
    try {
      setSeciliRapor(await getKgkKismiRapor(token, raporId));
      setRaporSayfasi(0);
    } catch (error) {
      setKismiYayinHatasi(error instanceof Error ? error.message : "Kısmi rapor açılamadı.");
    }
  };

  const kaydet = async () => {
    if (!token || !taslak || !satir || !surumGuncelMi || yukleniyor || (matrisSutunlari.length > 0 && !sutunAnahtari)) return;
    setHata(""); setMesaj(""); setYukleniyor(true);
    try {
      const sonuc = await saveKgkBirlesikFormulVaryanti(token, id, son?.surumNo || 0, {
        tabloAdi, eslesmeAnahtari: satirAnahtari, yataySutunAnahtari: sutunAnahtari || null,
        kapsam, donusumTipi: 1,
        hamFormul: formul.trim() || null, dipnot: dipnot.trim() || null,
        hesaplamaKurali: null, kaynak: kaynak.trim() || null,
      }, aciklama.trim());
      setSurumGuncelMi(false);
      setHazirlik(null);
      setMesaj(`Formül sürümü #${sonuc.surumNo} kaydedildi. Önceki sürüm korundu.`);
      setAciklama("");
      try {
        const [guncel, tarihce] = await Promise.all([
          getKgkBirlesikSonFormulSurumu(token, id), getKgkBirlesikFormulSurumleri(token, id),
        ]);
        setSon(guncel); setGecmis(tarihce); setSurumGuncelMi(true);
      } catch {
        setHata("Formül kaydedildi, ancak güncel alt sürüm okunamadı. Yeniden düzenlemeden önce sayfayı yenileyin.");
        return;
      }
      try {
        setHazirlik(await getKgkBirlesikFormulHazirligi(token, id));
        setHazirlikHatasi("");
      } catch (error) {
        setHazirlikHatasi(error instanceof Error ? error.message : "Formül hazırlığı okunamadı.");
      }
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Formül kaydedilemedi.");
    } finally {
      setYukleniyor(false);
    }
  };

  const yayinTaslagiOlustur = async () => {
    if (!token || !hazirlik?.sonuc.hazirMi || !yayinTarihi || !yayinAciklamasi.trim() || yukleniyor) return;
    setHata(""); setMesaj(""); setYukleniyor(true);
    try {
      const sonuc = await createKgkBirlesikYayinTaslagi(token, id, hazirlik.surumNo,
        yayinTarihi, yayinAciklamasi.trim());
      setMesaj(`${sonuc.surumler.length} kapsam için yayın taslağı ${sonuc.zatenOlusturulmus ? "zaten mevcut" : "oluşturuldu"}. Finansal Tablolar sayfasından teknik test ve devreye alma adımına geçin.`);
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Yayın taslakları oluşturulamadı.");
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
        {hazirlikHatasi && <Alert severity="warning">Formüller düzenlenebilir; yayın hazırlığı denetlenemedi: {hazirlikHatasi}</Alert>}
        {taslak && <Typography variant="body2" color="text.secondary">
          {taslak.ozet.tabloSayisi} tablo · {taslak.ozet.ortakKalemSayisi} ortak satır · {taslak.ozet.kapsamaOzelKalemSayisi} kapsama özel satır
          {taslak.ozet.belirsizEslesmeSayisi > 0 && ` · ${taslak.ozet.belirsizEslesmeSayisi} belirsiz eşleşme`}
        </Typography>}
        {hazirlik && <Alert severity={hazirlik.sonuc.hazirMi ? "success" : "warning"}>
          Formül alt sürümü #{hazirlik.surumNo}: {hazirlik.sonuc.mevcutFormulSayisi} / {hazirlik.sonuc.gerekliFormulSayisi} formül kayıtlı.
          {hazirlik.sonuc.eksikler.length > 0 && ` ${hazirlik.sonuc.eksikler.length} eksik formül var; bu sürüm henüz rapor üretimine açılamaz.`}
          {hazirlik.sonuc.yapiSorunlari.length > 0 && ` ${hazirlik.sonuc.yapiSorunlari.length} yapı sorunu var.`}
          {hazirlik.sonuc.derlemeSorunlari.length > 0 && ` ${hazirlik.sonuc.derlemeSorunlari.length} derleme sorunu var.`}
        </Alert>}
        <Alert severity="info">Bu alandaki ham formüller ve dipnotlar taslak önerisidir. Rapor hesaplamasına bağlanmadan önce çalıştırılabilir kural olarak doğrulanmalıdır.</Alert>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField select size="small" label="Tablo" value={tabloAdi} onChange={(e) => { setTabloAdi(e.target.value); setSatirAnahtari(""); }} sx={{ minWidth: 280 }}>
            {taslak?.icerik.tablolar.map((x) => <MenuItem key={x.ad} value={x.ad}>{x.ad}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={0.5}>
            <Button size="small" variant={kapsam === 1 ? "contained" : "outlined"}
              onClick={() => { setKapsam(1); setSatirAnahtari(""); }}>Münferit</Button>
            <Button size="small" variant={kapsam === 2 ? "contained" : "outlined"}
              onClick={() => { setKapsam(2); setSatirAnahtari(""); }}>Konsolide</Button>
          </Stack>
          <TextField size="small" label="Satır ara" value={arama} onChange={(e) => setArama(e.target.value)} fullWidth />
          <Button size="small" variant={yalnizEksikler ? "contained" : "outlined"}
            onClick={() => { setYalnizEksikler((deger) => !deger); setSatirAnahtari(""); }}>
            Eksikleri göster ({eksikAnahtarlar.size})
          </Button>
        </Stack>
        <TextField select size="small" label="KGK satırı" value={satirAnahtari} onChange={(e) => setSatirAnahtari(e.target.value)} fullWidth
          helperText="İlk 100 eşleşme gösterilir; arayarak daraltın. Belirsiz eşleşmelere formül atanamaz.">
          {gorunenSatirlar.map((x) => <MenuItem key={x.eslesmeAnahtari} value={x.eslesmeAnahtari}
            disabled={x.durum === "Belirsiz" || (kapsam === 1 ? x.munferitKaynaklari : x.konsolideKaynaklari)?.[0]?.kalemTuru === "Baslik"}>
            {(kapsam === 1 ? x.munferitKaynaklari : x.konsolideKaynaklari)?.[0]?.ad || x.eslesmeAnahtari}
            {eksikAnahtarlar.has(x.eslesmeAnahtari) ? " · Formül eksik" : ""}
            {x.durum === "Belirsiz" ? " · Eşleşme belirsiz" : ""}
          </MenuItem>)}
        </TextField>
        {(tablo?.munferit?.sutunlar?.length || tablo?.konsolide?.sutunlar?.length) ? <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Özkaynak sütun hiyerarşisi</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant={kapsam === 1 ? "contained" : "outlined"} onClick={() => setKapsam(1)}>Münferit</Button>
              <Button size="small" variant={kapsam === 2 ? "contained" : "outlined"} onClick={() => setKapsam(2)}>Konsolide</Button>
            </Stack>
            <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
              {matrisSutunlari.length === 0 ? <Typography variant="body2" color="text.secondary">Bu taslakta sütun ekseni kaydı yok.</Typography> :
                matrisSutunlari.map((x) => <Box key={x.sabitAnahtar} sx={{ pl: Math.min(sutunDerinligi(x.ustSabitAnahtar), 4) * 2,
                  py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Typography variant="body2"><strong>{x.sutun}</strong> · {x.ad}</Typography>
                  {x.ustSabitAnahtar && <Typography variant="caption" color="text.secondary">
                    Üst başlık: {sutunHaritasi.get(x.ustSabitAnahtar)?.ad || "Bulunamadı"}
                  </Typography>}
                </Box>)}
            </Box>
          </Stack>
        </Paper> : null}
        {satir && <Paper variant="outlined" sx={{ p: 1.5 }}><Stack spacing={1.5}>
          {matrisSutunlari.length > 0 && <TextField select size="small" label="Özkaynak sütunu"
            value={sutunAnahtari} onChange={(e) => setSutunAnahtari(e.target.value)} fullWidth
            helperText="Formül seçilen satır ve sütun hücresine kaydedilir.">
            <MenuItem value="">Sütun seçin</MenuItem>
            {veriSutunlari.map((x) => <MenuItem key={x.sabitAnahtar} value={x.sabitAnahtar}>
              {x.sutun} · {x.ad}
            </MenuItem>)}
          </TextField>}
          {mevcut && <Typography variant="caption" color="text.secondary">Bu satır, sütun ve kapsam için kayıtlı değer mevcut; düzenleme yeni revizyon oluşturur.</Typography>}
          <TextField label="Ham formül" value={formul} onChange={(e) => setFormul(e.target.value)} multiline minRows={2} fullWidth />
          <TextField label="Dipnot" value={dipnot} onChange={(e) => setDipnot(e.target.value)} fullWidth />
          <TextField label="Kaynak açıklaması" value={kaynak} onChange={(e) => setKaynak(e.target.value)} fullWidth />
          <TextField label="Değişiklik nedeni" value={aciklama} onChange={(e) => setAciklama(e.target.value)} fullWidth />
          <Box><Button variant="contained" onClick={kaydet} disabled={yukleniyor || satir.durum === "Belirsiz" ||
            !surumGuncelMi ||
            (matrisSutunlari.length > 0 && !sutunAnahtari) ||
            (!formul.trim() && !dipnot.trim()) || !aciklama.trim()}>{yukleniyor ? "Kaydediliyor..." : "Yeni revizyon olarak kaydet"}</Button></Box>
        </Stack></Paper>}
        <Box>
          <Typography variant="subtitle2">Formül revizyonları</Typography>
          {gecmis.length === 0 ? <Typography variant="body2" color="text.secondary">Henüz kayıt yok.</Typography> :
            gecmis.slice(0, 10).map((x) => <Typography key={x.id} variant="body2">#{x.surumNo} · {new Date(x.olusturmaTarihi).toLocaleString("tr-TR")} · {x.aciklama}</Typography>)}
        </Box>
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Örnek mizanla önizle</Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField select size="small" label="Örnek mizan" value={testMizanId}
                onChange={(e) => setTestMizanId(e.target.value)} sx={{ minWidth: 260 }}>
                <MenuItem value="">Mizan seçin</MenuItem>
                {testMizanlari.map((x) => <MenuItem key={x.id} value={x.id}>
                  {x.ad} · {x.yil} · {x.konsolidasyonMu ? "Konsolide" : "Münferit"}
                </MenuItem>)}
              </TextField>
              <Button variant="outlined" onClick={onizle} disabled={!son || !testMizanId || onizlemeYukleniyor}>
                {onizlemeYukleniyor ? "Hesaplanıyor..." : "Tabloyu önizle"}
              </Button>
            </Stack>
            {onizlemeHatasi && <Alert severity="error">{onizlemeHatasi}</Alert>}
            {onizleme && <>
              <Alert severity={onizleme.tamMi ? "success" : "warning"}>
                {onizleme.tamMi ? "Tablo tam hesaplandı." :
                  `${onizleme.eksikFormulSayisi} formül eksik; boş tutarlar hesaplanmadı olarak gösteriliyor.`}
              </Alert>
              <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
                {onizleme.hucreler.filter((x) => x.kapsam === kapsam).slice(0, 100).map((x) => {
                  const kalem = tablo?.kalemler.find((y) => y.eslesmeAnahtari === x.eslesmeAnahtari);
                  const ad = (kapsam === 1 ? kalem?.munferitKaynaklari : kalem?.konsolideKaynaklari)?.[0]?.ad || x.eslesmeAnahtari;
                  return <Box key={`${x.eslesmeAnahtari}:${x.yataySutunAnahtari || ""}`} sx={{ py: 0.75,
                    borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="body2">{ad}{x.yataySutunAnahtari ? ` · ${x.yataySutunAnahtari}` : ""}</Typography>
                    <Typography variant="body2" color={x.deger === null ? "warning.main" : "text.primary"} title={x.hata || ""}>
                      {x.deger === null ? "Hesaplanmadı" : x.deger.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>;
                })}
              </Box>
              {onizleme.hucreler.filter((x) => x.kapsam === kapsam).length > 100 &&
                <Typography variant="caption" color="text.secondary">İlk 100 hücre gösteriliyor.</Typography>}
            </>}
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Kısmi raporu yayımla</Typography>
            <Typography variant="body2" color="text.secondary">
              Güncel formül alt sürümü gerçek dönüşüm mizanıyla hesaplanır. Eksik tutarlar “Hesaplanmadı” olarak değişmez arşive kaydedilir.
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField size="small" type="number" label="Firma ID" value={yayinDenetlenenId}
                onChange={(e) => setYayinDenetlenenId(e.target.value)} sx={{ minWidth: 140 }} />
              <TextField size="small" type="number" label="Yıl" value={yayinYil}
                onChange={(e) => setYayinYil(e.target.value)} sx={{ minWidth: 120 }} />
              <Button variant="outlined" onClick={gercekMizaniOnizle}
                disabled={!son || !tabloAdi || !Number(yayinDenetlenenId) || !Number(yayinYil) || gercekOnizlemeYukleniyor}>
                {gercekOnizlemeYukleniyor ? "Hesaplanıyor..." : "Gerçek mizanla önizle"}
              </Button>
              <Button variant="contained" onClick={kismiYayinla}
                disabled={!son || !surumGuncelMi || !Number(yayinDenetlenenId) || !Number(yayinYil) || kismiYayinYukleniyor}>
                {kismiYayinYukleniyor ? "Yayımlanıyor..." : `${kapsam === 2 ? "Konsolide" : "Münferit"} kısmi raporu yayımla`}
              </Button>
            </Stack>
            {kismiYayinHatasi && <Alert severity="error">{kismiYayinHatasi}</Alert>}
            {gercekOnizleme && <>
              <Alert severity={gercekOnizleme.yapiSorunuSayisi ? "error" : "info"}>
                {tabloAdi}: {gercekOnizleme.hucreler.filter((x) => x.deger !== null).length} tutar hesaplandı,
                {` ${gercekOnizleme.hucreler.filter((x) => x.deger === null).length}`} tutar hesaplanmadı.
                {gercekOnizleme.yapiSorunuSayisi > 0 && " Yapı hatası var; yayın engellenir."}
              </Alert>
              <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                {gercekOnizleme.hucreler.slice(0, 30).map((x) => {
                  const eslesme = tablo?.kalemler.find((y) => y.eslesmeAnahtari === x.eslesmeAnahtari);
                  const ad = (kapsam === 2 ? eslesme?.konsolideKaynaklari : eslesme?.munferitKaynaklari)?.[0]?.ad || x.eslesmeAnahtari;
                  return <Box key={`${x.eslesmeAnahtari}:${x.yataySutunAnahtari || ""}`} sx={{ py: 0.5,
                    display: "flex", justifyContent: "space-between", gap: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2">{ad}</Typography>
                    <Typography variant="body2" color={x.deger === null ? "warning.main" : "text.primary"} title={x.hata || ""}>
                      {x.deger === null ? "Hesaplanmadı" : x.deger.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>;
                })}
              </Box>
              {gercekOnizleme.hucreler.length > 30 &&
                <Typography variant="caption">İlk 30 hücre gösteriliyor; yayın tüm tabloları hesaplar.</Typography>}
            </>}
            {kismiYayinlar.length > 0 && <Stack spacing={0.5}>
              <Typography variant="body2">Önceki kısmi yayınlar</Typography>
              {kismiYayinlar.filter((x) => x.birlesikTaslakId === id).slice(0, 10).map((x) =>
                <Button key={x.id} size="small" variant="text" onClick={() => raporAc(x.id)} sx={{ alignSelf: "flex-start" }}>
                  {new Date(x.olusturmaTarihi).toLocaleString("tr-TR")} · {x.hesaplananHucreSayisi} hesaplandı · {x.hesaplanmayanHucreSayisi} hesaplanmadı
                </Button>)}
            </Stack>}
            {seciliRapor && <>
              <Alert severity={seciliRapor.hesaplanmayanHucreSayisi ? "warning" : "success"}>
                Arşiv #{seciliRapor.id}: {seciliRapor.hesaplananHucreSayisi} hesaplandı,
                {` ${seciliRapor.hesaplanmayanHucreSayisi}`} hesaplanmadı. Ana rapor kayıtları bu arşivle değiştirilmez.
              </Alert>
              {arsivTablosu ? <>
                <Typography variant="body2">{arsivTablosu.ad} · {arsivHucreleri.length} hücre</Typography>
                <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
                  {arsivHucreleri.slice(raporSayfasi * 100, (raporSayfasi + 1) * 100).map((x) => {
                    const eslesme = arsivTablosu.eslesmeler.find((y) => y.eslesmeAnahtari === x.eslesmeAnahtari);
                    const ad = (seciliRapor.konsolidasyonMu ? eslesme?.konsolideKaynaklari : eslesme?.munferitKaynaklari)?.[0]?.ad || x.eslesmeAnahtari;
                    return <Box key={`${x.eslesmeAnahtari}:${x.yataySutunAnahtari || ""}`} sx={{ py: 0.75,
                      borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", gap: 2 }}>
                      <Typography variant="body2">{ad}{x.yataySutunAnahtari ? ` · ${x.yataySutunAnahtari}` : ""}</Typography>
                      <Typography variant="body2" color={x.deger === null ? "warning.main" : "text.primary"} title={x.hata || ""}>
                        {x.deger === null ? "Hesaplanmadı" : x.deger.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>;
                  })}
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button size="small" disabled={raporSayfasi === 0} onClick={() => setRaporSayfasi((s) => s - 1)}>Önceki</Button>
                  <Typography variant="caption">{raporSayfasi + 1} / {Math.max(1, Math.ceil(arsivHucreleri.length / 100))}</Typography>
                  <Button size="small" disabled={(raporSayfasi + 1) * 100 >= arsivHucreleri.length}
                    onClick={() => setRaporSayfasi((s) => s + 1)}>Sonraki</Button>
                </Stack>
              </> : <Typography variant="body2" color="text.secondary">Bu raporda seçili tablo bulunmuyor.</Typography>}
            </>}
          </Stack>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Yayın taslağına aktar</Typography>
            <Typography variant="body2" color="text.secondary">
              Formüller ve yapı doğrulandığında münferit ve konsolide tablolar aynı KGK ana sürümünden taslak olarak oluşturulur.
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
              <TextField size="small" type="date" label="Geçerlilik başlangıcı" value={yayinTarihi}
                onChange={(e) => setYayinTarihi(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 210 }} />
              <TextField size="small" label="Değişiklik açıklaması" value={yayinAciklamasi}
                onChange={(e) => setYayinAciklamasi(e.target.value)} fullWidth />
              <Button variant="contained" onClick={yayinTaslagiOlustur}
                disabled={!hazirlik?.sonuc.hazirMi || !yayinTarihi || !yayinAciklamasi.trim() || yukleniyor}>
                Taslakları oluştur
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </ParentCard>
  </PageContainer>;
}
