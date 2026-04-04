import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { IconBook, IconBulb, IconChecklist, IconHelpCircle, IconInfoCircle, IconVideo } from "@tabler/icons-react";
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
  videoId: string;
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
  videoId: "",
};

const sectionCardSx = {
  p: 2.5,
  borderRadius: 3,
};

const normalizeVideoId = (value?: string | null) => {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return "";
  }

  if (/^\d+$/.test(rawValue)) {
    return rawValue;
  }

  try {
    const parsedUrl = new URL(rawValue);
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    const idCandidate = pathParts[pathParts.length - 1] || "";
    return /^\d+$/.test(idCandidate) ? idCandidate : rawValue;
  } catch {
    return rawValue;
  }
};

const getVimeoEmbedUrl = (value?: string | null) => {
  const url = String(value || "").trim();

  if (!url) {
    return null;
  }

  if (/^\d+$/.test(url)) {
    return `https://player.vimeo.com/video/${url}?badge=0&autopause=0&player_id=0&app_id=58479`;
  }

  const iframeSrcMatch = url.match(/src=["']([^"']+)["']/i);
  const candidateUrl = iframeSrcMatch?.[1] || url;

  try {
    const parsedUrl = new URL(candidateUrl);
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    const videoId = pathParts.find((item) => /^\d+$/.test(item)) || pathParts[pathParts.length - 1];

    if (
      (parsedUrl.hostname.includes("vimeo.com") || parsedUrl.hostname.includes("player.vimeo.com")) &&
      /^\d+$/.test(videoId || "")
    ) {
      return `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479`;
    }

    return candidateUrl;
  } catch {
    return candidateUrl;
  }
};

const normalizeText = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\.\s*\n/g, "\n\n")
    .replace(/\n\s*\.\s*$/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();

const normalizeHeadingKey = (value: string) =>
  value
    .replace(/^\*\*(.+?)\*\*$/g, "$1") // Remove ** wrapping if present
    .replace(/^\d+\.\s+/, "") // Remove leading list number (1., 2., etc.)
    .replace(/^[-*]\s+/, "") // Remove leading list marker (-, *)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();


const headingAliases: Record<string, keyof ParsedUsage> = {
  "panel basligi": "baslik",
  "kisa ozet": "ozet",
  "detayli kullanim notu": "kullanimNotu",
  "kullanim adimlari": "kullanimAdimlari",
  "dikkat edilecekler": "dikkatEdilecekler",
  "sik sorulan sorular": "sikSorulanSorular",
};

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

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", color: "primary.main" }}>{icon}</Box>
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
  </Stack>
);

const parseSectionLines = (rawText: string) => {
  const sections: Record<keyof ParsedUsage, string[]> = {
    baslik: [],
    ozet: [],
    kullanimNotu: [],
    kullanimAdimlari: [],
    dikkatEdilecekler: [],
    sikSorulanSorular: [],
  };

  let currentSection: keyof ParsedUsage | null = null;

  for (const rawLine of rawText.split("\n")) {
    let line = rawLine.trim();

    if (!line) {
      if (currentSection) {
        sections[currentSection].push("");
      }
      continue;
    }

    // Remove ** wrapping anywhere in the line (before list markers)
    line = line.replace(/\*\*(.+?)\*\*/g, "$1");

    // Try to find section heading with colon (with or without list markers)
    let colonIndex = line.indexOf(":");
    let headingCandidate = colonIndex >= 0 ? line.slice(0, colonIndex) : null;
    let matchedSection = headingCandidate ? headingAliases[normalizeHeadingKey(headingCandidate)] : null;
    let restOfLine = colonIndex >= 0 ? line.slice(colonIndex + 1).trim() : "";

    // If no match with colon, try without colon (for lines like "Kısa Özet İşletme Tanıma...")
    if (!matchedSection) {
      // Check word by word from the start to find a heading match
      const words = line.split(/\s+/);
      for (let i = 1; i <= Math.min(words.length, 4); i++) {
        const potentialHeading = words.slice(0, i).join(" ");
        const normalizedHeading = normalizeHeadingKey(potentialHeading);
        if (headingAliases[normalizedHeading]) {
          matchedSection = headingAliases[normalizedHeading];
          restOfLine = words.slice(i).join(" ").trim();
          break;
        }
      }
    }

    if (matchedSection) {
      currentSection = matchedSection;
      if (restOfLine) {
        sections[currentSection].push(restOfLine);
      }
      continue;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  return sections;
};

const parseUsageText = (rawText: string): ParsedUsage => {
  const normalized = normalizeText(rawText);
  if (!normalized) {
    return emptyParsedUsage;
  }

  const sections = parseSectionLines(normalized);

  const baslik = sections.baslik.join(" ").trim();
  const ozet = sections.ozet.join(" ").trim();
  const kullanimNotu = sections.kullanimNotu.join("\n").trim();
  
  // Parse uses steps - merge sub-items (o, -, *) into parent items
  const kullanimAdimlari: string[] = [];
  
  for (const rawItem of sections.kullanimAdimlari) {
    const item = rawItem.trim();
    if (!item) continue;

    // Check if this is a sub-item (starts with o, -, *)
    const isSubItem = /^\s*[-o*]\s+/.test(item);
    
    if (isSubItem) {
      // Merge sub-item into the last parent item
      if (kullanimAdimlari.length > 0) {
        const cleanedItem = item
          .replace(/^[\d]+\.\s+/, "")
          .replace(/^[-o*]\s+/, "");
        kullanimAdimlari[kullanimAdimlari.length - 1] += "\n  • " + cleanedItem;
      }
    } else {
      // This is a parent item
      let cleanedItem = item
        .replace(/^[\d]+\.\s+/, "")
        .replace(/^[-*]\s+/, "");
      
      // If item contains colon, format it nicely
      const colonIndex = cleanedItem.indexOf(":");
      if (colonIndex > 0) {
        const title = cleanedItem.slice(0, colonIndex).trim();
        const content = cleanedItem.slice(colonIndex + 1).trim();
        cleanedItem = `${title}: ${content}`;
      }
      
      kullanimAdimlari.push(cleanedItem);
    }
  }

  const dikkatEdilecekler = sections.dikkatEdilecekler
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      // Remove leading list markers and numbers: "1. ", "- ", "* "
      item = item.replace(/^[\d]+\.\s+/, "").replace(/^[-*]\s+/, "");
      
      const colonIndex = item.indexOf(":");
      if (colonIndex > 0) {
        const title = item.slice(0, colonIndex).trim();
        const content = item.slice(colonIndex + 1).trim();
        return `${title}: ${content}`.trim();
      }
      return item;
    })
    .filter(Boolean);

  const sikSorulanSorular = sections.sikSorulanSorular
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      // Remove leading list markers and numbers: "1. ", "- ", "* "
      item = item.replace(/^[\d]+\.\s+/, "").replace(/^[-o*]\s+/, "");
      
      const firstQuestionMarkIndex = item.indexOf("?");
      if (firstQuestionMarkIndex === -1) {
        return { soru: "", cevap: item };
      }

      const soru = item.slice(0, firstQuestionMarkIndex + 1).trim();
      const cevap = item.slice(firstQuestionMarkIndex + 1).trim();
      
      return {
        soru,
        cevap,
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
    ...kullanimAdimlari.map((item) => `${item}`),
    "",
    "Dikkat Edilecekler",
    ...dikkatEdilecekler.map((item) => `${item}`),
    "",
    "Sık Sorulan Sorular",
    ...sikSorulanSorular.map((item) => `${item.soru} ${item.cevap}`.trim()),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

  const videoEmbedUrl = useMemo(() => getVimeoEmbedUrl(form.videoId), [form.videoId]);
  const previewHasContent = Boolean(
    parsedUsage.baslik ||
      parsedUsage.ozet ||
      parsedUsage.kullanimNotu ||
      parsedUsage.kullanimAdimlari.length ||
      parsedUsage.dikkatEdilecekler.length ||
      parsedUsage.sikSorulanSorular.length ||
      videoEmbedUrl
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
          videoId: normalizeVideoId(latest.videoUrl),
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
      videoId: normalizeVideoId(usage.videoUrl),
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
        videoUrl: normalizeVideoId(form.videoId),
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
      <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
        {menu?.belgeAdi} - Kullanim Paneli
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
              sorulara ayırarak kaydeder. Video alanı için yalnızca Vimeo video ID
              girmeniz yeterlidir.
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
                    label="Vimeo Video ID"
                    value={form.videoId}
                    onChange={handleFieldChange("videoId")}
                    disabled={saving}
                    placeholder="1179481872"
                    helperText="Sadece sayısal Vimeo video ID girin."
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
                            bgcolor: "background.default",
                            p: 2,
                            maxHeight: 560,
                            overflow: "auto",
                          }}
                        >
                          {previewHasContent ? (
                            <Stack spacing={2}>
                              {(parsedUsage.baslik || parsedUsage.ozet) && (
                                <Box sx={{ mb: 1 }}>
                                  <Stack direction="row" spacing={2.5} alignItems="flex-start">
                                    <Box
                                      sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 3,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "primary.main",
                                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <IconInfoCircle size={24} />
                                    </Box>
                                    <Stack spacing={0.75}>
                                      <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                        {parsedUsage.baslik || `${menu?.belgeAdi || "Panel"} nasıl kullanılır?`}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        {parsedUsage.ozet}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                  <Divider sx={{ mt: 3 }} />
                                </Box>
                              )}

                              <Box sx={{ ...sectionCardSx }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                  <Typography variant="caption" color="text.secondary">
                                    Son güncelleme: Önizleme
                                  </Typography>
                                  <Chip label="0 görüntüleme" size="small" variant="outlined" />
                                </Stack>
                              </Box>

                              {!!parsedUsage.kullanimNotu && (
                                <Box sx={sectionCardSx}>
                                  <SectionHeader icon={<IconBook size={18} />} title="Genel Açıklama" />
                                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                                    {parsedUsage.kullanimNotu}
                                  </Typography>
                                </Box>
                              )}

                              {parsedUsage.kullanimAdimlari.length > 0 && (
                                <Box sx={sectionCardSx}>
                                  <SectionHeader icon={<IconChecklist size={18} />} title="Adım Adım Nasıl Kullanılır?" />
                                  <Stack spacing={1.25}>
                                    {parsedUsage.kullanimAdimlari.map((step, index) => (
                                      <Stack key={`${index}-${step}`} direction="row" spacing={1.5} alignItems="flex-start">
                                        <Chip label={index + 1} size="small" color="primary" sx={{ minWidth: 32 }} />
                                        <Typography variant="body2" sx={{ lineHeight: 1.7, pt: 0.2 }}>
                                          {step}
                                        </Typography>
                                      </Stack>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {parsedUsage.dikkatEdilecekler.length > 0 && (
                                <Box sx={sectionCardSx}>
                                  <SectionHeader icon={<IconBulb size={18} />} title="Dikkat Edilecekler" />
                                  <Stack spacing={1}>
                                    {parsedUsage.dikkatEdilecekler.map((note, index) => (
                                      <Alert key={`${index}-${note}`} severity="info" variant="outlined">
                                        {note}
                                      </Alert>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {parsedUsage.sikSorulanSorular.length > 0 && (
                                <Box sx={sectionCardSx}>
                                  <SectionHeader icon={<IconHelpCircle size={18} />} title="Sık Sorulan Sorular" />
                                  <Stack spacing={1.5}>
                                    {parsedUsage.sikSorulanSorular.map((item, index) => (
                                      <Box key={`${index}-${item.soru || "faq"}`}>
                                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                                          {item.soru}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                          {item.cevap}
                                        </Typography>
                                        {index < parsedUsage.sikSorulanSorular.length - 1 && <Divider sx={{ mt: 1.5 }} />}
                                      </Box>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                              {videoEmbedUrl && (
                                <Box sx={sectionCardSx}>
                                  <SectionHeader icon={<IconVideo size={18} />} title="Anlatım Videosu" />
                                  <Box
                                    sx={{
                                      position: "relative",
                                      width: "100%",
                                      overflow: "hidden",
                                      borderRadius: 2,
                                      backgroundColor: "#000",
                                      pt: "56.25%",
                                    }}
                                  >
                                    <Box
                                      component="iframe"
                                      src={videoEmbedUrl}
                                      title={`${menu?.belgeAdi || "Panel"} video anlatımı`}
                                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                                      allowFullScreen
                                      referrerPolicy="strict-origin-when-cross-origin"
                                      sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        border: 0,
                                      }}
                                    />
                                  </Box>
                                </Box>
                              )}
                            </Stack>
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
