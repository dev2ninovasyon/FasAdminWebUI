"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Snackbar,
    Alert,
    TextField,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconDeviceFloppy } from "@tabler/icons-react";

import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";

import {
    getHareketsizTicariAlacaklarByDenetlenen,
    updateHareketsizTicariAlacaklarRow,
    calculateHareketsizTicariAlacaklar,
    type HareketsizTicariAlacaklarRow,
} from "../../../../../api/CalismaKagitlari/HareketsizTicariAlacaklar";

interface Props {
    controller: string;
    dipnotAdi: string;
    dipnotNo: string;
    modelAdi: string;
    setDip: (str: string) => void;
    isClickedHesapla?: boolean;
    setIsClickedHesapla?: (val: boolean) => void;
    isReport?: boolean;
}

const fmt = (n: any) =>
    Number(n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const HareketsizTicariAlacaklar: React.FC<Props> = ({
    controller,
    dipnotAdi,
    dipnotNo,
    modelAdi,
    setDip,
    isClickedHesapla,
    setIsClickedHesapla,
    isReport
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);

    const HEADER_BG = theme.palette.primary.main;
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const TEXT_COLOR = theme.palette.mode === 'dark' ? "#FFFFFF" : "#000000";
    const BORDER_COLOR = theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0';

    const [veriler, setVeriler] = useState<HareketsizTicariAlacaklarRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingRowId, setSavingRowId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<Record<number, Partial<HareketsizTicariAlacaklarRow>>>({});

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getHareketsizTicariAlacaklarByDenetlenen(
                controller,
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0
            );

            if (res && Array.isArray(res)) {
                setVeriler(res);
            } else {
                setVeriler([]);
            }
        } catch (error) {
            console.log("Veri çekme hatası:", error);
            setVeriler([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.denetlenenId, user.yil]);

    useEffect(() => {
        if (isClickedHesapla && setIsClickedHesapla) {
            const handleHesapla = async () => {
                try {
                    setLoading(true);
                    await calculateHareketsizTicariAlacaklar(user.denetciId || 0,
                        user.yil || 0,
                        user.denetlenenId || 0,
                        1
                    );
                    showSnackbar("Hesaplama başarıyla tamamlandı.", "success");
                    await fetchData();
                } catch (error) {
                    showSnackbar("Hesaplama sırasında bir hata oluştu. Lütfen kapanış fişlerini kontrol edin.", "error");
                } finally {
                    setIsClickedHesapla(false);
                    setLoading(false);
                }
            };
            handleHesapla();
        }
    }, [isClickedHesapla]);

    const handleInputChange = (id: number, field: keyof HareketsizTicariAlacaklarRow, val: string) => {
        setEditValues(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: val
            }
        }));
    };

    const handleSaveRow = async (row: HareketsizTicariAlacaklarRow) => {
        const changes = editValues[row.id];
        if (!changes) return;

        const parseAmount = (val: any) => {
            if (val === undefined || val === null || val === "") return 0;
            if (typeof val === "number") return val;
            return parseFloat(String(val).replace(/\./g, "").replace(",", "."));
        };

        const payload: Partial<HareketsizTicariAlacaklarRow> = { ...changes };
        if (changes.borcTutari !== undefined) payload.borcTutari = parseAmount(changes.borcTutari);
        if (changes.alacakTutari !== undefined) payload.alacakTutari = parseAmount(changes.alacakTutari);
        if (changes.netBakiye !== undefined) payload.netBakiye = parseAmount(changes.netBakiye);

        setSavingRowId(row.id);
        try {
            const updatedRow = { ...row, ...payload };
            setVeriler(prev => prev.map(x => x.id === row.id ? updatedRow : x));

            await updateHareketsizTicariAlacaklarRow(controller, row.id, payload);
            showSnackbar("Kayıt başarıyla güncellendi.", "success");

            setEditValues(prev => {
                const copy = { ...prev };
                delete copy[row.id];
                return copy;
            });
        } catch (err) {
            console.log(err);
            showSnackbar("Güncelleme sırasında bir hata oluştu.", "error");
        } finally {
            setSavingRowId(null);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    if (isReport && !loading && veriler.length === 0) return null;

    return (
        <Grid container>
            <Grid size={12}>
                <Box px={0} pt={3} pb={5} sx={{ width: "100%", margin: "0 auto" }}>
                    <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                        Hareketsiz Ticari Alacaklar
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}` }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: HEADER_BG }}>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center", color: "white" }}>Kebir Kodu</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center", color: "white" }}>Detay Kodu</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center", color: "white" }}>Hesap Adı</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center", color: "white" }}>Borç Tutarı</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center", color: "white" }}>Alacak Tutarı</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center", color: "white" }}>Net Bakiye</TableCell>
                                    <TableCell sx={{ fontWeight: 800, textAlign: "center", color: "white" }}>Para Birimi</TableCell>
                                    {!isReport && <TableCell sx={{ width: 70, textAlign: "center", color: "white" }} />}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {veriler.map((row, idx) => {
                                    const isEditing = !!editValues[row.id];
                                    const changes = editValues[row.id] || {};

                                    return (
                                        <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                            <TableCell align="center" sx={{ color: TEXT_COLOR }}>{row.kebirKodu}</TableCell>
                                            <TableCell align="center" sx={{ color: TEXT_COLOR }}>{row.detayKodu}</TableCell>
                                            <TableCell sx={{ color: TEXT_COLOR }}>{row.hesapAdi}</TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    value={isEditing && changes.borcTutari !== undefined ? changes.borcTutari : fmt(row.borcTutari)}
                                                    onChange={(e) => handleInputChange(row.id, 'borcTutari', e.target.value)}
                                                    variant="standard"
                                                    InputProps={{ disableUnderline: true, readOnly: isReport }}
                                                    sx={{ "& .MuiInputBase-input": { textAlign: "right", color: TEXT_COLOR } }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    value={isEditing && changes.alacakTutari !== undefined ? changes.alacakTutari : fmt(row.alacakTutari)}
                                                    onChange={(e) => handleInputChange(row.id, 'alacakTutari', e.target.value)}
                                                    variant="standard"
                                                    InputProps={{ disableUnderline: true, readOnly: isReport }}
                                                    sx={{ "& .MuiInputBase-input": { textAlign: "right", color: TEXT_COLOR } }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    value={isEditing && changes.netBakiye !== undefined ? changes.netBakiye : fmt(row.netBakiye)}
                                                    onChange={(e) => handleInputChange(row.id, 'netBakiye', e.target.value)}
                                                    variant="standard"
                                                    InputProps={{ disableUnderline: true, readOnly: isReport }}
                                                    sx={{ "& .MuiInputBase-input": { textAlign: "right", color: TEXT_COLOR } }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ color: TEXT_COLOR }}>{row.paraBirimi}</TableCell>
                                            {!isReport && (
                                                <TableCell align="center">
                                                    {isEditing && (
                                                        <Tooltip title="Kaydet">
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => handleSaveRow(row)}
                                                                disabled={savingRowId === row.id}
                                                                size="small"
                                                                sx={{ color: theme.palette.success.main }}
                                                            >
                                                                <IconDeviceFloppy size={18} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                                {veriler.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                            Veri bulunamadı. Hesapla butonuna basarak verileri oluşturabilirsiniz.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Grid>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled" sx={{ width: "100%", color: "white" }} elevation={6}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Grid>
    );
};

export default HareketsizTicariAlacaklar;


