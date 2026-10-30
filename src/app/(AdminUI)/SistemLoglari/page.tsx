"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  IconFileText,
  IconDownload,
  IconTrash,
  IconCopy,
  IconSearch,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/Container/PageContainer";
import ParentCard from "@/app/components/Shared/ParentCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  clearClientLogs,
  ClientLogEntry,
  ClientLogLevel,
  ClientLogSource,
  getClientLogs,
  subscribeClientLogs,
} from "@/utils/clientLogStore";
import { fetchServerLogText } from "@/api/Audit/AuditApi";
import { enqueueSnackbar } from "notistack";

const BCrumb = [
  { to: "/Anasayfa", title: "Admin Menü" },
  { to: "/SistemLoglari", title: "Sistem Logları" },
];

const levelColorMap: Record<ClientLogLevel, "error" | "warning" | "info" | "default"> = {
  error: "error",
  warn: "warning",
  info: "info",
  debug: "default",
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleString("tr-TR");
};

const downloadAsJson = (logs: ClientLogEntry[]) => {
  const blob = new Blob([JSON.stringify(logs, null, 2)], {
    type: "application/json",
  });
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  a.href = objectUrl;
  a.download = `fas-admin-client-logs-${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(objectUrl);
};

const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
};

export default function SistemLoglariPage() {
  usePageTitle("Sistem Logları");
  const user = useSelector((state: AppState) => state.userReducer);
  const token = user.token;

  const [logs, setLogs] = useState<ClientLogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<"all" | ClientLogLevel>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | ClientLogSource>("all");
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<ClientLogEntry | null>(null);

  // Server Log State
  const [serverLogOpen, setServerLogOpen] = useState(false);
  const [serverLogContent, setServerLogContent] = useState("");
  const [serverLogFilter, setServerLogFilter] = useState("");
  const [loadingServerLog, setLoadingServerLog] = useState(false);

  useEffect(() => {
    setLogs(getClientLogs());
    return subscribeClientLogs(() => {
      setLogs(getClientLogs());
    });
  }, []);

  const handleFetchServerLog = async () => {
    setLoadingServerLog(true);
    setServerLogOpen(true);
    try {
      const content = await fetchServerLogText(token);
      setServerLogContent(content);
      enqueueSnackbar("Sunucu logları başarıyla getirildi.", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Sunucu logları getirilemedi.", { variant: "error" });
      setServerLogOpen(false);
    } finally {
      setLoadingServerLog(false);
    }
  };

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) return false;
      if (sourceFilter !== "all" && log.source !== sourceFilter) return false;

      if (!query) return true;

      const haystack = [
        log.message,
        log.route,
        log.requestPath,
        log.statusCode?.toString(),
        log.detail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [logs, levelFilter, sourceFilter, search]);

  const errorCount = logs.filter((item) => item.level === "error").length;
  const warnCount = logs.filter((item) => item.level === "warn").length;

  const filteredServerLogLines = useMemo(() => {
    if (!serverLogFilter.trim()) return serverLogContent;
    const filterLower = serverLogFilter.toLowerCase();
    return serverLogContent
      .split("\n")
      .filter((line) => line.toLowerCase().includes(filterLower))
      .join("\n");
  }, [serverLogContent, serverLogFilter]);

  return (
    <PageContainer title="Sistem Logları" description="İstemci ve sunucu log kayıt ekranı">
      <Breadcrumb title="Sistem Logları" items={BCrumb} />

      <ParentCard title="Sistem ve İstemci Log İzleme">
        <Stack spacing={2.5}>
          {/* Header Controls & Stats */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip label={`Toplam İstemci Logu: ${logs.length}`} variant="outlined" />
                <Chip label={`Hata: ${errorCount}`} color="error" variant="outlined" />
                <Chip label={`Uyarı: ${warnCount}`} color="warning" variant="outlined" />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={
                    loadingServerLog ? <CircularProgress size={16} color="inherit" /> : <IconFileText size={18} />
                  }
                  onClick={handleFetchServerLog}
                  disabled={loadingServerLog}
                >
                  Sunucu Serilog Loglarını Getir
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<IconDownload size={18} />}
                  onClick={() => downloadAsJson(filteredLogs)}
                  disabled={filteredLogs.length === 0}
                >
                  JSON Dışa Aktar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<IconTrash size={18} />}
                  onClick={() => {
                    clearClientLogs();
                    enqueueSnackbar("İstemci logları temizlendi.", { variant: "info" });
                  }}
                  disabled={logs.length === 0}
                >
                  Temizle
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Filters Bar */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="level-filter-label">Seviye</InputLabel>
                  <Select
                    labelId="level-filter-label"
                    value={levelFilter}
                    label="Seviye"
                    onChange={(e) => setLevelFilter(e.target.value as any)}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="warn">Warn</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="debug">Debug</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="source-filter-label">Kaynak</InputLabel>
                  <Select
                    labelId="source-filter-label"
                    value={sourceFilter}
                    label="Kaynak"
                    onChange={(e) => setSourceFilter(e.target.value as any)}
                  >
                    <MenuItem value="all">Tümü</MenuItem>
                    <MenuItem value="ui">UI</MenuItem>
                    <MenuItem value="api">API</MenuItem>
                    <MenuItem value="window">Window</MenuItem>
                    <MenuItem value="network">Network</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Loglarda Ara"
                  placeholder="Mesaj, rota, yol veya hata ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <IconSearch size={18} style={{ marginRight: 8, opacity: 0.6 }} />,
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Logs Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "60vh", borderRadius: 2 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="160">Tarih</TableCell>
                  <TableCell width="90">Seviye</TableCell>
                  <TableCell width="90">Kaynak</TableCell>
                  <TableCell width="180">Rota / Yol</TableCell>
                  <TableCell>Mesaj</TableCell>
                  <TableCell width="90" align="center">Detay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.level.toUpperCase()}
                          size="small"
                          color={levelColorMap[log.level]}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={log.source.toUpperCase()} size="small" variant="filled" />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {log.route || log.requestPath || "-"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                          {log.message}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setSelectedLog(log)}
                        >
                          İncele
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" py={3}>
                        Filtrelere uygun istemci log kaydı bulunamadı.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </ParentCard>

      {/* Log Detail Dialog */}
      <Dialog
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Log Detayı</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Tarih:</Typography>
                <Typography variant="body2" fontWeight={600}>{formatDate(selectedLog.timestamp)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Seviye / Kaynak:</Typography>
                <Stack direction="row" spacing={1} mt={0.5}>
                  <Chip label={selectedLog.level.toUpperCase()} size="small" color={levelColorMap[selectedLog.level]} />
                  <Chip label={selectedLog.source.toUpperCase()} size="small" />
                </Stack>
              </Box>
              {selectedLog.route && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Rota:</Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{selectedLog.route}</Typography>
                </Box>
              )}
              {selectedLog.requestPath && (
                <Box>
                  <Typography variant="caption" color="text.secondary">İstek Yolu:</Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{selectedLog.requestPath}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Mesaj:</Typography>
                <Typography variant="body1" fontWeight={600} sx={{ wordBreak: "break-word" }}>
                  {selectedLog.message}
                </Typography>
              </Box>
              {selectedLog.detail && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Detay / Stack Trace:</Typography>
                  <Paper
                    sx={{
                      p: 1.5,
                      mt: 0.5,
                      bgcolor: "grey.900",
                      color: "grey.100",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      maxHeight: "350px",
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedLog.detail}
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Server Log Viewer Dialog */}
      <Dialog
        open={serverLogOpen}
        onClose={() => setServerLogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Sunucu Serilog Kayıtları</Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(serverLogContent);
                  enqueueSnackbar("Panoya kopyalandı", { variant: "info" });
                }}
              >
                <IconCopy size={18} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() =>
                  downloadTextFile(
                    serverLogContent,
                    `fas-server-log-${new Date().toISOString().slice(0, 10)}.log`
                  )
                }
              >
                <IconDownload size={18} />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Sunucu logunda ara (örn: ERR, Exception, Fatura)..."
              value={serverLogFilter}
              onChange={(e) => setServerLogFilter(e.target.value)}
            />
          </Box>
          <Paper
            sx={{
              p: 2,
              bgcolor: "#121824",
              color: "#a4b1cd",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              maxHeight: "60vh",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              borderRadius: 1,
            }}
          >
            {filteredServerLogLines || "Log satırı bulunamadı."}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServerLogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

