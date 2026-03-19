import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getMenuUsageByMenuId, Menu, MenuKullanimBilgisi, upsertMenuUsage } from "@/api/Menu/Menu";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface MenuUsageDialogProps {
  open: boolean;
  onClose: () => void;
  menu: Menu | null;
  onSuccess: () => void;
}

type FormState = {
  baslik: string;
  ozet: string;
  kullanimNotu: string;
  kullanimAdimlari: string;
  dikkatEdilecekler: string;
  sikSorulanSorular: string;
  videoUrl: string;
  videoBaslik: string;
  videoAciklama: string;
};

const emptyForm: FormState = {
  baslik: "",
  ozet: "",
  kullanimNotu: "",
  kullanimAdimlari: "",
  dikkatEdilecekler: "",
  sikSorulanSorular: "",
  videoUrl: "",
  videoBaslik: "",
  videoAciklama: "",
};

const parseList = (value?: string | null) => {
  if (!value) return "";

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean).join("\n") : "";
  } catch {
    return "";
  }
};

const parseFaq = (value?: string | null) => {
  if (!value) return "";

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return "";

    return parsed
      .map((item) => `${item?.soru || ""} | ${item?.cevap || ""}`.trim())
      .filter((item) => item !== "|")
      .join("\n");
  } catch {
    return "";
  }
};

const stringifyList = (value: string) =>
  JSON.stringify(
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
  );

const stringifyFaq = (value: string) =>
  JSON.stringify(
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [soru, ...cevapParts] = item.split("|");
        return {
          soru: (soru || "").trim(),
          cevap: cevapParts.join("|").trim(),
        };
      })
      .filter((item) => item.soru && item.cevap)
  );

const mapUsageToForm = (usage?: Partial<MenuKullanimBilgisi> | null): FormState => ({
  baslik: usage?.baslik || "",
  ozet: usage?.ozet || "",
  kullanimNotu: usage?.kullanimNotu || "",
  kullanimAdimlari: parseList(usage?.kullanimAdimlariJson),
  dikkatEdilecekler: parseList(usage?.dikkatEdileceklerJson),
  sikSorulanSorular: parseFaq(usage?.sikSorulanSorularJson),
  videoUrl: usage?.videoUrl || "",
  videoBaslik: usage?.videoBaslik || "",
  videoAciklama: usage?.videoAciklama || "",
});

const MenuUsageDialog = ({ open, onClose, menu, onSuccess }: MenuUsageDialogProps) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<Partial<MenuKullanimBilgisi>>({
    kullanimNotu: "",
    hitCount: 0,
  });
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (open && menu) {
      fetchUsage();
    } else {
      setUsage({ kullanimNotu: "", hitCount: 0 });
      setForm(emptyForm);
      setError(null);
    }
  }, [open, menu]);

  const fetchUsage = async () => {
    if (!menu) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getMenuUsageByMenuId(user.token || "", menu.id);
      if (result && result.length > 0) {
        const latest = result[0];
        setUsage(latest);
        setForm(mapUsageToForm(latest));
      } else {
        const initialUsage = { menuId: menu.id, kullanimNotu: "", hitCount: 0 };
        setUsage(initialUsage);
        setForm(emptyForm);
      }
    } catch (err) {
      console.error("Kullanim bilgisi getirilemedi:", err);
      setError("Kullanim bilgisi getirilirken bir hata olustu.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleReset = () => {
    setForm(mapUsageToForm(usage));
  };

  const handleSave = async () => {
    if (!menu) return;

    setSaving(true);
    setError(null);

    try {
      const dataToSave = {
        ...usage,
        menuId: menu.id,
        baslik: form.baslik.trim(),
        ozet: form.ozet.trim(),
        kullanimNotu: form.kullanimNotu.trim(),
        kullanimAdimlariJson: stringifyList(form.kullanimAdimlari),
        dikkatEdileceklerJson: stringifyList(form.dikkatEdilecekler),
        sikSorulanSorularJson: stringifyFaq(form.sikSorulanSorular),
        videoUrl: form.videoUrl.trim(),
        videoBaslik: form.videoBaslik.trim(),
        videoAciklama: form.videoAciklama.trim(),
        ekleyenKullaniciId: user.id || 1,
      };

      const result = await upsertMenuUsage(user.token || "", menu.id, dataToSave);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message || "Kaydetme islemi basarisiz.");
      }
    } catch (err) {
      console.error("Kullanim bilgisi kaydedilemedi:", err);
      setError("Kaydetme islemi sirasinda bir hata olustu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h5">
          {menu?.belgeAdi} - Kullanim Paneli
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" py={6} spacing={1}>
            <CircularProgress size={32} />
            <Typography variant="body2">Yukleniyor...</Typography>
          </Stack>
        ) : (
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}

            <Alert severity="info">
              Bu ekrandaki bilgiler breadcrumb uzerindeki bilgi panelinde gosterilir. Video URL bos ise video alani son kullanicida gizlenir.
            </Alert>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Panel Basligi"
                  value={form.baslik}
                  onChange={handleFieldChange("baslik")}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Kisa Ozet"
                  value={form.ozet}
                  onChange={handleFieldChange("ozet")}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  label="Detayli Kullanim Notu"
                  value={form.kullanimNotu}
                  onChange={handleFieldChange("kullanimNotu")}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={7}
                  label="Kullanim Adimlari"
                  placeholder={"Her satira bir adim girin\nOrn. Musteri secin"}
                  value={form.kullanimAdimlari}
                  onChange={handleFieldChange("kullanimAdimlari")}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={7}
                  label="Dikkat Edilecekler"
                  placeholder={"Her satira bir not girin\nOrn. Yil bilgisini kontrol edin"}
                  value={form.dikkatEdilecekler}
                  onChange={handleFieldChange("dikkatEdilecekler")}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={7}
                  label="Sik Sorulan Sorular"
                  placeholder={"Her satirda 'Soru | Cevap' formati kullanin\nOrn. Video zorunlu mu? | Hayir, URL bos olabilir."}
                  value={form.sikSorulanSorular}
                  onChange={handleFieldChange("sikSorulanSorular")}
                  disabled={saving}
                />
              </Grid>
            </Grid>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Video Alani
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                YouTube veya embed destekli video linkini ekleyebilirsiniz. Link yoksa panelde video bolumu gosterilmez.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Video URL"
                    value={form.videoUrl}
                    onChange={handleFieldChange("videoUrl")}
                    disabled={saving}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Video Basligi"
                    value={form.videoBaslik}
                    onChange={handleFieldChange("videoBaslik")}
                    disabled={saving}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Video Aciklamasi"
                    value={form.videoAciklama}
                    onChange={handleFieldChange("videoAciklama")}
                    disabled={saving}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleReset} color="inherit" disabled={loading || saving}>
          Geri Al
        </Button>
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Iptal
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading || saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuUsageDialog;
