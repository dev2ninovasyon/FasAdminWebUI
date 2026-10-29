"use client";

import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, FormControlLabel, Paper, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { FinansalSurum } from "@/api/FinansalTabloYonetimi/Tanimlar";
import {
  applyLegacyFormuller,
  compareLegacyFormuller,
  type LegacyFormulAktarimSonucu,
  type LegacyFormulKarsilastirma,
} from "@/api/FinansalTabloYonetimi/LegacyFormulAktarim";

type Props = {
  token: string;
  surum: FinansalSurum;
  onApplied: (sonuc: LegacyFormulAktarimSonucu) => void;
};

const durumKodu = (durum: FinansalSurum["durum"]) => typeof durum === "number" ? durum : Number(durum);

const LegacyFormulAktarimCard = ({ token, surum, onApplied }: Props) => {
  const [sonuc, setSonuc] = useState<LegacyFormulKarsilastirma | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [uygulaniyor, setUygulaniyor] = useState(false);
  const [onayli, setOnayli] = useState(false);
  const [hata, setHata] = useState("");

  const karsilastir = async () => {
    setYukleniyor(true);
    setHata("");
    try {
      setSonuc(await compareLegacyFormuller(token, surum.id));
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Eski formüller karşılaştırılamadı.");
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    let etkin = true;
    setSonuc(null);
    setOnayli(false);
    setHata("");
    setYukleniyor(true);
    compareLegacyFormuller(token, surum.id)
      .then((data) => etkin && setSonuc(data))
      .catch((error) => etkin && setHata(error instanceof Error ? error.message : "Eski formüller karşılaştırılamadı."))
      .finally(() => etkin && setYukleniyor(false));
    return () => { etkin = false; };
  }, [surum.id, token]);

  const uygula = async () => {
    if (!sonuc || !onayli) return;
    setUygulaniyor(true);
    setHata("");
    try {
      const uygulama = await applyLegacyFormuller(token, surum.id, {
        beklenenEszamanlilikSurumu: sonuc.eszamanlilikSurumu,
        beklenenKaynakSha256: sonuc.kaynakSha256,
      });
      onApplied(uygulama);
      setOnayli(false);
      setSonuc(await compareLegacyFormuller(token, surum.id));
    } catch (error) {
      setHata(error instanceof Error ? error.message : "Eski formüller aktarılamadı.");
    } finally {
      setUygulaniyor(false);
    }
  };

  const taslakMi = durumKodu(surum.durum) === 1;
  const blokluMu = (sonuc?.incelemeGerektirenFarkSayisi ?? 0) > 0;

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderColor: sonuc?.kilitliMi ? "success.main" : "divider" }}>
      <Stack spacing={1.25}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">Bir defalık eski sistem formül aktarımı</Typography>
            <Typography variant="caption" color="text.secondary">
              Formuller ve FormullerOzkaynak yalnız okunur; aktarım tamamlanınca bu tanım seti bir daha eski kaynaktan kontrol edilmez.
            </Typography>
          </Box>
          {yukleniyor && <CircularProgress size={20} />}
          {!yukleniyor && sonuc && (
            <Chip
              size="small"
              color={sonuc.kilitliMi ? "success" : blokluMu ? "error" : "warning"}
              variant={sonuc.kilitliMi ? "filled" : "outlined"}
              label={sonuc.kilitliMi ? "Aktarım tamamlandı · köprü kapalı" : blokluMu ? "İnceleme gerekiyor" : "Başlangıç aktarımı bekliyor"}
            />
          )}
          <Button size="small" variant="text" onClick={() => void karsilastir()} disabled={yukleniyor || uygulaniyor}>Yeniden kontrol et</Button>
        </Stack>

        {hata && <Alert severity="error" variant="outlined">{hata}</Alert>}
        {sonuc?.kilitliMi && (
          <Alert severity="success" variant="outlined">
            Eski sistem köprüsü sürüm {sonuc.kilitSurumId} üzerinde kapatıldı. Bundan sonraki formül değişiklikleri, karşılaştırmalar ve geri dönüşler yalnız yeni sürümlü yapı üzerinden yapılır.
          </Alert>
        )}

        {sonuc && !sonuc.kilitliMi && (
          <>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip size="small" variant="outlined" label={`${sonuc.karsilastirilanKuralSayisi} eski kural okundu`} />
              <Chip size="small" variant="outlined" color={sonuc.farkSayisi ? "warning" : "success"} label={`${sonuc.farkSayisi} fark`} />
              <Chip size="small" variant="outlined" color="success" label={`${sonuc.aktarilabilirFarkSayisi} otomatik aktarılabilir`} />
              <Chip size="small" variant="outlined" color={blokluMu ? "error" : "default"} label={`${sonuc.incelemeGerektirenFarkSayisi} inceleme`} />
              <Chip size="small" variant="outlined" label={`Kaynak SHA-256: ${sonuc.kaynakSha256.slice(0, 12)}…`} />
            </Stack>

            {!taslakMi && <Alert severity="info" variant="outlined">Başlangıç aktarımı yayımlanmış sürüme yazılmaz. Bu sürümden bir taslak oluşturup taslağı seçin.</Alert>}
            {blokluMu && <Alert severity="error" variant="outlined">Anlaşılamayan formüller çözülmeden kısmi aktarım yapılmaz ve köprü kapatılmaz. Aşağıdaki kayıtları inceleyin.</Alert>}

            {sonuc.farklar.length > 0 && (
              <Box sx={{ maxHeight: 280, overflow: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead><TableRow><TableCell>Tablo / hedef</TableCell><TableCell>Eski formül</TableCell><TableCell>Yeni sürümdeki formül</TableCell><TableCell>Durum</TableCell></TableRow></TableHead>
                  <TableBody>
                    {sonuc.farklar.map((fark) => (
                      <TableRow key={fark.kuralId} hover>
                        <TableCell><strong>{fark.tabloKodu}</strong> · {fark.hedefAdi}<br /><Typography variant="caption" color="text.secondary">{fark.hedefTuru} · eski kayıt #{fark.legacyFormulId}</Typography></TableCell>
                        <TableCell sx={{ maxWidth: 280, overflowWrap: "anywhere" }}>{fark.eskiFormul || "—"}</TableCell>
                        <TableCell sx={{ maxWidth: 280, overflowWrap: "anywhere" }}>{fark.yeniFormul || "—"}</TableCell>
                        <TableCell><Chip size="small" color={fark.aktarilabilirMi ? "success" : "error"} variant="outlined" label={fark.aktarilabilirMi ? "Hazır" : "İncele"} /><Typography display="block" variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>{fark.aciklama}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {taslakMi && !blokluMu && (
              <Stack spacing={0.75}>
                <FormControlLabel
                  control={<Checkbox size="small" checked={onayli} onChange={(event) => setOnayli(event.target.checked)} />}
                  label={<Typography variant="body2">Bu aktarımın tanım seti için yalnız bir kez yapılacağını ve sonraki kontrollerin yalnız yeni yapıdan ilerleyeceğini onaylıyorum.</Typography>}
                />
                <Button variant="contained" size="small" onClick={() => void uygula()} disabled={!onayli || uygulaniyor} sx={{ alignSelf: "flex-start" }}>
                  {uygulaniyor ? <CircularProgress size={18} color="inherit" /> : sonuc.farkSayisi > 0 ? "Tüm farkları aktar ve eski köprüyü kapat" : "Başlangıç kontrolünü tamamla ve eski köprüyü kapat"}
                </Button>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default LegacyFormulAktarimCard;
