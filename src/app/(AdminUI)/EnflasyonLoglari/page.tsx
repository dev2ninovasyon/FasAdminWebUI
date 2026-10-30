"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Typography,
} from "@mui/material";
import {
  IconRefresh,
  IconTerminal2,
  IconCopy,
  IconDownload,
} from "@tabler/icons-react";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/Container/PageContainer";
import ParentCard from "@/app/components/Shared/ParentCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  ENFLASYON_BASE_URL,
  generateEnflasyonSignature,
} from "@/utils/enflasyonSignature";
import { enqueueSnackbar } from "notistack";

const BCrumb = [
  { to: "/Anasayfa", title: "Admin Menü" },
  { to: "/EnflasyonLoglari", title: "Enflasyon Logları" },
];

export default function EnflasyonLoglariPage() {
  usePageTitle("Enflasyon Logları");
  const user = useSelector((state: AppState) => state.userReducer);

  const [activeTab, setActiveTab] = useState<"Latest" | "Stdout">("Latest");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const fetchLogs = useCallback(async (type: "Latest" | "Stdout") => {
    setLoading(true);
    setError(null);
    try {
      if (!user.kullaniciAdi && !user.mail) {
        throw new Error("Kullanıcı bilgisi bulunamadı.");
      }

      const username = user.kullaniciAdi || user.mail || "FasAdmin";
      const denetciId = (user.denetciId || 0).toString();
      const kullaniciId = (user.id || 0).toString();
      const denetlenenId = (user.denetlenenId || 0).toString();
      const yil = (user.yil || 0).toString();

      const signature = await generateEnflasyonSignature(
        username,
        denetciId,
        kullaniciId,
        denetlenenId,
        yil
      );

      const enfUrl = `${ENFLASYON_BASE_URL}/Logs/${type}?username=${encodeURIComponent(
        username
      )}&denetciId=${denetciId}&kullaniciId=${kullaniciId}&denetlenenId=${denetlenenId}&yil=${yil}&signature=${encodeURIComponent(
        signature
      )}`;

      const response = await fetch(enfUrl, { credentials: "include" });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs || []);
      } else {
        setError(data.message || "Loglar alınamadı.");
      }
    } catch (err: any) {
      setError(err?.message || "Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchLogs(activeTab);
  }, [activeTab, fetchLogs]);

  const getLogColor = (log: string): "error" | "warning" | "info" | "default" => {
    if (log.includes("[Error]") || log.includes("fail:") || log.includes("Exception")) return "error";
    if (log.includes("[Warning]") || log.includes("warn:")) return "warning";
    if (log.includes("[Information]") || log.includes("info:")) return "info";
    return "default";
  };

  const downloadLogs = () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enflasyon-logs-${activeTab}-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer title="Enflasyon Logları" description="Enflasyon mikroservis log takip konsolu">
      <Breadcrumb title="Enflasyon Logları" items={BCrumb} />

      <ParentCard title="Enflasyon Uygulama Logları">
        <Stack spacing={2.5}>
          {/* Header Bar */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
            >
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab value="Latest" label="En Son Loglar (Latest)" />
                <Tab value="Stdout" label="Konsol Çıktısı (Stdout)" />
              </Tabs>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconDownload size={16} />}
                  onClick={downloadLogs}
                  disabled={logs.length === 0}
                >
                  İndir
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconRefresh size={16} />}
                  onClick={() => fetchLogs(activeTab)}
                  disabled={loading}
                >
                  Yenile
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {error && <Alert severity="warning">{error}</Alert>}

          {/* Table Container */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              maxHeight: "65vh",
              borderRadius: 2,
              bgcolor: "#111827",
              color: "#e5e7eb",
            }}
          >
            {loading && logs.length === 0 ? (
              <Box py={6} textAlign="center">
                <CircularProgress color="inherit" />
                <Typography sx={{ mt: 1 }} color="grey.400">
                  Enflasyon logları yükleniyor...
                </Typography>
              </Box>
            ) : (
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#1f2937", color: "#9ca3af", width: 80 }}>Satır</TableCell>
                    <TableCell sx={{ bgcolor: "#1f2937", color: "#9ca3af", width: 100 }}>Seviye</TableCell>
                    <TableCell sx={{ bgcolor: "#1f2937", color: "#9ca3af" }}>Log İçeriği</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log, index) => {
                      const color = getLogColor(log);
                      return (
                        <TableRow
                          key={index}
                          hover
                          sx={{
                            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedLog(log)}
                        >
                          <TableCell sx={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }}>
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={color === "default" ? "LOG" : color.toUpperCase()}
                              size="small"
                              color={color}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              color:
                                color === "error"
                                  ? "#f87171"
                                  : color === "warning"
                                  ? "#fbbf24"
                                  : color === "info"
                                  ? "#60a5fa"
                                  : "#e5e7eb",
                              fontFamily: "monospace",
                              fontSize: "0.8rem",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-all",
                            }}
                          >
                            {log}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ color: "#9ca3af", py: 4 }}>
                        Henüz gösterilecek log bulunmuyor.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Stack>
      </ParentCard>

      {/* Selected Log Dialog */}
      <Dialog open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Log Satırı Detayı</DialogTitle>
        <DialogContent dividers>
          <Paper
            sx={{
              p: 2,
              bgcolor: "#111827",
              color: "#e5e7eb",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              maxHeight: "50vh",
              overflow: "auto",
            }}
          >
            {selectedLog}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<IconCopy size={16} />}
            onClick={() => {
              if (selectedLog) {
                navigator.clipboard.writeText(selectedLog);
                enqueueSnackbar("Panoya kopyalandı", { variant: "info" });
              }
            }}
          >
            Kopyala
          </Button>
          <Button onClick={() => setSelectedLog(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

