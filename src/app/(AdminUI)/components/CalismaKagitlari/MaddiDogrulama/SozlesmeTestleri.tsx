"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Snackbar,
    Alert,
    Grid,
    useTheme
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getSozlesmeTestleri,
    updateSozlesmeTestleri,
    SozlesmeTestleriData,
    varsayilanaDon
} from "@/api/CalismaKagitlari/SozlesmeTestleri";

interface Props {
    dipnotNo: string;
    modelAdi: string;
    isClickedVarsayilanaDon: boolean;
    setIsClickedVarsayilanaDon: (deger: boolean) => void;
    isReport?: boolean;
}

const SozlesmeTestleri: React.FC<Props> = ({ dipnotNo, modelAdi, isClickedVarsayilanaDon, setIsClickedVarsayilanaDon, isReport }) => {
    const theme = useTheme();
    const [veriler, setVeriler] = useState<SozlesmeTestleriData[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: AppState) => state.userReducer);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const [resolvedDipnotNo, setResolvedDipnotNo] = useState(dipnotNo);

    useEffect(() => {
        setResolvedDipnotNo(dipnotNo);
    }, [dipnotNo]);

    useEffect(() => {
        const resolveDipnot = async () => {
            if (!dipnotNo && modelAdi) {
                try {
                    const { getDipnotNoByDipnotAdi } = await import("@/api/MaddiDogrulama/MaddiDogrulama");
                    const dNo = await getDipnotNoByDipnotAdi(user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                        modelAdi,
                        user.denetimTuru === "Tfrs"
                    );
                    if (dNo) setResolvedDipnotNo(dNo);
                } catch (error) {
                    console.error("Dipnot no getirilemedi:", error);
                }
            }
        };
        resolveDipnot();
    }, [dipnotNo, modelAdi, user]);

    const fetchData = async () => {
        if (user.token && user.denetciId && user.yil && user.denetlenenId && resolvedDipnotNo) {
            setLoading(true);
            try {
                const result = await getSozlesmeTestleri(user.denetciId, user.yil, user.denetlenenId, resolvedDipnotNo);
                setVeriler(result || []);
            } catch (error) {
                showSnackbar("Veriler yüklenirken bir hata oluştu.", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetciId, user.yil, user.denetlenenId, resolvedDipnotNo]);

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleInputChange = async (id: number, value: string) => {
        let cleanValue = value.replace(/\./g, "").replace(",", ".");
        const numericValue = parseFloat(cleanValue) || 0;

        const currentItem = veriler.find(v => v.id === id);
        if (!currentItem) return;

        // Sadece değer değiştiyse işlem yap
        if (currentItem.sozlesmedekiBakiye === numericValue) return;

        const updatedItem = {
            ...currentItem,
            sozlesmedekiBakiye: numericValue,
            fark: (currentItem.mizanBakiye || 0) - numericValue
        };

        // Optimistic update (Arayüzü hemen güncelle)
        setVeriler((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));

        if (user.token) {
            try {
                await updateSozlesmeTestleri(id, updatedItem);
                // Başarılı kayıtta kullanıcıyı rahatsız etme (Sessiz kaydet)
            } catch (error) {
                showSnackbar("Kaydetme sırasında bir hata oluştu.", "error");
            }
        }
    };

    const fmt = (n: any) =>
        Number(n ?? 0).toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const HEADER_BG = theme.palette.primary.main;
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const TEXT_COLOR = theme.palette.mode === 'dark' ? "#FFFFFF" : "#000000";
    const BORDER_COLOR = theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0';

    // Stil Tanımlamaları
    const tableHeaderStyle = {
        backgroundColor: HEADER_BG,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        border: `1px solid ${BORDER_COLOR}`,
        fontSize: "0.85rem",
        padding: "10px 5px",
        whiteSpace: "nowrap"
    };

    const tableCellStyle = {
        textAlign: "right",
        border: `1px solid ${BORDER_COLOR}`,
        fontSize: "0.85rem",
        padding: "8px",
        color: TEXT_COLOR
    };

    const firstColStyle = {
        textAlign: "center",
        fontWeight: "bold",
        border: `1px solid ${BORDER_COLOR}`,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : "#f5f5f5",
        fontSize: "0.85rem",
        width: "80px",
        color: TEXT_COLOR
    };

    const handleReset = async () => {
        if (user.token && user.denetciId && user.yil && user.denetlenenId && resolvedDipnotNo) {
            setLoading(true);
            try {
                await varsayilanaDon(user.denetciId, user.yil, user.denetlenenId, resolvedDipnotNo);
                showSnackbar("Veriler varsayılana döndürüldü.", "success");
                await fetchData();
            } catch (error) {
                showSnackbar("İşlem sırasında bir hata oluştu.", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (isClickedVarsayilanaDon) {
            handleReset();
            setIsClickedVarsayilanaDon(false);
        }
    }, [isClickedVarsayilanaDon]);

    if (isReport && !loading && veriler.length === 0) return null;

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Sözleşme Testleri
            </Typography>

            <Grid container>
                <Grid size={12}>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}` }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeaderStyle}>Hesap No</TableCell>
                                    <TableCell sx={{ ...tableHeaderStyle, textAlign: "left" }}>Hesap Açıklaması</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Mizan Bakiye</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Sözleşmedeki Bakiye</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Fark</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {veriler.map((row, idx) => (
                                    <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                        {/* Hesap No */}
                                        <TableCell sx={firstColStyle}>
                                            {row.detayKodu}
                                        </TableCell>

                                        {/* Hesap Açıklaması */}
                                        <TableCell sx={{ ...tableCellStyle, textAlign: "left", fontWeight: "500", minWidth: "250px" }}>
                                            {row.detayHesapAdi || row.hesapAdi}
                                        </TableCell>

                                        {/* Mizan Bakiye */}
                                        <TableCell sx={tableCellStyle}>
                                            {fmt(row.mizanBakiye)}
                                        </TableCell>

                                        {/* Sözleşmedeki Bakiye (Input) */}
                                        <TableCell sx={{ ...tableCellStyle, p: 0.5, textAlign: "center" }}>
                                            {isReport ? (
                                                <span>{fmt(row.sozlesmedekiBakiye)}</span>
                                            ) : (
                                                <TextField
                                                    size="small"
                                                    type="text"
                                                    defaultValue={row.sozlesmedekiBakiye}
                                                    onBlur={(e) => handleInputChange(row.id, e.target.value)}
                                                    inputProps={{ step: "0.01" }}
                                                    variant="outlined"
                                                    sx={{
                                                        width: "140px",
                                                        "& .MuiOutlinedInput-input": {
                                                            textAlign: "right",
                                                            padding: "6px 10px",
                                                            fontSize: "0.85rem",
                                                            backgroundColor: theme.palette.background.paper,
                                                            color: TEXT_COLOR,
                                                            "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                                                "-webkit-appearance": "none",
                                                                margin: 0,
                                                            },
                                                            "&[type=number]": {
                                                                "-moz-appearance": "textfield",
                                                            }
                                                        },
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: "4px"
                                                        }
                                                    }}
                                                />
                                            )}
                                        </TableCell>

                                        {/* Fark */}
                                        <TableCell sx={{ ...tableCellStyle, fontWeight: "bold", color: row.fark !== 0 ? "#d32f2f" : "inherit" }}>
                                            {fmt(row.fark)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {veriler.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#999" }}>
                                            Gösterilecek kayıt bulunamadı.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: "8px" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SozlesmeTestleri;

