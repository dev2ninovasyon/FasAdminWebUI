import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
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
import {
  getMenuUsageByMenuId,
  Menu,
  MenuKullanimBilgisi,
  upsertMenuUsage,
} from "@/api/Menu/Menu";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface MenuUsageDialogProps {
  open: boolean;
  onClose: () => void;
  menu: Menu | null;
  onSuccess: () => void;
}

type ParsedFaq = {
  soru: string;
  cevap: string;
};

type ParsedUsage = {
  baslik: string;
  ozet: string;
  kullanimNotu: string;
  kullanimAdimlari: string[];
  dikkatEdilecekler: string[];
  sikSorulanSorular: ParsedFaq[];
};

type FormState = {
  icerikMetni: string;
  videoUrl: string;
};

const emptyParsedUsage: ParsedUsage = {
  baslik: "",
  ozet: "",
  kullanimNotu: "",
  kullanimAdimlari: [],
  dikkatEdilecekler: [],
  sikSorulanSorular: [],
};

const emptyForm: FormState = {
  icerikMetni: "",
  videoUrl: "",
};

const sectionTitles = [
  "Panel Başlığı",
  "Kısa Özet",
  "Detaylı Kullanım Notu",
  "Kullanım Adımları",
  "Dikkat Edilecekler",
  "Sık Sorulan Sorular",
] as const;

const normalizeText = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\.\s*\n/g, "\n\n")
    .replace(/\n\s*\.\s*$/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();

const encodeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const stringifyList = (items: string[]) => JSON.stringify(items.filter(Boolean));

const stringifyFaq = (items: ParsedFaq[]) =>
  JSON.stringify(items.filter((item) => item.soru && item.cevap));

const parseJsonList = (value?: string | null) => {
  if (!value) return [] as string[];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
};

const parseJsonFaq = (value?: string | null) => {
  if (!value) return [] as ParsedFaq[];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        soru: String(item?.soru || "").trim(),
        cevap: String(item?.cevap || "").trim(),
      }))
      .filter((item) => item.soru && item.cevap);
  } catch {
    return [];
  }
};

const extractSection = (text: string, title: (typeof sectionTitles)[number]) => {
  const escapedTitles = sectionTitles.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const titleRegex = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(?:^|\\n)${titleRegex}\\s*:?[ \\t]*\\n?([\\s\\S]*?)(?=\\n(?:${escapedTitles.join("|")})\\s*:?[ \\t]*\\n?|$)`,
    "i"
  );
  const match = text.match(pattern);
  return match?.[1]?.trim() || "";
};

const parseUsageText = (rawText: string): ParsedUsage => {
  const normalized = normalizeText(rawText);
  if (!normalized) {
    return emptyParsedUsage;
  }

  const baslik = extractSection(normalized, "Panel Başlığı").replace(/^:\s*/, "").trim();
  const ozet = extractSection(normalized, "Kısa Özet").replace(/^:\s*/, "").trim();
  const kullanimNotu = extractSection(normalized, "Detaylı Kullanım Notu").trim();
  const kullanimAdimlari = extractSection(normalized, "Kullanım Adımları")
    .split(/\n\s*\n|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const dikkatEdilecekler = extractSection(normalized, "Dikkat Edilecekler")
    .split(/\n\s*\n|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const sikSorulanSorular = extractSection(normalized, "Sık Sorulan Sorular")
    .split(/\n\s*\n|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const firstQuestionMarkIndex = item.indexOf("?");
      if (firstQuestionMarkIndex === -1) {
        return { soru: "", cevap: item };
      }

      return {
        soru: item.slice(0, firstQuestionMarkIndex + 1).trim(),
        cevap: item.slice(firstQuestionMarkIndex + 1).trim(),
      };
    })
    .filter((item) => item.soru && item.cevap);

  return {
    baslik,
    ozet,
    kullanimNotu,
    kullanimAdimlari,
    dikkatEdilecekler,
    sikSorulanSorular,
  };
};

const formatUsageText = (usage?: Partial<MenuKullanimBilgisi> | null) => {
  const baslik = usage?.baslik?.trim() || "";
  const ozet = usage?.ozet?.trim() || "";
  const kullanimNotu = usage?.kullanimNotu?.trim() || "";
  const kullanimAdimlari = parseJsonList(usage?.kullanimAdimlariJson);
  const dikkatEdilecekler = parseJsonList(usage?.dikkatEdileceklerJson);
  const sikSorulanSorular = parseJsonFaq(usage?.sikSorulanSorularJson);

  return [
    `Panel Başlığı: ${baslik}`.trimEnd(),
    "",
    `Kısa Özet ${ozet}`.trimEnd(),
    "",
    `Detaylı Kullanım Notu ${kullanimNotu}`.trimEnd(),
    "",
    "Kullanım Adımları",
    ...kullanimAdimlari,
    "",
    "Dikkat Edilecekler",
    ...dikkatEdilecekler,
    "",
    "Sık Sorulan Sorular",
    ...sikSorulanSorular.map((item) => `${item.soru} ${item.cevap}`.trim()),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const buildUsagePreviewHtml = (parsed: ParsedUsage) => {
  const paragraflar = parsed.kullanimNotu
    .split(/\n\s*\n|\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (
    !parsed.baslik &&
    !parsed.ozet &&
    paragraflar.length === 0 &&
    parsed.kullanimAdimlari.length === 0 &&
    parsed.dikkatEdilecekler.length === 0 &&
    parsed.sikSorulanSorular.length === 0
  ) {
    return "";
  }

  return `
    <div style="display:grid;gap:18px;color:#1f2937;font-family:'Segoe UI',Tahoma,sans-serif;line-height:1.7;">
      ${
        parsed.baslik || parsed.ozet
          ? `
        <section style="padding:24px;border:1px solid #dbe4f0;border-radius:18px;background:linear-gradient(135deg,#f8fbff 0%,#eef6ff 100%);box-shadow:0 10px 30px rgba(15,23,42,0.06);">
          ${
            parsed.baslik
              ? `
            <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2563eb;margin-bottom:10px;">Panel Başlığı</div>
            <h2 style="margin:0 0 10px;font-size:28px;line-height:1.25;color:#0f172a;">${encodeHtml(parsed.baslik)}</h2>
          `
              : ""
          }
          ${
            parsed.ozet
              ? `
            <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#475569;margin:16px 0 8px;">Kısa Özet</div>
            <p style="margin:0;font-size:15px;color:#334155;">${encodeHtml(parsed.ozet)}</p>
          `
              : ""
          }
        </section>
      `
          : ""
      }
      ${
        paragraflar.length > 0
          ? `
        <section style="padding:22px 24px;border:1px solid #e5e7eb;border-radius:18px;background:#ffffff;box-shadow:0 8px 24px rgba(15,23,42,0.04);">
          <h3 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Detaylı Kullanım Notu</h3>
          ${paragraflar
            .map((paragraph) => `<p style="margin:0 0 12px;color:#475569;">${encodeHtml(paragraph)}</p>`)
            .join("")}
        </section>
      `
          : ""
      }
      ${
        parsed.kullanimAdimlari.length > 0
          ? `
        <section style="padding:22px 24px;border:1px solid #dbe4f0;border-radius:18px;background:#f8fafc;">
          <h3 style="margin:0 0 14px;font-size:18px;color:#0f172a;">Kullanım Adımları</h3>
          <ol style="margin:0;padding-left:22px;">
            ${parsed.kullanimAdimlari
              .map((item) => `<li style="margin:0 0 10px;color:#334155;">${encodeHtml(item)}</li>`)
              .join("")}
          </ol>
        </section>
      `
          : ""
      }
      ${
        parsed.dikkatEdilecekler.length > 0
          ? `
        <section style="padding:22px 24px;border:1px solid #fde68a;border-radius:18px;background:#fffbeb;">
          <h3 style="margin:0 0 14px;font-size:18px;color:#92400e;">Dikkat Edilecekler</h3>
          <ul style="margin:0;padding-left:22px;">
            ${parsed.dikkatEdilecekler
              .map((item) => `<li style="margin:0 0 10px;color:#78350f;">${encodeHtml(item)}</li>`)
              .join("")}
          </ul>
        </section>
      `
          : ""
      }
      ${
        parsed.sikSorulanSorular.length > 0
          ? `
        <section style="padding:22px 24px;border:1px solid #d1fae5;border-radius:18px;background:#f0fdf4;">
          <h3 style="margin:0 0 14px;font-size:18px;color:#166534;">Sık Sorulan Sorular</h3>
          ${parsed.sikSorulanSorular
            .map(
              (item) => `
                <div style="padding:14px 16px;margin-bottom:12px;border-radius:14px;background:#ffffff;border:1px solid #bbf7d0;">
                  <div style="margin-bottom:8px;font-weight:700;color:#14532d;">${encodeHtml(item.soru)}</div>
                  <div style="color:#166534;">${encodeHtml(item.cevap)}</div>
                </div>
              `
            )
            .join("")}
        </section>
      `
          : ""
      }
    </div>
  `;
};

const MenuUsageDialog = ({
  open,
  onClose,
  menu,
  onSuccess,
}: MenuUsageDialogProps) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<Partial<MenuKullanimBilgisi>>({
    kullanimNotu: "",
    hitCount: 0,
  });
  const [form, setForm] = useState<FormState>(emptyForm);

  const parsedUsage = useMemo(
    () => parseUsageText(form.icerikMetni),
    [form.icerikMetni]
  );

  const previewHtml = useMemo(
    () => buildUsagePreviewHtml(parsedUsage),
    [parsedUsage]
  );

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
        setForm({
          icerikMetni: formatUsageText(latest),
          videoUrl: latest.videoUrl || "",
        });
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
    setForm({
      icerikMetni: formatUsageText(usage),
      videoUrl: usage.videoUrl || "",
    });
  };

  const handleSave = async () => {
    if (!menu) return;

    setSaving(true);
    setError(null);

    try {
      const dataToSave = {
        ...usage,
        menuId: menu.id,
        baslik: parsedUsage.baslik,
        ozet: parsedUsage.ozet,
        kullanimNotu: parsedUsage.kullanimNotu,
        kullanimAdimlariJson: stringifyList(parsedUsage.kullanimAdimlari),
        dikkatEdileceklerJson: stringifyList(parsedUsage.dikkatEdilecekler),
        sikSorulanSorularJson: stringifyFaq(parsedUsage.sikSorulanSorular),
        videoUrl: form.videoUrl.trim(),
        videoBaslik: "",
        videoAciklama: "",
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <Typography variant="h5">{menu?.belgeAdi} - Kullanim Paneli</Typography>
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
              Tek bir metin girin; sistem bu metni otomatik olarak panel başlığı,
              özet, kullanım notu, adımlar, dikkat alanları ve sık sorulan
              sorulara ayırarak kaydeder. Video alanı için yalnızca URL girmeniz
              yeterlidir.
            </Alert>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 7 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={22}
                  label="Kullanım Bilgisi Metni"
                  placeholder={`Panel Başlığı: Bağımsız Denetim Sözleşmesi Paneli

Kısa Özet ...

Detaylı Kullanım Notu ...

Kullanım Adımları
Sözleşme Tarihini Belirleme: ...
Hatalı Girişleri Kontrol Etme: ...

Dikkat Edilecekler
Tarih Uyumluluğu: ...

Sık Sorulan Sorular
Sözleşme tarihini girmeden belgeyi indirebilir miyim? ...`}
                  value={form.icerikMetni}
                  onChange={handleFieldChange("icerikMetni")}
                  disabled={saving}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Video URL"
                    value={form.videoUrl}
                    onChange={handleFieldChange("videoUrl")}
                    disabled={saving}
                    placeholder="https://..."
                  />

                  <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: "grey.50" }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          HTML Önizleme
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Kaydedildiğinde son kullanıcı panelinde oluşacak görünüm.
                        </Typography>
                        <Box
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3,
                            bgcolor: "#fff",
                            p: 2,
                            maxHeight: 560,
                            overflow: "auto",
                          }}
                        >
                          {previewHtml ? (
                            <Box dangerouslySetInnerHTML={{ __html: previewHtml }} />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Önizleme için içerik girin.
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Ayrıştırılan Alan Özeti
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Başlık: {parsedUsage.baslik || "-"} | Adım: {parsedUsage.kullanimAdimlari.length} |
                Dikkat: {parsedUsage.dikkatEdilecekler.length} | SSS: {parsedUsage.sikSorulanSorular.length}
              </Typography>
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
