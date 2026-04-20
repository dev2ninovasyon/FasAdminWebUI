"use client";
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { X, Save, Globe, User, Calendar, MessageSquare, Tag, Phone } from "lucide-react";
import type {
  FeedbackResponse,
  FeedbackStatus,
} from "@/api/Feedback/feedback.types";
import {
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_STATUS_LABELS,
  SENTIMENT_LABELS,
  SENTIMENT_COLOR,
  STATUS_COLOR,
} from "@/api/Feedback/feedback.types";
import { updateFeedbackNote, updateFeedbackStatus } from "@/api/Feedback/feedbackAdminApi";

const ALL_STATUSES: FeedbackStatus[] = [
  "Yeni",
  "Inceleniyor",
  "Cozuldu",
  "Kapatildi",
  "YanitaIhtiyacVar",
];

interface FeedbackAdminDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  feedback: FeedbackResponse | null;
  token: string;
  onUpdated: (updated: FeedbackResponse) => void;
}

const FeedbackAdminDetailDrawer: React.FC<FeedbackAdminDetailDrawerProps> = ({
  open,
  onClose,
  feedback,
  token,
  onUpdated,
}) => {
  const theme = useTheme();

  const [status, setStatus] = useState<FeedbackStatus>(
    feedback?.status ?? "Yeni"
  );
  const [adminNote, setAdminNote] = useState(feedback?.adminNote ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  React.useEffect(() => {
    if (feedback) {
      setStatus(feedback.status ?? "Yeni");
      setAdminNote(feedback.adminNote ?? "");
    }
  }, [feedback]);

  const handleSave = async () => {
    if (!feedback) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateFeedbackStatus(token, feedback.id, status),
        updateFeedbackNote(token, feedback.id, adminNote || null),
      ]);
      onUpdated({ ...feedback, status, adminNote: adminNote || undefined });
      setSnack({ open: true, msg: "Kaydedildi.", severity: "success" });
    } catch {
      setSnack({ open: true, msg: "Kaydetme başarısız.", severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!feedback) return null;

  const sentimentLabel = SENTIMENT_LABELS[feedback.sentiment];
  const feedbackTypeLabel = feedback.feedbackType
    ? FEEDBACK_TYPE_LABELS[feedback.feedbackType] ?? feedback.feedbackType
    : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: { xs: "100vw", sm: 480 }, display: "flex", flexDirection: "column" } }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: theme.palette.mode === "dark" ? "background.default" : "grey.50",
          }}
        >
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              Geri Bildirim Detayı #{feedback.id}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {feedback.pageTitle ?? feedback.pageKey}
            </Typography>
          </Box>
          <Chip
            label={sentimentLabel}
            color={SENTIMENT_COLOR[feedback.sentiment]}
            size="small"
          />
          <IconButton size="small" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Meta */}
          <Stack gap={1}>
            <MetaRow icon={<User size={14} />} label="Kullanıcı" value={feedback.userName ?? `#${feedback.userId}`} />
            <MetaRow icon={<Globe size={14} />} label="Sayfa" value={feedback.route ?? feedback.pageKey} />
            <MetaRow icon={<Calendar size={14} />} label="Gönderilme" value={formatDate(feedback.createdAt)} />
            {feedback.updatedAt !== feedback.createdAt && (
              <MetaRow icon={<Calendar size={14} />} label="Güncelleme" value={formatDate(feedback.updatedAt)} />
            )}
            {feedbackTypeLabel && (
              <MetaRow icon={<Tag size={14} />} label="Konu" value={feedbackTypeLabel} />
            )}
            {feedback.wantsContact && (
              <MetaRow icon={<Phone size={14} />} label="İletişim" value="İletişim kurulmasını istiyor" isHighlight />
            )}
          </Stack>

          {feedback.comment && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" gap={0.75} mb={1}>
                  <MessageSquare size={14} color={theme.palette.text.secondary} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    KULLANICI YORUMU
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: theme.palette.action.hover,
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <Typography variant="body2">{feedback.comment}</Typography>
                </Box>
              </Box>
            </>
          )}

          {(feedback.browserInfo || feedback.queryContext || feedback.appVersion) && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" gutterBottom>
                  TEKNİK BAĞLAM
                </Typography>
                {feedback.appVersion && (
                  <MetaRow label="Uygulama Versiyonu" value={feedback.appVersion} />
                )}
                {feedback.queryContext && (
                  <MetaRow label="Query Params" value={feedback.queryContext} />
                )}
                {feedback.browserInfo && (
                  <Box mt={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {feedback.browserInfo}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}

          <Divider />

          {/* Admin Controls */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="Durum"
              value={status}
              onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
              size="small"
              fullWidth
            >
              {ALL_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  <Chip
                    label={FEEDBACK_STATUS_LABELS[s]}
                    color={STATUS_COLOR[s]}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </MenuItem>
              ))}
            </TextField>

            <TextField
              multiline
              rows={3}
              label="Admin Notu"
              placeholder="İnceleme notunu buraya yazın..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ maxLength: 2000 }}
              helperText={`${adminNote.length} / 2000`}
            />

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <Save size={14} />}
              fullWidth
            >
              Kaydet
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

function MetaRow({
  icon,
  label,
  value,
  isHighlight = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  isHighlight?: boolean;
}) {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
      {icon && (
        <Box sx={{ color: theme.palette.text.disabled, mt: "2px", flexShrink: 0 }}>
          {icon}
        </Box>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        fontWeight={isHighlight ? 700 : 500}
        color={isHighlight ? "warning.main" : "text.primary"}
      >
        {value}
      </Typography>
    </Box>
  );
}

export default FeedbackAdminDetailDrawer;
