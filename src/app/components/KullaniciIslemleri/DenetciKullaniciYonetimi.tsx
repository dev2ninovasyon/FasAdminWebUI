"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
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
    IconArrowLeft,
    IconEdit,
    IconLock,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconShieldCheck,
    IconTrash,
    IconUserCheck,
    IconUserOff,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import BlankCard from "@/app/components/Shared/BlankCard";
import { getDenetciById, getDenetciler } from "@/api/DenetciIslemleri/DenetciIslemleri";
import {
    AdminKullaniciDto,
    DEFAULT_UNVAN_SECENEKLERI,
    deleteAdminKullanici,
    getAdminKullanicilarByDenetciId,
    getUnvanlar,
    toggleAdminKullaniciAktifPasif,
} from "@/api/KullaniciIslemleri/KullaniciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import KullaniciDuzenleModal from "./KullaniciDuzenleModal";
import KullaniciEkleModal from "./KullaniciEkleModal";
import KullaniciSifreDegistirModal from "./KullaniciSifreDegistirModal";

interface Props {
    initialDenetciId?: number | null;
    hideFirmSelector?: boolean;
    openAddOnMount?: boolean;
    showBackToFirms?: boolean;
}

const getInitials = (name?: string) => {
    const cleaned = (name || "").trim();
    if (!cleaned) return "K";
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
};

const DenetciKullaniciYonetimi = ({
    initialDenetciId = null,
    hideFirmSelector = false,
    openAddOnMount = false,
    showBackToFirms = false,
}: Props) => {
    const router = useRouter();
    const user = useSelector((state: AppState) => state.userReducer);
    const token = user?.token || "";

    const [denetciFirmalar, setDenetciFirmalar] = useState<any[]>([]);
    const [loadingFirmalar, setLoadingFirmalar] = useState(false);
    const [selectedDenetciId, setSelectedDenetciId] = useState<number | null>(
        initialDenetciId && initialDenetciId > 0 ? initialDenetciId : null
    );
    const [selectedDenetciDetail, setSelectedDenetciDetail] = useState<any>(null);
    const [unvanSecenekleri, setUnvanSecenekleri] = useState<string[]>(DEFAULT_UNVAN_SECENEKLERI);

    const [rows, setRows] = useState<AdminKullaniciDto[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [searchText, setSearchText] = useState("");
    const [durumFilter, setDurumFilter] = useState<"all" | "active" | "passive">("all");
    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "standard">("all");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [defaultAddAdmin, setDefaultAddAdmin] = useState(false);
    const [editTarget, setEditTarget] = useState<AdminKullaniciDto | null>(null);
    const [passwordTarget, setPasswordTarget] = useState<AdminKullaniciDto | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminKullaniciDto | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

    const fetchSeqRef = useRef(0);
    const addTriggeredOnMountRef = useRef(false);

    useEffect(() => {
        if (initialDenetciId && initialDenetciId > 0) {
            setSelectedDenetciId(initialDenetciId);
        }
    }, [initialDenetciId]);

    useEffect(() => {
        if (openAddOnMount && selectedDenetciId && !addTriggeredOnMountRef.current) {
            addTriggeredOnMountRef.current = true;
            setDefaultAddAdmin(false);
            setIsAddModalOpen(true);
        }
    }, [openAddOnMount, selectedDenetciId]);

    useEffect(() => {
        let cancelled = false;

        const loadReferenceData = async () => {
            if (!token) return;
            setLoadingFirmalar(true);
            try {
                const [firms, unvanlar] = await Promise.all([
                    hideFirmSelector ? Promise.resolve([]) : getDenetciler(token),
                    getUnvanlar(token),
                ]);
                if (cancelled) return;
                if (!hideFirmSelector && Array.isArray(firms)) {
                    setDenetciFirmalar(firms);
                }
                setUnvanSecenekleri(unvanlar);
            } finally {
                if (!cancelled) {
                    setLoadingFirmalar(false);
                }
            }
        };

        loadReferenceData();
        return () => {
            cancelled = true;
        };
    }, [token, hideFirmSelector]);

    useEffect(() => {
        let cancelled = false;

        const loadFirmDetail = async () => {
            if (!selectedDenetciId || !token) {
                setSelectedDenetciDetail(null);
                return;
            }
            const fromList = denetciFirmalar.find(
                (f) => Number(f.id ?? f.Id) === Number(selectedDenetciId)
            );
            if (fromList) {
                setSelectedDenetciDetail(fromList);
            }
            const detail = await getDenetciById(token, selectedDenetciId);
            if (!cancelled && detail && (detail.id || detail.Id)) {
                setSelectedDenetciDetail(detail);
            }
        };

        loadFirmDetail();
        return () => {
            cancelled = true;
        };
    }, [selectedDenetciId, token, denetciFirmalar]);

    const fetchUsers = useCallback(async () => {
        const requestSeq = ++fetchSeqRef.current;
        if (!selectedDenetciId || !token) {
            setRows([]);
            setLoadError(null);
            setLoadingUsers(false);
            return;
        }

        setLoadingUsers(true);
        setLoadError(null);
        try {
            const result = await getAdminKullanicilarByDenetciId(token, selectedDenetciId);
            if (requestSeq !== fetchSeqRef.current) return;

            if (result.ok) {
                setRows(result.data || []);
            } else {
                setRows([]);
                setLoadError(result.message || "Kullanıcı listesi alınamadı.");
            }
        } finally {
            if (requestSeq === fetchSeqRef.current) {
                setLoadingUsers(false);
            }
        }
    }, [selectedDenetciId, token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const selectedFirmOption = useMemo(() => {
        if (!selectedDenetciId) return null;
        return (
            denetciFirmalar.find((f) => Number(f.id ?? f.Id) === Number(selectedDenetciId)) ||
            selectedDenetciDetail ||
            null
        );
    }, [denetciFirmalar, selectedDenetciId, selectedDenetciDetail]);

    const firmDisplayName =
        selectedFirmOption?.firmaAdi ||
        selectedFirmOption?.FirmaAdi ||
        (selectedDenetciId ? `Denetçi Firma #${selectedDenetciId}` : "");

    const stats = useMemo(() => {
        const total = rows.length;
        const activeCount = rows.filter((r) => r.aktifPasif).length;
        const passiveCount = total - activeCount;
        const adminCount = rows.filter((r) => r.isDenetciAdmin).length;
        const activeAdminCount = rows.filter((r) => r.isDenetciAdmin && r.aktifPasif).length;
        return { total, activeCount, passiveCount, adminCount, activeAdminCount };
    }, [rows]);

    const filteredRows = useMemo(() => {
        const needle = searchText.trim().toLowerCase();
        return rows.filter((row) => {
            if (durumFilter === "active" && !row.aktifPasif) return false;
            if (durumFilter === "passive" && row.aktifPasif) return false;
            if (roleFilter === "admin" && !row.isDenetciAdmin) return false;
            if (roleFilter === "standard" && row.isDenetciAdmin) return false;

            if (!needle) return true;
            return (
                (row.personelAdi || "").toLowerCase().includes(needle) ||
                (row.email || "").toLowerCase().includes(needle) ||
                (row.unvani || "").toLowerCase().includes(needle) ||
                (row.bdSicilNo || "").toLowerCase().includes(needle) ||
                (row.tel || "").toLowerCase().includes(needle) ||
                (row.gsm || "").toLowerCase().includes(needle)
            );
        });
    }, [rows, searchText, durumFilter, roleFilter]);

    const handleOpenAddModal = (asAdmin = false) => {
        setDefaultAddAdmin(asAdmin);
        setIsAddModalOpen(true);
    };

    const handleToggleStatus = async (row: AdminKullaniciDto) => {
        if (!token) return;
        const nextStatus = !row.aktifPasif;
        setTogglingUserId(row.id);
        try {
            const result = await toggleAdminKullaniciAktifPasif(token, row.id, nextStatus);
            if (result.ok) {
                enqueueSnackbar(
                    nextStatus ? "Kullanıcı aktif hale getirildi." : "Kullanıcı pasife alındı.",
                    { variant: "success" }
                );
                await fetchUsers();
            } else {
                enqueueSnackbar(result.message || "Kullanıcı durumu güncellenemedi.", {
                    variant: "error",
                });
            }
        } finally {
            setTogglingUserId(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget || !token) return;
        setDeleteError(null);
        setIsDeleting(true);
        try {
            const result = await deleteAdminKullanici(token, deleteTarget.id);
            if (result.ok) {
                enqueueSnackbar("Kullanıcı silindi.", { variant: "success" });
                setDeleteTarget(null);
                await fetchUsers();
            } else {
                const msg = result.message || "Kullanıcı silinemedi.";
                setDeleteError(msg);
                enqueueSnackbar(msg, { variant: "error" });
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeactivateFromDeleteDialog = async () => {
        if (!deleteTarget) return;
        await handleToggleStatus(deleteTarget);
        setDeleteTarget(null);
        setDeleteError(null);
    };

    return (
        <Box>
            {(!hideFirmSelector || showBackToFirms) && (
                <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    {!hideFirmSelector && (
                        <Grid size={{ xs: 12, md: showBackToFirms ? 8 : 7 }}>
                            <Autocomplete
                                options={denetciFirmalar}
                                loading={loadingFirmalar}
                                value={
                                    denetciFirmalar.find(
                                        (f) => Number(f.id ?? f.Id) === Number(selectedDenetciId)
                                    ) || null
                                }
                                onChange={(_, newValue) => {
                                    const nextId = newValue ? Number(newValue.id ?? newValue.Id) : null;
                                    setSelectedDenetciId(nextId && nextId > 0 ? nextId : null);
                                }}
                                getOptionLabel={(option) => {
                                    const adi = option?.firmaAdi || option?.FirmaAdi || "";
                                    const vkn = option?.vergiNo || option?.VergiNo || "";
                                    return vkn ? `${adi} (VKN: ${vkn})` : adi;
                                }}
                                isOptionEqualToValue={(option, value) =>
                                    Number(option?.id ?? option?.Id) === Number(value?.id ?? value?.Id)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        label="Denetçi Firma Seçin"
                                        placeholder="Firma adı veya vergi no ile ara..."
                                    />
                                )}
                            />
                        </Grid>
                    )}

                    {showBackToFirms && (
                        <Grid
                            size={{ xs: 12, md: hideFirmSelector ? 12 : 4 }}
                            sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}
                        >
                            <Button
                                variant="outlined"
                                color="inherit"
                                startIcon={<IconArrowLeft size={18} />}
                                onClick={() => router.push("/DenetciFirmaIslemleri")}
                            >
                                Denetçi Firmalara Dön
                            </Button>
                        </Grid>
                    )}
                </Grid>
            )}

            {selectedDenetciId && selectedFirmOption && (
                <BlankCard sx={{ mb: 3 }}>
                    <Box
                        sx={{
                            p: 2.5,
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", md: "center" },
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                <Typography variant="h5" fontWeight={700}>
                                    {firmDisplayName}
                                </Typography>
                                {selectedFirmOption.aktifmi !== undefined && (
                                    <Chip
                                        size="small"
                                        label={selectedFirmOption.aktifmi ? "Firma Aktif" : "Firma Pasif"}
                                        color={selectedFirmOption.aktifmi ? "success" : "default"}
                                    />
                                )}
                            </Stack>
                            {(selectedFirmOption.firmaUnvani || selectedFirmOption.FirmaUnvani) && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {selectedFirmOption.firmaUnvani || selectedFirmOption.FirmaUnvani}
                                </Typography>
                            )}
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                                {(selectedFirmOption.vergiNo || selectedFirmOption.VergiNo) && (
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={`VKN: ${selectedFirmOption.vergiNo || selectedFirmOption.VergiNo}`}
                                    />
                                )}
                                {(selectedFirmOption.il || selectedFirmOption.Il) && (
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={selectedFirmOption.il || selectedFirmOption.Il}
                                    />
                                )}
                                {(selectedFirmOption.email || selectedFirmOption.Email) && (
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label={selectedFirmOption.email || selectedFirmOption.Email}
                                    />
                                )}
                            </Stack>
                        </Box>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip label={`Toplam: ${stats.total}`} variant="outlined" />
                            <Chip label={`Aktif: ${stats.activeCount}`} color="success" variant="outlined" />
                            <Chip label={`Pasif: ${stats.passiveCount}`} color="default" variant="outlined" />
                            <Chip
                                icon={<IconShieldCheck size={16} />}
                                label={`DenetciAdmin: ${stats.adminCount}`}
                                color="primary"
                                variant="outlined"
                            />
                        </Stack>
                    </Box>
                </BlankCard>
            )}

            {selectedDenetciId && !loadingUsers && !loadError && stats.activeAdminCount === 0 && (
                <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenAddModal(true)}
                        >
                            Ana Kullanıcı Ekle
                        </Button>
                    }
                >
                    Bu denetçi firmada şu anda aktif bir Ana Kullanıcı (DenetciAdmin) bulunmuyor.
                </Alert>
            )}

            {selectedDenetciId && (
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", md: "center" }}
                    sx={{ mb: 2.5 }}
                >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flex: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Ad soyad, e-posta, ünvan veya sicil no ara..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            sx={{ minWidth: { sm: 260 }, flex: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconSearch size={18} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            select
                            size="small"
                            label="Durum"
                            value={durumFilter}
                            onChange={(e) =>
                                setDurumFilter(e.target.value as "all" | "active" | "passive")
                            }
                            sx={{ minWidth: 140 }}
                        >
                            <MenuItem value="all">Tümü</MenuItem>
                            <MenuItem value="active">Aktif</MenuItem>
                            <MenuItem value="passive">Pasif</MenuItem>
                        </TextField>

                        <TextField
                            select
                            size="small"
                            label="Yetki"
                            value={roleFilter}
                            onChange={(e) =>
                                setRoleFilter(e.target.value as "all" | "admin" | "standard")
                            }
                            sx={{ minWidth: 170 }}
                        >
                            <MenuItem value="all">Tümü</MenuItem>
                            <MenuItem value="admin">DenetciAdmin</MenuItem>
                            <MenuItem value="standard">Standart Kullanıcı</MenuItem>
                        </TextField>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Listeyi Yenile">
                            <IconButton onClick={fetchUsers} disabled={loadingUsers}>
                                <IconRefresh size={20} />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<IconPlus size={18} />}
                            onClick={() => handleOpenAddModal(false)}
                        >
                            Yeni Kullanıcı Ekle
                        </Button>
                    </Stack>
                </Stack>
            )}

            {loadError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button color="inherit" size="small" onClick={fetchUsers}>
                            Tekrar Dene
                        </Button>
                    }
                >
                    {loadError}
                </Alert>
            )}

            <BlankCard>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Kullanıcı
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Ünvan
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        E-posta
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Telefon / GSM
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Yetki
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Durum
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        İşlemler
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!selectedDenetciId ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Kullanıcılarını görüntülemek ve düzenlemek için yukarıdan bir
                                            denetçi firma seçin.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : loadingUsers ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
                                            <CircularProgress size={22} />
                                            <Typography variant="body2" color="text.secondary">
                                                Kullanıcılar yükleniyor...
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            {rows.length === 0
                                                ? "Bu denetçi firmaya kayıtlı kullanıcı bulunamadı."
                                                : "Arama/filtre kriterlerine uyan kullanıcı bulunamadı."}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRows.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        fontSize: "0.85rem",
                                                        bgcolor: row.isDenetciAdmin
                                                            ? "primary.main"
                                                            : "grey.400",
                                                    }}
                                                >
                                                    {getInitials(row.personelAdi)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {row.personelAdi || "İsimsiz Kullanıcı"}
                                                    </Typography>
                                                    {row.bdSicilNo ? (
                                                        <Typography variant="caption" color="text.secondary">
                                                            BD Sicil: {row.bdSicilNo}
                                                        </Typography>
                                                    ) : null}
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {row.unvani || "—"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{row.email || "—"}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2">
                                                    {row.tel || row.gsm || "—"}
                                                </Typography>
                                                {row.tel && row.gsm ? (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {row.gsm}
                                                    </Typography>
                                                ) : null}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                size="small"
                                                label={row.isDenetciAdmin ? "DenetciAdmin" : "Kullanıcı"}
                                                color={row.isDenetciAdmin ? "primary" : "default"}
                                                variant={row.isDenetciAdmin ? "filled" : "outlined"}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                size="small"
                                                label={row.aktifPasif ? "Aktif" : "Pasif"}
                                                color={row.aktifPasif ? "success" : "error"}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Tooltip title="Düzenle">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => setEditTarget(row)}
                                                    >
                                                        <IconEdit size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Şifre Sıfırla">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => setPasswordTarget(row)}
                                                    >
                                                        <IconLock size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={row.aktifPasif ? "Pasife Al" : "Aktif Yap"}>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            color={row.aktifPasif ? "warning" : "success"}
                                                            disabled={togglingUserId === row.id}
                                                            onClick={() => handleToggleStatus(row)}
                                                        >
                                                            {row.aktifPasif ? (
                                                                <IconUserOff size={18} />
                                                            ) : (
                                                                <IconUserCheck size={18} />
                                                            )}
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                                <Tooltip title="Sil">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => {
                                                            setDeleteError(null);
                                                            setDeleteTarget(row);
                                                        }}
                                                    >
                                                        <IconTrash size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </BlankCard>

            <KullaniciEkleModal
                open={isAddModalOpen}
                denetciId={selectedDenetciId}
                firmaAdi={firmDisplayName}
                unvanSecenekleri={unvanSecenekleri}
                defaultIsDenetciAdmin={defaultAddAdmin}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchUsers}
            />

            <KullaniciDuzenleModal
                open={Boolean(editTarget)}
                onClose={() => setEditTarget(null)}
                onSuccess={fetchUsers}
                kullanici={editTarget}
                unvanSecenekleri={unvanSecenekleri}
                isLastActiveAdmin={Boolean(
                    editTarget?.isDenetciAdmin &&
                        editTarget?.aktifPasif &&
                        stats.activeAdminCount <= 1
                )}
            />

            <KullaniciSifreDegistirModal
                open={Boolean(passwordTarget)}
                onClose={() => setPasswordTarget(null)}
                kullaniciId={passwordTarget?.id ?? null}
                kullaniciAdi={passwordTarget?.personelAdi}
                kullaniciEmail={passwordTarget?.email}
            />

            <Dialog
                open={Boolean(deleteTarget)}
                onClose={isDeleting ? undefined : () => setDeleteTarget(null)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Kullanıcı Sil</DialogTitle>
                <DialogContent dividers>
                    {deleteError ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    ) : null}
                    <Typography variant="body1" gutterBottom>
                        <strong>{deleteTarget?.personelAdi || deleteTarget?.email}</strong>{" "}
                        kullanıcısını silmek istediğinize emin misiniz?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Denetim görev atamaları veya eğitim kayıtları bulunan kullanıcılar veri
                        bütünlüğü için silinemez; bunun yerine pasife alabilirsiniz.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                        Vazgeç
                    </Button>
                    {deleteError && deleteTarget?.aktifPasif ? (
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={handleDeactivateFromDeleteDialog}
                            disabled={isDeleting}
                        >
                            Pasife Al
                        </Button>
                    ) : null}
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Siliniyor..." : "Evet, Sil"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DenetciKullaniciYonetimi;
