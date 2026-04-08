"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { IconEye, IconRefresh, IconDeviceFloppy } from "@tabler/icons-react";
import { toast } from "react-toastify";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  EmailTemplate,
  UpdateEmailTemplateDto,
  emailTemplateApi,
} from "@/services/api/emailTemplateApi";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type PreviewVariables = Record<string, string>;

const PASSWORD_RESET_TEMPLATE_KEY = "PASSWORD_RESET";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/EmailSablonlari",
    title: "Email Şablonları",
  },
];

const DEFAULT_PREVIEW_VARIABLES: PreviewVariables = {
  userName: "Deneme Kullanıcısı",
  resetUrl: "https://beta.fasmart.app/auth/reset-password?token=ornek-token",
  expiryMinutes: "10",
  supportUrl: "https://beta.fasmart.app/contact",
  supportEmail: "fasdestek@gmail.com",
  logoUrl: "https://beta.fasmart.app/images/logos/fas-logo-yazili-beyaz.png",
  currentYear: new Date().getFullYear().toString(),
};

export default function EmailTemplatesPage() {
  usePageTitle("Email Şablonları");
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [mjmlContent, setMjmlContent] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const templates = await emailTemplateApi.getAllTemplates();
      const selectedTemplate =
        templates.find(
          (item) =>
            item.templateKey?.toUpperCase() === PASSWORD_RESET_TEMPLATE_KEY
        ) || templates[0];

      if (!selectedTemplate?.id) {
        throw new Error("Düzenlenecek email şablonu bulunamadı.");
      }

      const fullTemplate = await emailTemplateApi.getTemplateById(
        selectedTemplate.id
      );

      if (!fullTemplate.id) {
        throw new Error("Şablon kimliği alınamadı.");
      }

      setTemplate(fullTemplate);
      setMjmlContent(fullTemplate.mjmlContent || "");
      setError(null);

      await previewTemplate(fullTemplate.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Şablon yüklenemedi.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const previewTemplate = async (templateId: number) => {
    setPreviewLoading(true);

    try {
      const html = await emailTemplateApi.previewTemplate(
        templateId,
        DEFAULT_PREVIEW_VARIABLES
      );
      setPreviewHtml(html);
    } catch (err) {
      console.error("Preview error:", err);
      toast.error("Önizleme oluşturulamadı.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template?.id) {
      return;
    }

    setSaving(true);

    try {
      const payload: UpdateEmailTemplateDto = {
        name: template.name,
        subject: template.subject,
        mjmlContent,
        isActive: template.isActive ?? true,
      };

      const updatedTemplate = await emailTemplateApi.updateTemplate(
        template.id,
        payload
      );

      setTemplate(updatedTemplate);
      setMjmlContent(updatedTemplate.mjmlContent || mjmlContent);
      toast.success("Şablon kaydedildi.");
      await previewTemplate(template.id);
    } catch (err) {
      console.error("Save error:", err);
      toast.error(
        err instanceof Error ? err.message : "Şablon kaydedilemedi."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshPreview = async () => {
    if (!template?.id) {
      return;
    }

    await previewTemplate(template.id);
  };

  return (
    <PageContainer
      title="Email Şablonları"
      description="Şifre sıfırlama email şablonu düzenleme ekranı"
    >
      <Breadcrumb
        title="Email Şablonları"
        subtitle="Şifre sıfırlama mailinin MJML içeriğini düzenleyin ve önizleyin."
        items={BCrumb}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 3 }}>
              {error ? (
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={() => void fetchTemplate()}>
                      Tekrar Dene
                    </Button>
                  }
                >
                  {error}
                </Alert>
              ) : (
                <Stack
                  direction={lgDown ? "column" : "row"}
                  spacing={2}
                  alignItems={lgDown ? "stretch" : "center"}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h5" fontWeight={700} mb={1}>
                      Şifre Sıfırlama Mail Şablonu
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tek şablon üzerinde çalışıyorsunuz. Solda MJML içeriğini
                      düzenleyin, sağda mail görünümünü kontrol edin.
                    </Typography>
                    {template && (
                      <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={`Key: ${template.templateKey}`} />
                        <Chip size="small" label={`Şablon: ${template.name}`} />
                        <Chip
                          size="small"
                          color={template.isActive ? "success" : "default"}
                          label={template.isActive ? "Aktif" : "Pasif"}
                        />
                      </Stack>
                    )}
                  </Box>

                  <Stack
                    direction={lgDown ? "column" : "row"}
                    spacing={1.5}
                    sx={{ minWidth: lgDown ? "100%" : "auto" }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<IconRefresh size={18} />}
                      onClick={() => void handleRefreshPreview()}
                      disabled={!template?.id || previewLoading || loading}
                      sx={{ minWidth: 190, height: 40 }}
                    >
                      {previewLoading ? "Önizleniyor..." : "Önizlemeyi Yenile"}
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<IconDeviceFloppy size={18} />}
                      onClick={() => void handleSave()}
                      disabled={!template?.id || saving || loading}
                      sx={{ minWidth: 140, height: 40 }}
                    >
                      {saving ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, xl: 6 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardContent sx={{ p: 0 }}>
              <Box
                px={3}
                py={2}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid"
                borderColor="divider"
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    MJML Girişi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mail tasarımını burada güncelleyin.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Editor
                    height="760px"
                    defaultLanguage="xml"
                    value={mjmlContent}
                    onChange={(value) => setMjmlContent(value || "")}
                    theme="vs-light"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbersMinChars: 3,
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      automaticLayout: true,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, xl: 6 }}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
            <CardContent sx={{ p: 0 }}>
              <Box
                px={3}
                py={2}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid"
                borderColor="divider"
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Mail Önizlemesi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kaydedilen MJML içeriğinin mail görünümü.
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<IconEye size={14} />}
                  label="Önizleme"
                />
              </Box>

              <Box sx={{ p: 2 }}>
                {previewHtml ? (
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "background.paper",
                    }}
                  >
                    <iframe
                      title="email-preview"
                      srcDoc={previewHtml}
                      style={{
                        width: "100%",
                        height: "760px",
                        border: "0",
                        display: "block",
                        background: "#fff",
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 760,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 3,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    <Typography variant="body2">
                      Önizleme henüz oluşturulamadı. Kaydedip tekrar deneyin.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
