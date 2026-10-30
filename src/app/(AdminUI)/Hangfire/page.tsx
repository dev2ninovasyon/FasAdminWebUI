"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  IconRefresh,
  IconTrash,
  IconAlertTriangle,
  IconPlayerPlay,
  IconServer,
  IconActivity,
  IconExternalLink,
  IconCheck,
  IconClock,
  IconCpu,
} from "@tabler/icons-react";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import {
  getHangfireStats,
  clearQueues,
  clearFailed,
  resetStuckPackets,
  HangfireStats,
} from "@/api/Hangfire/HangfireApi";
import {
  getMonitoringSummary,
  getMonitoringServers,
  getMonitoringQueues,
  getMonitoringRecentJobs,
  MonitoringSummary,
  ServerStatus,
  QueueStats,
  RecentJob,
} from "@/api/Hangfire/HangfireMonitoringApi";
import { url as apiBaseUrl } from "@/api/apiBase";

const BCrumb = [
  { to: "/Anasayfa", title: "Admin Menü" },
  { to: "/Hangfire", title: "Hangfire Yönetimi" },
];

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 140, borderRadius: 2 }}>
      <CardContent sx={{ py: 2, textAlign: "center", "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={0.5}>
          {icon}
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} sx={{ color: color ?? "text.primary" }}>
          {value.toLocaleString("tr-TR")}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function HangfirePage() {
  usePageTitle("Hangfire Yönetimi");
  const theme = useTheme();
  const user = useSelector((state: AppState) => state.userReducer);
  const token = user.token;

  const [activeTab, setActiveTab] = useState(0);

  // Tab 0: Stats & Actions
  const [stats, setStats] = useState<HangfireStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {},
  });

  // Tab 1: Monitoring Dashboard
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [queues, setQueues] = useState<QueueStats[]>([]);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

  // Tab 2: Dashboard URL
  const hangfireDashboardUrl = `${apiBaseUrl.replace(/\/api$/i, "")}/hangfire`;
  const [iframeKey, setIframeKey] = useState(0);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getHangfireStats(token);
      setStats(data);
    } catch {
      enqueueSnackbar("Hangfire istatistikleri alınamadı", { variant: "error" });
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const fetchMonitoringData = useCallback(async () => {
    setMonitoringLoading(true);
    try {
      const [sum, serv, q, jobs] = await Promise.allSettled([
        getMonitoringSummary(token),
        getMonitoringServers(token),
        getMonitoringQueues(token),
        getMonitoringRecentJobs(15, token),
      ]);

      if (sum.status === "fulfilled") setSummary(sum.value);
      if (serv.status === "fulfilled") setServers(serv.value.servers || []);
      if (q.status === "fulfilled") setQueues(q.value.queues || []);
      if (jobs.status === "fulfilled") setRecentJobs(jobs.value.jobs || []);
    } catch {
      enqueueSnackbar("İzleme verileri alınırken hata oluştu", { variant: "warning" });
    } finally {
      setMonitoringLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 1) {
      void fetchMonitoringData();
    }
  }, [activeTab, fetchMonitoringData]);

  const handleAction = async (actionName: string, actionFn: () => Promise<any>) => {
    setActionLoading(actionName);
    try {
      const res = await actionFn();
      enqueueSnackbar(res.message || "İşlem tamamlandı", { variant: "success" });
      void fetchStats();
      if (activeTab === 1) void fetchMonitoringData();
    } catch (e: any) {
      enqueueSnackbar(e.message || "İşlem başarısız", { variant: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <PageContainer title="Hangfire Yönetimi" description="Arka plan görevleri ve kuyruk yönetim konsolu">
      <Breadcrumb title="Hangfire Yönetimi" items={BCrumb} />

      <ParentCard title="Hangfire Arka Plan İşlem Konsolu">
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Kuyruk Yönetimi ve Aksiyonlar" icon={<IconActivity size={18} />} iconPosition="start" />
            <Tab label="Sunucu ve Sağlık İzleme" icon={<IconServer size={18} />} iconPosition="start" />
            <Tab label="Canlı Hangfire Paneli" icon={<IconExternalLink size={18} />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* TAB 0: KUYRUK YÖNETİMİ */}
        {activeTab === 0 && (
          <Stack spacing={3}>
            {/* Top Stat Cards */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  Kuyruk İstatistikleri
                </Typography>
                <IconButton size="small" onClick={fetchStats} disabled={statsLoading} color="primary">
                  <IconRefresh size={20} />
                </IconButton>
              </Stack>

              {statsLoading && !stats ? (
                <Box textAlign="center" py={4}>
                  <CircularProgress size={28} />
                </Box>
              ) : stats ? (
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <StatCard
                    label="Kuyrukta"
                    value={stats.enqueued}
                    color={theme.palette.info.main}
                    icon={<IconClock size={16} color={theme.palette.info.main} />}
                  />
                  <StatCard
                    label="İşleniyor"
                    value={stats.processing}
                    color={theme.palette.warning.main}
                    icon={<IconActivity size={16} color={theme.palette.warning.main} />}
                  />
                  <StatCard
                    label="Başarısız"
                    value={stats.failed}
                    color={theme.palette.error.main}
                    icon={<IconAlertTriangle size={16} color={theme.palette.error.main} />}
                  />
                  <StatCard
                    label="Zamanlanmış"
                    value={stats.scheduled}
                    color={theme.palette.secondary.main}
                    icon={<IconClock size={16} color={theme.palette.secondary.main} />}
                  />
                  <StatCard
                    label="Tamamlanmış"
                    value={stats.succeeded}
                    color={theme.palette.success.main}
                    icon={<IconCheck size={16} color={theme.palette.success.main} />}
                  />
                </Stack>
              ) : (
                <Typography color="error">İstatistikler yüklenemedi.</Typography>
              )}
            </Paper>

            {/* Quick Action Buttons */}
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Yönetimsel İşlemler
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Arka plan işlerinde takılma veya birikme meydana geldiğinde kuyrukları güvenle yönetin.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={
                      actionLoading === "reset" ? <CircularProgress size={16} color="inherit" /> : <IconPlayerPlay size={18} />
                    }
                    disabled={!!actionLoading}
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        title: "Takılı Paketleri Sıfırla",
                        description:
                          "İşlemde kalmış veya takılmış fatura/irsaliye paketleri sıfırlanıp tekrar işleme hazır hale getirilecektir. Onaylıyor musunuz?",
                        action: () => handleAction("reset", () => resetStuckPackets(token)),
                      })
                    }
                  >
                    Takılı Paketleri Sıfırla
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={
                      actionLoading === "failed" ? <CircularProgress size={16} color="inherit" /> : <IconTrash size={18} />
                    }
                    disabled={!!actionLoading}
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        title: "Başarısız İşleri Temizle",
                        description:
                          "Hangfire kuyruğundaki tüm başarısız (failed) durumdaki işler temizlenecektir. Devam edilsin mi?",
                        action: () => handleAction("failed", () => clearFailed(token)),
                      })
                    }
                  >
                    Başarısız İşleri Temizle
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={
                      actionLoading === "queue" ? <CircularProgress size={16} color="inherit" /> : <IconTrash size={18} />
                    }
                    disabled={!!actionLoading}
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        title: "Tüm Kuyrukları Temizle",
                        description:
                          "DİKKAT: data-import, file-import ve default kuyruklarındaki bekleyen tüm işler iptal edilip silinecektir! Bu işlemi onaylıyor musunuz?",
                        action: () => handleAction("queue", () => clearQueues(token)),
                      })
                    }
                  >
                    Kuyrukları Temizle
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Managed Queues Detail & Ingestion Statuses */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Aktif Hangfire Kuyrukları
                    </Typography>
                    {stats?.queues && stats.queues.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Kuyruk Adı</TableCell>
                              <TableCell align="center">Bekleyen</TableCell>
                              <TableCell align="center">İşleme Alınan</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats.queues.map((q) => (
                              <TableRow key={q.queue}>
                                <TableCell>
                                  <Chip label={q.queue} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography fontWeight={600}>{q.enqueued}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography fontWeight={600}>{q.fetched}</Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary">Kuyruk bilgisi bulunamadı.</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Fatura ve İrsaliye Paket Durumları
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Fatura Yükleme Paketleri
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {stats?.faturaStatuses && stats.faturaStatuses.length > 0 ? (
                            stats.faturaStatuses.map((f) => (
                              <Chip
                                key={f.status}
                                label={`${f.status}: ${f.count}`}
                                size="small"
                                color={
                                  f.status === "Completed"
                                    ? "success"
                                    : f.status === "Failed"
                                    ? "error"
                                    : f.status === "Processing"
                                    ? "warning"
                                    : "default"
                                }
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Kayıt yok
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          İrsaliye Yükleme Paketleri
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {stats?.irsaliyeStatuses && stats.irsaliyeStatuses.length > 0 ? (
                            stats.irsaliyeStatuses.map((i) => (
                              <Chip
                                key={i.status}
                                label={`${i.status}: ${i.count}`}
                                size="small"
                                color={
                                  i.status === "Tamamlandi"
                                    ? "success"
                                    : i.status === "Hata"
                                    ? "error"
                                    : i.status === "Isleniyor"
                                    ? "warning"
                                    : "default"
                                }
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Kayıt yok
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Stack>
        )}

        {/* TAB 1: SUNUCU VE SAĞLIK İZLEME */}
        {activeTab === 1 && (
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                Sistem Sağlığı ve Sunucu Durumu
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IconRefresh size={18} />}
                onClick={fetchMonitoringData}
                disabled={monitoringLoading}
              >
                Yenile
              </Button>
            </Stack>

            {monitoringLoading && !summary ? (
              <Box textAlign="center" py={4}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <>
                {/* Summary Metrics */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Aktif Sunucular
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {summary?.servers.active ?? servers.length}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Toplam Worker
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {summary?.servers.workers ?? 0}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Kuyruktaki İşler
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {summary?.jobs.enqueued ?? 0}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Sağlık Durumu
                      </Typography>
                      <Box mt={0.5}>
                        <Chip
                          label={summary?.status === "Healthy" || summary?.status === "OK" ? "Sağlıklı" : summary?.status || "Aktif"}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </Card>
                  </Grid>
                </Grid>

                {/* Servers Table */}
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>
                      Bağlı Hangfire Sunucuları ({servers.length})
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Sunucu Adı</TableCell>
                            <TableCell align="center">Workers</TableCell>
                            <TableCell>Kuyruklar</TableCell>
                            <TableCell>Son Sinyal (Heartbeat)</TableCell>
                            <TableCell align="center">Durum</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {servers.length > 0 ? (
                            servers.map((s) => (
                              <TableRow key={s.name}>
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <IconServer size={18} />
                                    <Typography variant="body2" fontWeight={600}>
                                      {s.name}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="center">{s.workersCount}</TableCell>
                                <TableCell>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                    {s.queues.map((q) => (
                                      <Chip key={q} label={q} size="small" variant="outlined" />
                                    ))}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  {s.lastHeartbeat ? new Date(s.lastHeartbeat).toLocaleTimeString("tr-TR") : "-"}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={s.isHealthy ? "Aktif" : "Sorunlu"}
                                    color={s.isHealthy ? "success" : "error"}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                <Typography color="text.secondary" py={2}>
                                  Kayıtlı sunucu bulunamadı.
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Recent Jobs Table */}
                {recentJobs.length > 0 && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={700} mb={2}>
                        Son İşlenen Görevler
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>ID</TableCell>
                              <TableCell>Görev</TableCell>
                              <TableCell>Kuyruk</TableCell>
                              <TableCell>Durum</TableCell>
                              <TableCell>Tarih</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {recentJobs.map((j) => (
                              <TableRow key={j.id}>
                                <TableCell>{j.id}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    {j.jobName}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={j.queue} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={j.state}
                                    size="small"
                                    color={
                                      j.state === "Succeeded"
                                        ? "success"
                                        : j.state === "Failed"
                                        ? "error"
                                        : j.state === "Processing"
                                        ? "warning"
                                        : "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell>{j.createdAt ? new Date(j.createdAt).toLocaleTimeString("tr-TR") : "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </Stack>
        )}

        {/* TAB 2: CANLI HANGFIRE PANELİ */}
        {activeTab === 2 && (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Backend üzerinde çalışan Hangfire Dashboard arayüzü doğrudan görüntülenmektedir.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconRefresh size={16} />}
                  onClick={() => setIframeKey((prev) => prev + 1)}
                >
                  Yeniden Yükle
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<IconExternalLink size={16} />}
                  href={hangfireDashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Yeni Sekmede Aç
                </Button>
              </Stack>
            </Stack>

            <Box
              sx={{
                width: "100%",
                height: "75vh",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <iframe
                key={iframeKey}
                src={hangfireDashboardUrl}
                title="Hangfire Dashboard"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </Box>
          </Stack>
        )}
      </ParentCard>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>Vazgeç</Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              const act = confirmDialog.action;
              setConfirmDialog((prev) => ({ ...prev, open: false }));
              await act();
            }}
          >
            Onayla
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

