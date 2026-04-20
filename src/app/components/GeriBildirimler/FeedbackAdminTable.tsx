"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { Eye, Phone, Search, Trash2 } from "lucide-react";
import type {
  FeedbackAdminFilter,
  FeedbackResponse,
  FeedbackSentiment,
  FeedbackStatus,
  FeedbackType,
} from "@/api/Feedback/feedback.types";
import {
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_LABELS,
  SENTIMENT_COLOR,
  SENTIMENT_LABELS,
  STATUS_COLOR,
} from "@/api/Feedback/feedback.types";
import { deleteFeedback, getAdminList } from "@/api/Feedback/feedbackAdminApi";
import FeedbackAdminDetailDrawer from "./FeedbackAdminDetailDrawer";

const ALL_STATUSES: FeedbackStatus[] = [
  "Yeni",
  "Inceleniyor",
  "Cozuldu",
  "Kapatildi",
  "YanitaIhtiyacVar",
];

const ALL_TYPES: FeedbackType[] = [
  "KullanimKolayligi",
  "GorselTasarim",
  "HizPerformans",
  "VeriDogrulugu",
  "EksikOzellik",
  "HataBug",
  "Oneri",
  "Diger",
];

interface FeedbackAdminTableProps {
  token: string;
}

const FeedbackAdminTable: React.FC<FeedbackAdminTableProps> = ({ token }) => {
  const theme = useTheme();

  const [rows, setRows] = useState<FeedbackResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [filter, setFilter] = useState<FeedbackAdminFilter>({
    page: 1,
    pageSize: 25,
  });

  const [pageKeySearch, setPageKeySearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | "">("");
  const [selectedType, setSelectedType] = useState<FeedbackType | "">("");
  const [selectedSentiment, setSelectedSentiment] = useState<FeedbackSentiment | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [detailDrawer, setDetailDrawer] = useState<{
    open: boolean;
    feedback: FeedbackResponse | null;
  }>({ open: false, feedback: null });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAdminList(token, filter);
      setRows(result.items);
      setTotalCount(result.totalCount);
    } catch {
      // handled by apiBase
    } finally {
      setIsLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const applyFilters = () => {
    setFilter((prev) => ({
      ...prev,
      page: 1,
      pageKey: pageKeySearch || undefined,
      status: selectedStatus || undefined,
      feedbackType: selectedType || undefined,
      sentiment: selectedSentiment || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }));
  };

  const clearFilters = () => {
    setPageKeySearch("");
    setSelectedStatus("");
    setSelectedType("");
    setSelectedSentiment("");
    setDateFrom("");
    setDateTo("");
    setFilter({ page: 1, pageSize: 25 });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    await deleteFeedback(token, id);
    void fetchData();
  };

  const handleRowUpdated = (updated: FeedbackResponse) => {
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setDetailDrawer((prev) => ({ ...prev, feedback: updated }));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Sayfa / Route"
              value={pageKeySearch}
              onChange={(e) => setPageKeySearch(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={14} />
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <TextField
              select
              label="Durum"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as FeedbackStatus | "")}
              size="small"
              fullWidth
            >
              <MenuItem value="">
                <em>Tümü</em>
              </MenuItem>
              {ALL_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {FEEDBACK_STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <TextField
              select
              label="Tip"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as FeedbackType | "")}
              size="small"
              fullWidth
            >
              <MenuItem value="">
                <em>Tümü</em>
              </MenuItem>
              {ALL_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {FEEDBACK_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 1 }}>
            <TextField
              select
              label="Memnuniyet"
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(Number(e.target.value) as FeedbackSentiment | "")}
              size="small"
              fullWidth
            >
              <MenuItem value="">
                <em>Tüm</em>
              </MenuItem>
              {([5, 4, 3, 2, 1] as FeedbackSentiment[]).map((v) => (
                <MenuItem key={v} value={v}>
                  {SENTIMENT_LABELS[v]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <TextField
              type="date"
              label="Başlangıç"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <TextField
              type="date"
              label="Bitiş"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <Stack direction="row" gap={1}>
              <Box
                component="button"
                onClick={applyFilters}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: "primary.main",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Filtrele
              </Box>
              <Box
                component="button"
                onClick={clearFilters}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  color: "text.primary",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                Temizle
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {!isLoading && (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Tarih</TableCell>
                <TableCell>Kullanıcı</TableCell>
                <TableCell>Sayfa</TableCell>
                <TableCell>Memnuniyet</TableCell>
                <TableCell>Tip</TableCell>
                <TableCell>Yorum</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İletişim</TableCell>
                <TableCell align="center">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      Kayıt bulunamadı
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      bgcolor:
                        row.status === "Yeni"
                          ? alpha(theme.palette.info.main, 0.04)
                          : undefined,
                    }}
                  >
                    <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.75rem" }}>
                      {formatDate(row.createdAt)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>
                      {row.userName ?? `#${row.userId}`}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 180 }}>
                      <Tooltip title={row.route ?? row.pageKey}>
                        <Typography variant="caption" noWrap sx={{ display: "block", maxWidth: 180 }}>
                          {row.pageTitle ?? row.pageKey}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={SENTIMENT_LABELS[row.sentiment]}
                        color={SENTIMENT_COLOR[row.sentiment]}
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>
                      {row.feedbackType
                        ? FEEDBACK_TYPE_LABELS[row.feedbackType] ?? row.feedbackType
                        : "—"}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Tooltip title={row.comment ?? ""}>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            color: row.comment ? "text.primary" : "text.disabled",
                          }}
                        >
                          {row.comment ?? "—"}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={FEEDBACK_STATUS_LABELS[row.status]}
                        color={STATUS_COLOR[row.status]}
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {row.wantsContact && (
                        <Tooltip title="İletişim kurulmasını istiyor">
                          <Phone size={14} color={theme.palette.warning.main} />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" gap={0.5} justifyContent="center">
                        <Tooltip title="Detay / Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => setDetailDrawer({ open: true, feedback: row })}
                          >
                            <Eye size={14} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row.id)}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={totalCount}
          page={(filter.page ?? 1) - 1}
          rowsPerPage={filter.pageSize ?? 25}
          onPageChange={(_, newPage) =>
            setFilter((prev) => ({ ...prev, page: newPage + 1 }))
          }
          onRowsPerPageChange={(e) =>
            setFilter((prev) => ({
              ...prev,
              pageSize: parseInt(e.target.value),
              page: 1,
            }))
          }
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Sayfa başına:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </TableContainer>

      <FeedbackAdminDetailDrawer
        open={detailDrawer.open}
        onClose={() => setDetailDrawer({ open: false, feedback: null })}
        feedback={detailDrawer.feedback}
        token={token}
        onUpdated={handleRowUpdated}
      />
    </Box>
  );
};

export default FeedbackAdminTable;
