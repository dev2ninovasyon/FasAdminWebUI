"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AlertTriangle,
  BarChart2,
  Bell,
  Check,
  Clock,
  Mail,
  MessageSquareDot,
  Star,
  TrendingUp,
} from "lucide-react";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  getAdminSummary,
  getFeedbackNotificationEmail,
  setFeedbackNotificationEmail,
} from "@/api/Feedback/feedbackAdminApi";
import type { FeedbackAdminSummary } from "@/api/Feedback/feedback.types";
import { SENTIMENT_LABELS } from "@/api/Feedback/feedback.types";
import FeedbackAdminTable from "@/app/components/GeriBildirimler/FeedbackAdminTable";
import { usePageTitle } from "@/hooks/usePageTitle";

const BCrumb = [
  { to: "/Anasayfa", title: "Admin Menü" },
  { to: "/GeriBildirimler", title: "Geri Bildirimler" },
];

const GeriBildirimlerPage = () => {
  usePageTitle("Geri Bildirimler");
  const user = useSelector((state: AppState) => state.userReducer);
  const token = user.token ?? "";

  const theme = useTheme();
  const [summary, setSummary] = useState<FeedbackAdminSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  const [notifEmail, setNotifEmail] = useState("");
  const [notifEmailInput, setNotifEmailInput] = useState("");
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  useEffect(() => {
    if (!token) return;
    setIsSummaryLoading(true);
    getAdminSummary(token)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setIsSummaryLoading(false));

    getFeedbackNotificationEmail(token).then((email) => {
      const val = email ?? "";
      setNotifEmail(val);
      setNotifEmailInput(val);
    });
  }, [token]);

  const handleSaveNotifEmail = async () => {
    setNotifSaving(true);
    setNotifSaved(false);
    try {
      await setFeedbackNotificationEmail(token, notifEmailInput.trim());
      setNotifEmail(notifEmailInput.trim());
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 3000);
    } finally {
      setNotifSaving(false);
    }
  };

  const sentimentColor = (avg: number) => {
    if (avg >= 4) return theme.palette.success.main;
    if (avg >= 3) return theme.palette.primary.main;
    return theme.palette.warning.main;
  };

  return (
    <PageContainer title="Geri Bildirimler" description="Sayfa Geri Bildirimleri Yönetimi">
      <Breadcrumb title="Geri Bildirimler" items={BCrumb} />

      {/* Summary Cards */}
      {isSummaryLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : summary ? (
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              icon={<MessageSquareDot size={22} color={theme.palette.primary.main} />}
              label="Toplam Geri Bildirim"
              value={summary.totalCount.toString()}
              bg={theme.palette.primary.light}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              icon={<Clock size={22} color={theme.palette.info.main} />}
              label="Son 7 Gün"
              value={summary.last7DaysCount.toString()}
              bg={`${theme.palette.info.main}15`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              icon={<AlertTriangle size={22} color={theme.palette.warning.main} />}
              label="İncelenmemiş"
              value={summary.unreviewedCount.toString()}
              bg={`${theme.palette.warning.main}15`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SummaryCard
              icon={<TrendingUp size={22} color={sentimentColor(summary.averageSentiment)} />}
              label="Ort. Memnuniyet"
              value={`${summary.averageSentiment.toFixed(1)} / 5`}
              bg={`${sentimentColor(summary.averageSentiment)}15`}
            />
          </Grid>

          {/* Sentiment Distribution */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <BarChart2 size={16} color={theme.palette.text.secondary} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Memnuniyet Dağılımı
                </Typography>
              </Stack>
              <Stack gap={1}>
                {([5, 4, 3, 2, 1] as const).map((v) => {
                  const count = summary.sentimentDistribution[String(v)] ?? 0;
                  const pct = summary.totalCount > 0 ? (count / summary.totalCount) * 100 : 0;
                  const colors: Record<number, string> = {
                    5: theme.palette.success.main,
                    4: theme.palette.primary.main,
                    3: theme.palette.text.disabled,
                    2: theme.palette.warning.main,
                    1: theme.palette.error.main,
                  };
                  return (
                    <Box key={v} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 90, flexShrink: 0 }}>
                        {SENTIMENT_LABELS[v]}
                      </Typography>
                      <Box sx={{ flex: 1, bgcolor: "action.hover", borderRadius: 2, height: 8, overflow: "hidden" }}>
                        <Box
                          sx={{
                            width: `${pct}%`,
                            height: "100%",
                            bgcolor: colors[v],
                            borderRadius: 2,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ width: 40, textAlign: "right", flexShrink: 0 }}>
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          </Grid>

          {/* Top Pages */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <Star size={16} color={theme.palette.text.secondary} />
                <Typography variant="subtitle2" fontWeight={600}>
                  En Çok Geri Bildirim Alan Sayfalar
                </Typography>
              </Stack>
              {summary.topPages.slice(0, 6).map((page, idx) => (
                <Box key={page.pageKey}>
                  {idx > 0 && <Divider sx={{ my: 0.75 }} />}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" fontWeight={600} noWrap>
                        {page.pageTitle ?? page.pageKey}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                        {page.pageKey}
                      </Typography>
                    </Box>
                    <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
                      <Chip label={`${page.count} yorum`} size="small" />
                      <Chip
                        label={`★ ${page.averageSentiment.toFixed(1)}`}
                        size="small"
                        color={page.averageSentiment >= 4 ? "success" : page.averageSentiment >= 3 ? "primary" : "warning"}
                      />
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {/* Bildirim E-posta Ayarı */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
        <Stack direction="row" alignItems="center" gap={1} mb={2}>
          <Bell size={16} color={theme.palette.text.secondary} />
          <Typography variant="subtitle2" fontWeight={600}>
            Bildirim E-posta Adresi
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={1.5}>
          Yeni geri bildirim geldiğinde bu adrese e-posta gönderilir.
        </Typography>
        <Stack direction="row" gap={1.5} alignItems="flex-start" flexWrap="wrap">
          <TextField
            size="small"
            type="email"
            placeholder="ornek@sirket.com"
            value={notifEmailInput}
            onChange={(e) => { setNotifEmailInput(e.target.value); setNotifSaved(false); }}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={15} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            size="small"
            disabled={notifSaving || notifEmailInput.trim() === notifEmail}
            onClick={handleSaveNotifEmail}
            startIcon={notifSaved ? <Check size={14} /> : undefined}
            color={notifSaved ? "success" : "primary"}
          >
            {notifSaving ? "Kaydediliyor..." : notifSaved ? "Kaydedildi" : "Kaydet"}
          </Button>
        </Stack>
      </Paper>

      <ParentCard title="Geri Bildirim Listesi">
        {token ? (
          <FeedbackAdminTable token={token} />
        ) : (
          <Typography color="text.secondary">Oturum bilgisi bulunamadı.</Typography>
        )}
      </ParentCard>
    </PageContainer>
  );
};

function SummaryCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Box
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default GeriBildirimlerPage;
