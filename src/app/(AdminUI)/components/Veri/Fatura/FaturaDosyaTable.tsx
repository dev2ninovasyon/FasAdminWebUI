import React from "react";
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TableHead,
  IconButton,
  TableFooter,
  TablePagination,
  TextField,
  Box,
  Checkbox,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Collapse,
  Dialog,
  DialogContent,
  CircularProgress,
  Skeleton,
  Stack,
  Chip,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
// LoadingButton import removed
import {
  IconDotsVertical,
  IconEye,
  IconChevronRight,
  IconChevronDown,
  IconTrash,
  IconRefresh,
} from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  previewFaturaHtmlNewTab,
  deleteYuklemeIslemleri,
  getYuklemeDosyalari,
} from "@/api/Fatura/FaturaApi";
import { enqueueSnackbar } from "notistack";
import Link from "next/link";
import { useLoading } from "@/contexts/LoadingContext";
import { ConfirmPopUpComponent } from "@/app/(AdminUI)/components/CalismaKagitlari/ConfirmPopUp";

type FaturaDosyaRow = {
  id: string;
  dosyaAdi: string;
  durum: string;
  yuklemeTarihi: string;
};

type YuklemeRow = {
  id: string;
  adi: string;
  olusturulmaTarihi: string;
  tip?: string;
  inProgress: boolean;
  total: number;
  processed: number;
  failed: number;
  durum: string;
  faturaDosyalari?: FaturaDosyaRow[];
};

/** Sadece satırlar için skeleton */
const SkeletonRows: React.FC<{ rows?: number }> = ({ rows = 8 }) => (
  <TableBody>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRow key={i}>
        <TableCell padding="checkbox">
          <Skeleton variant="rectangular" width={18} height={18} />
        </TableCell>
        <TableCell width={48}>
          <Skeleton variant="circular" width={24} height={24} />
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="text" width="50%" height={22} />
            <Skeleton
              variant="rectangular"
              width={84}
              height={22}
              sx={{ borderRadius: 999 }}
            />
          </Stack>
        </TableCell>
        <TableCell align="center">
          <Skeleton
            variant="text"
            width={96}
            height={22}
            sx={{ mx: "auto" }}
          />
        </TableCell>
        <TableCell align="center">
          <Skeleton
            variant="text"
            width={56}
            height={22}
            sx={{ mx: "auto" }}
          />
        </TableCell>
        <TableCell align="right">
          <Skeleton
            variant="circular"
            width={24}
            height={24}
            sx={{ ml: "auto" }}
          />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

const DosyaTable: React.FC<{
  rows: YuklemeRow[];
  initialLoading?: boolean; // sadece satırlar için skeleton
  dosyaYuklendiMi: boolean; // interface uyumu (şimdilik kullanılmıyor)
  setDosyaYuklendiMi: (b: boolean) => void; // interface uyumu (şimdilik kullanılmıyor)
  tip: string;
  onRefresh?: () => void;
}> = ({ rows, initialLoading = false, onRefresh }) => {
  const user = useSelector((s: AppState) => s.userReducer);
  const { setLoading } = useLoading();

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rpp, setRpp] = React.useState(10);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewErr, setPreviewErr] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = React.useState(false);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const filtered = rows.filter((r) =>
    (r.adi || "").toLowerCase().includes(search.toLowerCase())
  );

  const toast = (
    msg: string,
    variant: "success" | "error" | "warning" | "info" = "info"
  ) =>
    enqueueSnackbar(msg, {
      variant,
      autoHideDuration: 3500,
      style: { maxWidth: 720 },
    });

  const [fetchedFiles, setFetchedFiles] = React.useState<Record<string, FaturaDosyaRow[]>>({});
  const [loadingFiles, setLoadingFiles] = React.useState<Record<string, boolean>>({});

  const toggleExpand = async (id: string) => {
    const isExpanding = !expanded[id];
    setExpanded((prev) => ({ ...prev, [id]: isExpanding }));

    if (isExpanding && !fetchedFiles[id]) {
      // Eğer prop'tan gelen veri varsa onu kullan, yoksa fetch et
      const row = rows.find(r => r.id === id);
      if (row?.faturaDosyalari && row.faturaDosyalari.length > 0) {
        setFetchedFiles(prev => ({ ...prev, [id]: row.faturaDosyalari! }));
        return;
      }

      try {
        setLoadingFiles(prev => ({ ...prev, [id]: true }));
        // API'den çek
        const data = await getYuklemeDosyalari(user, id);

        // Mapping
        const mapped: FaturaDosyaRow[] = (data || []).map((d: any) => ({
          id: d.id ?? d.Id,
          dosyaAdi: d.dosyaAdi ?? d.DosyaAdi ?? "",
          durum: d.durum ?? d.Durum ?? "",
          yuklemeTarihi: d.yuklemeTarihi
            ? new Date(d.yuklemeTarihi).toLocaleString("tr-TR")
            : (d.YuklemeTarihi ? new Date(d.YuklemeTarihi).toLocaleString("tr-TR") : "")
        }));

        setFetchedFiles(prev => ({ ...prev, [id]: mapped }));
      } catch (error) {
        console.log(error);
        toast("Dosyalar yüklenemedi", "error");
      } finally {
        setLoadingFiles(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const checkAll = (checked: boolean) =>
    setSelected(checked ? filtered.map((f) => f.id) : []);

  const openMenuFor = (e: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(e.currentTarget);
    setMenuOpen(true);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuOpen(false);
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    try {
      setIsDeleting(true);
      await deleteYuklemeIslemleri(user, selected);
      toast(`${selected.length} kayıt silindi.`, "success");
      setSelected([]);
      onRefresh?.();
      setIsConfirmPopUpOpen(false);
    } catch {
      toast("Silme sırasında hata oluştu.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleIsConfirm = () => {
    if (selected.length === 0) return;
    setIsConfirmPopUpOpen(true);
  };

  const handleCloseConfirmPopUp = () => {
    setIsConfirmPopUpOpen(false);
  };

  const handlePreviewClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewErr(null);
    setPreviewOpen(false);
  };
  React.useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  return (
    <>
      {/* Üst bar â€” HER ZAMAN gerçek kontroller */}
      <Box p={2} display="flex" gap={2} alignItems="center">
        <Typography variant="h5" sx={{ flexShrink: 0 }}>
          Yükleme İşlemleri
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flex: 1, minWidth: 0 }}
        >
          <TextField
            placeholder="Arama"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 0 }}
          />
          <Button
            component={Link}
            href="/DenetimKanitlari/FaturaInceleme"
            variant="outlined"
            size="small"
            sx={{ whiteSpace: "nowrap" }}
            onClick={() => setLoading(true)}
          >
            Faturalara Git
          </Button>
          <IconButton aria-label="Yenile" onClick={() => onRefresh?.()}>
            <IconRefresh size={18} />
          </IconButton>
        </Stack>
      </Box>

      <TableContainer sx={{ mt: 0.5, maxHeight: 425, minHeight: 425, overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={
                    selected.length > 0 &&
                    selected.length === filtered.length &&
                    filtered.length > 0
                  }
                  indeterminate={
                    selected.length > 0 && selected.length < filtered.length
                  }
                  onChange={(e) => checkAll(e.target.checked)}
                />
              </TableCell>
              <TableCell />
              <TableCell>İşlem Adı</TableCell>
              <TableCell align="center">Tarih</TableCell>
              <TableCell align="center">Durum</TableCell>
              <TableCell align="right">İşlem</TableCell>
            </TableRow>
          </TableHead>

          {/* Sadece satırlar değişiyor */}
          {initialLoading ? (
            <SkeletonRows rows={8} />
          ) : (
            <TableBody>
              {(rpp > 0
                ? filtered.slice(page * rpp, page * rpp + rpp)
                : filtered
              ).map((row) => {
                const progressText = `${row.processed}/${row.total}`;
                const showChip =
                  row.inProgress || (row.total > 0 && row.processed < row.total);
                const chipColor: "default" | "success" | "warning" | "error" =
                  showChip ? (row.failed > 0 ? "warning" : "default") : "success";

                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      hover
                      selected={selected.includes(row.id)}
                      onClick={() => {
                        setSelected((s) =>
                          s.includes(row.id)
                            ? s.filter((x) => x !== row.id)
                            : [...s, row.id]
                        );
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(row.id)} />
                      </TableCell>

                      <TableCell width={48}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(row.id);
                          }}
                        >
                          {expanded[row.id] ? (
                            <IconChevronDown size={18} />
                          ) : (
                            <IconChevronRight size={18} />
                          )}
                        </IconButton>
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                        >
                          <Typography>{row.adi}</Typography>
                          {showChip && (
                            <Tooltip
                              title={
                                row.failed > 0
                                  ? `Hatalı: ${row.failed}`
                                  : row.inProgress
                                    ? "İşleniyor"
                                    : "Tamamlandı"
                              }
                            >
                              <Chip
                                label={
                                  row.inProgress ? "İşleniyor" : "Tamamlandı"
                                }
                                size="small"
                                color={chipColor}
                                variant={
                                  row.inProgress ? "filled" : "outlined"
                                }
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell align="center">
                        {row.olusturulmaTarihi}
                      </TableCell>
                      <TableCell align="center">{progressText}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            openMenuFor(e);
                          }}
                        >
                          <IconDotsVertical width={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* Child (FaturaDosyaları) */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                        <Collapse
                          in={!!expanded[row.id]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box px={2} py={1}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{ mb: 1 }}
                            >
                              <Typography variant="subtitle1">
                                Fatura Dosyaları
                              </Typography>
                            </Stack>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Dosya Adı</TableCell>
                                  <TableCell>Durum</TableCell>
                                  <TableCell>Tarih</TableCell>
                                  <TableCell align="right">
                                    Önizleme
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {loadingFiles[row.id] ? (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center">
                                      <CircularProgress size={20} />
                                    </TableCell>
                                  </TableRow>
                                ) : (fetchedFiles[row.id] || row.faturaDosyalari || []).map((d) => (
                                  <TableRow key={d.id} hover>
                                    <TableCell>{d.dosyaAdi}</TableCell>
                                    <TableCell>{d.durum}</TableCell>
                                    <TableCell>{d.yuklemeTarihi}</TableCell>
                                    <TableCell align="right">
                                      <Button
                                        size="small"
                                        startIcon={
                                          previewLoading ? <CircularProgress size={14} /> : <IconEye size={16} />
                                        }
                                        disabled={previewLoading}
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          try {
                                            setPreviewLoading(true);
                                            setPreviewErr(null);
                                            setPreviewOpen(true);
                                            const blob = await previewFaturaHtmlNewTab(user, d.id); // <-- Blob bekliyoruz
                                            const blobUrl = URL.createObjectURL(blob);
                                            setPreviewUrl(blobUrl);
                                            setPreviewOpen(true);
                                          } catch (err) {
                                            console.log(err);
                                            setPreviewErr("Önizleme açılamadı.");
                                          } finally {
                                            setPreviewLoading(false);
                                          }
                                        }}
                                      >
                                        Göster
                                      </Button>

                                    </TableCell>
                                  </TableRow>
                                ))}
                                {!loadingFiles[row.id] && (!fetchedFiles[row.id] && (!row.faturaDosyalari ||
                                  row.faturaDosyalari.length === 0)) && (
                                    <TableRow>
                                      <TableCell colSpan={4}>
                                        <Typography color="text.secondary">
                                          Kayıt yok
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  )}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          )}

          {/* === Footer: sadece Pagination (sil butonu dışarı alındı) === */}
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} sx={{ p: 0 }}>
                <Box
                  px={1}
                  py={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  {/*<TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    rowsPerPage={rpp}
                    onPageChange={(_, p) => setPage(p)}
                    onRowsPerPageChange={(e) => {
                      setRpp(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[
                      10,
                      25,
                      50,
                      { label: "Hepsi", value: -1 },
                    ]}
                    sx={{ ml: "auto" }}
                  />*/}
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {selected.length !== 0 && (
        <Box mt={1} ml={1}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<IconTrash size={16} />}
            loading={isDeleting}
            onClick={handleIsConfirm}
            sx={{
              minWidth: 100,
            }}
          >
            {selected.length} Kayıt Sil
          </Button>
        </Box>
      )}

      {/* Menü (placeholder) */}
      <Menu anchorEl={menuAnchor} open={menuOpen} onClose={closeMenu}>
        <MenuItem disabled>
          <ListItemIcon>
            <IconDotsVertical width={18} />
          </ListItemIcon>
          İşlemler
        </MenuItem>
      </Menu>

      {/* İfaturaları pop-up açmak için dialog */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        fullWidth
        maxWidth="md"
      >
        <DialogContent sx={{ p: 0 }}>
          {previewErr ? (
            <Box p={3} sx={{ fontFamily: "system-ui" }}>
              {previewErr}
            </Box>
          ) : !!previewUrl ? (
            <iframe
              title="Fatura PDF Önizleme"
              src={previewUrl}
              width="100%"
              height="800"
              style={{ border: "none" }}
            />
          ) : (
            <Box p={3} display="flex" alignItems="center" gap={1}>
              <CircularProgress size={18} /> Yükleniyorâ€¦
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Silme onayı pop-up (E-Defter ile aynı yapı) */}
      {isConfirmPopUpOpen && (
        <ConfirmPopUpComponent
          isConfirmPopUp={isConfirmPopUpOpen}
          handleClose={handleCloseConfirmPopUp}
          handleDelete={handleDeleteSelected}
          isLoading={isDeleting}
        />
      )}
    </>
  );
};

export default DosyaTable;

