"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  IconRefresh,
  IconDatabase,
  IconDownload,
  IconSearch,
  IconAlertTriangle,
} from "@tabler/icons-react";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import PageContainer from "@/app/components/Container/PageContainer";
import ParentCard from "@/app/components/Shared/ParentCard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getAdminRecentActions, UserActionDto } from "@/api/Audit/AuditApi";
import { enqueueSnackbar } from "notistack";

const BCrumb = [
  { to: "/Anasayfa", title: "Admin Menü" },
  { to: "/AuditLoglari", title: "Sistem İşlem Logları" },
];

const formatDate = (isoDate: string) => new Date(isoDate).toLocaleString("tr-TR");

const getMethodColor = (method?: string): "default" | "primary" | "success" | "warning" | "error" | "info" => {
  switch (method?.toUpperCase()) {
    case "GET":
      return "info";
    case "POST":
      return "success";
    case "PUT":
    case "PATCH":
      return "warning";
    case "DELETE":
      return "error";
    default:
      return "default";
  }
};

const getStatusColor = (code: number, isError?: boolean): "success" | "error" | "warning" | "default" => {
  if (isError || code >= 500) return "error";
  if (code >= 400) return "warning";
  if (code >= 200 && code < 300) return "success";
  return "default";
};

export default function AuditLoglariPage() {
  usePageTitle("Sistem İşlem Logları");
  const user = useSelector((state: AppState) => state.userReducer);
  const token = user.token;

  const [auditLogs, setAuditLogs] = useState<UserActionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(150);
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<UserActionDto | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminRecentActions(
        {
          count,
          onlyErrors: onlyErrors || undefined,
        },
        token
      );
      setAuditLogs(data || []);
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Sistem işlem logları getirilemedi.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [count, onlyErrors, token]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return auditLogs;
    const q = search.toLowerCase();
    return auditLogs.filter(
      (l) =>
        l.userName?.toLowerCase().includes(q) ||
        l.denetlenenUnvani?.toLowerCase().includes(q) ||
        l.path?.toLowerCase().includes(q) ||
        l.controllerName?.toLowerCase().includes(q) ||
        l.actionName?.toLowerCase().includes(q) ||
        l.statusCode?.toString().includes(q) ||
        l.errorMessage?.toLowerCase().includes(q)
    );
  }, [auditLogs, search]);

  const exportAsJson = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer title="Sistem İşlem Logları" description="Tüm modüller için kullanıcı işlem geçmişi (Audit)">
      <Breadcrumb title="Sistem İşlem Logları" items={BCrumb} />

      <ParentCard title="Sistem İşlem Geçmişi (Audit Logs)">
        <Stack spacing={2.5}>
          {/* Header Controls */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Loglarda Ara"
                  placeholder="Kullanıcı, şirket, rota, işlem..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <IconSearch size={18} style={{ marginRight: 8, opacity: 0.6 }} />,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="count-select-label">Kayıt Adedi</InputLabel>
                  <Select
                    labelId="count-select-label"
                    value={count}
                    label="Kayıt Adedi"
                    onChange={(e) => setCount(Number(e.target.value))}
                  >
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={150}>150</MenuItem>
                    <MenuItem value={300}>300</MenuItem>
                    <MenuItem value={500}>500</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={onlyErrors}
                      onChange={(e) => setOnlyErrors(e.target.checked)}
                      color="error"
                    />
                  }
                  label="Yalnızca Hatalar"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 5, md: 3 }}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IconDownload size={18} />}
                    onClick={exportAsJson}
                    disabled={filteredLogs.length === 0}
                  >
                    JSON
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconRefresh size={18} />}
                    onClick={fetchLogs}
                    disabled={loading}
                  >
                    Yenile
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "65vh", borderRadius: 2 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="150">Tarih</TableCell>
                  <TableCell width="140">Kullanıcı</TableCell>
                  <TableCell width="140">Şirket / Yıl</TableCell>
                  <TableCell width="80">Metot</TableCell>
                  <TableCell width="80" align="center">Durum</TableCell>
                  <TableCell>İşlem / Controller</TableCell>
                  <TableCell>Path</TableCell>
                  <TableCell width="80" align="center">Detay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box py={5}>
                        <CircularProgress />
                        <Typography sx={{ mt: 1 }} color="text.secondary">
                          Sistem logları yükleniyor...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {item.userName || `#${item.userId}`}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem" }}>
                        {item.denetlenenUnvani || (item.denetlenenId ? `Şirket #${item.denetlenenId}` : "-")}
                        {item.yil ? ` (${item.yil})` : ""}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.httpMethod || "GET"}
                          size="small"
                          color={getMethodColor(item.httpMethod)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.statusCode || 200}
                          size="small"
                          color={getStatusColor(item.statusCode, item.isError)}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.85rem" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.friendlyTitle || item.actionName || item.controllerName || "-"}
                        </Typography>
                        {item.controllerName && (
                          <Typography variant="caption" color="text.secondary">
                            {item.controllerName} / {item.actionName}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                        <Tooltip title={item.path || ""}>
                          <span>{item.path}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setSelectedLog(item)}
                        >
                          İncele
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography color="text.secondary" py={3}>
                        Kriterlere uygun audit log kaydı bulunamadı.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </ParentCard>

      {/* Detail Dialog */}
      <Dialog open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Audit İşlem Kaydı #{selectedLog?.id}</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Stack spacing={1.5}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Tarih:</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatDate(selectedLog.createdAt)}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Kullanıcı:</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedLog.userName || `#${selectedLog.userId}`}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Şirket / Yıl:</Typography>
                  <Typography variant="body2">{selectedLog.denetlenenUnvani || "-"} {selectedLog.yil ? `(${selectedLog.yil})` : ""}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">HTTP / Statü:</Typography>
                  <Stack direction="row" spacing={1} mt={0.5}>
                    <Chip label={selectedLog.httpMethod} size="small" color={getMethodColor(selectedLog.httpMethod)} />
                    <Chip label={selectedLog.statusCode} size="small" color={getStatusColor(selectedLog.statusCode, selectedLog.isError)} />
                  </Stack>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" color="text.secondary">Controller / Action:</Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{selectedLog.controllerName} / {selectedLog.actionName}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Path / Query:</Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                  {selectedLog.path}{selectedLog.queryString ? `?${selectedLog.queryString}` : ""}
                </Typography>
              </Box>

              {selectedLog.clientUrl && (
                <Box>
                  <Typography variant="caption" color="text.secondary">İstemci Arayüz Rotası:</Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{selectedLog.clientUrl}</Typography>
                </Box>
              )}

              {selectedLog.errorMessage && (
                <Box>
                  <Typography variant="caption" color="error">Hata Mesajı:</Typography>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: "error.light",
                      color: "error.contrastText",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedLog.errorMessage}
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
    </PageContainer>
  );
}

