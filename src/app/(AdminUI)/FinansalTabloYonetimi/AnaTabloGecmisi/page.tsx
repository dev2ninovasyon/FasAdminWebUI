"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert, Box, Button, CircularProgress, FormControlLabel, Paper, Stack, Switch,
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  AnaTabloGecmisKaydi,
  getFinansalTabloAnaTabloGecmisi,
  getFinansalTabloAnaTabloGecmisiDetayi,
} from "@/api/FinansalTabloYonetimi/Tanimlar";

type GecmisDetayi = Awaited<ReturnType<typeof getFinansalTabloAnaTabloGecmisiDetayi>>;
const tutar = (deger: number) => new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(deger);

export default function AnaTabloGecmisiSayfasi() {
  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);
  const [denetlenenId, setDenetlenenId] = useState("");
  const [yil, setYil] = useState(String(new Date().getFullYear()));
  const [konsolidasyonMu, setKonsolidasyonMu] = useState(false);
  const [kayitlar, setKayitlar] = useState<AnaTabloGecmisKaydi[]>([]);
  const [toplam, setToplam] = useState(0);
  const [sayfa, setSayfa] = useState(1);
  const [detay, setDetay] = useState<GecmisDetayi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [arandi, setArandi] = useState(false);

  const kayitlariGetir = async (hedefSayfa: number) => {
    if (!user.token) { setHata("Oturum bulunamadı. Yeniden giriş yapın."); return; }
    const firma = Number(denetlenenId);
    const donem = Number(yil);
    if (!Number.isSafeInteger(firma) || firma <= 0 || !Number.isSafeInteger(donem) || donem < 1900 || donem > 2200) {
      setHata("Geçerli firma kimliği ve yıl girin.");
      return;
    }
    setYukleniyor(true);
    setHata("");
    setDetay(null);
    if (hedefSayfa === 1) {
      setKayitlar([]);
      setToplam(0);
      setArandi(false);
    }
    try {
      const sonuc = await getFinansalTabloAnaTabloGecmisi(user.token, {
        denetlenenId: firma, yil: donem, konsolidasyonMu, sayfa: hedefSayfa,
      });
      setKayitlar(sonuc.kayitlar);
      setToplam(sonuc.toplam);
      setSayfa(hedefSayfa);
      setArandi(true);
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Tablo geçmişi okunamadı.");
    } finally {
      setYukleniyor(false);
    }
  };

  const detayiGetir = async (id: number) => {
    if (!user.token) return;
    setYukleniyor(true);
    setHata("");
    try {
      setDetay(await getFinansalTabloAnaTabloGecmisiDetayi(user.token, id));
    } catch (error) {
      setDetay(null);
      setHata(error instanceof Error ? error.message : "Geçmiş kaydı okunamadı.");
    } finally {
      setYukleniyor(false);
    }
  };

  const ara = (event: FormEvent) => { event.preventDefault(); void kayitlariGetir(1); };

  return <PageContainer title="Finansal tablo geçmişi" description="Yeniden oluşturma öncesinde saklanan finansal tablolar">
    <Breadcrumb title="Finansal tablo geçmişi" items={[
      { to: "/FinansalTabloYonetimi", title: "Finansal tablo yönetimi" },
    ]} />
    <ParentCard title="Önceki ana tablolar">
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Yeniden oluşturma sırasında saklanan eski değerleri ve dipnotları görüntüleyin. Bu sayfa kayıtları değiştirmez.
        </Typography>
        <Box component="form" onSubmit={ara}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
            <TextField size="small" label="Firma kimliği" type="number" required value={denetlenenId}
              onChange={(event) => setDenetlenenId(event.target.value)} inputProps={{ min: 1 }} />
            <TextField size="small" label="Yıl" type="number" required value={yil}
              onChange={(event) => setYil(event.target.value)} inputProps={{ min: 1900, max: 2200 }} />
            <FormControlLabel control={<Switch checked={konsolidasyonMu} onChange={(event) => setKonsolidasyonMu(event.target.checked)} />}
              label="Konsolide" />
            <Button type="submit" variant="contained" disabled={yukleniyor}>Geçmişi göster</Button>
            <Button variant="text" onClick={() => router.push("/FinansalTabloYonetimi")}>Yönetime dön</Button>
          </Stack>
        </Box>
        {hata && <Alert severity="error">{hata}</Alert>}
        {yukleniyor && <CircularProgress size={22} />}
        {arandi && !yukleniyor && toplam === 0 && <Alert severity="info">Bu firma, yıl ve kapsam için önceki tablo kaydı bulunamadı.</Alert>}
        {kayitlar.length > 0 && <Paper variant="outlined" sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead><TableRow><TableCell>Saklanma zamanı</TableCell><TableCell>Satır</TableCell><TableCell>Özkaynak</TableCell><TableCell>Yenileme sürümü</TableCell><TableCell /></TableRow></TableHead>
            <TableBody>{kayitlar.map((kayit) => <TableRow key={kayit.id} selected={detay?.id === kayit.id}>
              <TableCell>{new Date(kayit.arsivlemeTarihi).toLocaleString("tr-TR")}</TableCell>
              <TableCell>{kayit.satirSayisi}</TableCell><TableCell>{kayit.ozkaynakSatirSayisi}</TableCell>
              <TableCell>#{kayit.hedefSurumId}</TableCell>
              <TableCell align="right"><Button size="small" onClick={() => void detayiGetir(kayit.id)}>Görüntüle</Button></TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </Paper>}
        {toplam > 20 && <Stack direction="row" spacing={1} alignItems="center">
          <Button disabled={yukleniyor || sayfa === 1} onClick={() => void kayitlariGetir(sayfa - 1)}>Önceki</Button>
          <Typography variant="body2">Sayfa {sayfa} / {Math.ceil(toplam / 20)}</Typography>
          <Button disabled={yukleniyor || sayfa * 20 >= toplam} onClick={() => void kayitlariGetir(sayfa + 1)}>Sonraki</Button>
        </Stack>}
        {detay && <Stack spacing={1.5}>
          <Alert severity="success">İçerik doğrulandı. {new Date(detay.arsivlemeTarihi).toLocaleString("tr-TR")} tarihindeki eski tablo görüntüleniyor.</Alert>
          {Array.from(new Set(detay.satirlar.map((satir) => satir.TabloAdi))).map((tabloAdi) => <Paper key={tabloAdi} variant="outlined" sx={{ overflowX: "auto" }}>
            <Typography variant="subtitle2" sx={{ p: 1.5 }}>{tabloAdi}</Typography>
            <Table size="small"><TableHead><TableRow><TableCell>Kod</TableCell><TableCell>Kalem</TableCell><TableCell>Dipnot</TableCell><TableCell align="right">Cari</TableCell><TableCell align="right">Önceki</TableCell><TableCell align="right">İki önceki</TableCell></TableRow></TableHead>
              <TableBody>{detay.satirlar.filter((satir) => satir.TabloAdi === tabloAdi).map((satir) => <TableRow key={satir.Id}>
                <TableCell>{satir.KalemKodu}</TableCell><TableCell>{satir.KalemAdi}</TableCell><TableCell>{satir.Dipnot || "—"}</TableCell>
                <TableCell align="right">{tutar(satir.TutarYil1)}</TableCell><TableCell align="right">{tutar(satir.TutarYil2)}</TableCell><TableCell align="right">{tutar(satir.TutarYil3)}</TableCell>
              </TableRow>)}</TableBody></Table>
          </Paper>)}
          {detay.ozkaynaklar.length > 0 && <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <Typography variant="subtitle2" sx={{ p: 1.5 }}>Özkaynak değişim tablosu</Typography>
            <Table size="small"><TableHead><TableRow><TableCell>Satır</TableCell><TableCell>Sütun</TableCell><TableCell>Dipnot</TableCell><TableCell align="right">Tutar</TableCell></TableRow></TableHead>
              <TableBody>{detay.ozkaynaklar.map((satir) => <TableRow key={satir.Id}>
                <TableCell>{satir.DikeyKalemAdi}</TableCell><TableCell>{satir.YatayKalemAdi}</TableCell><TableCell>{satir.Dipnot || "—"}</TableCell><TableCell align="right">{tutar(satir.Tutar)}</TableCell>
              </TableRow>)}</TableBody></Table>
          </Paper>}
        </Stack>}
      </Stack>
    </ParentCard>
  </PageContainer>;
}
