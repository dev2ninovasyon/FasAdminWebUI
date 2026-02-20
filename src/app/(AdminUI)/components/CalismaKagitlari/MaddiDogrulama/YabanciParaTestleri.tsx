import React, { useEffect, useState } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Snackbar,
    Alert,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import {
    getYabanciParaTestleriByDenetlenen,
    updateYabanciParaTestleriRow,
    YabanciParaTestleriRow,
} from "@/api/CalismaKagitlari/YabanciParaTestleri";

interface CalismaKagidiProps {
    controller: string;
    dipnotAdi: string;
    dipnotNo: string;
    modelAdi: string;
    setDip: (str: string) => void;
    isReport?: boolean;
}

const fmt = (n: any) =>
    Number(n ?? 0).toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const YabanciParaTestleri: React.FC<CalismaKagidiProps> = ({
    controller,
    dipnotNo,
    modelAdi,
    setDip,
    isReport,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);

    const HEADER_BG = theme.palette.primary.main;
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const TEXT_COLOR = theme.palette.mode === 'dark' ? "#FFFFFF" : "#000000";
    const BORDER_COLOR = theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0';

    const [veriler, setVeriler] = useState<YabanciParaTestleriRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [editValues, setEditValues] = useState<Record<number, string>>({});

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getYabanciParaTestleriByDenetlenen(
                controller,
                user.denetciId || 0,
                user.yil || 0, // ✅ yil
                user.denetlenenId || 0, // ✅ denetlenenId
                dipnotNo,
                modelAdi
            );

            if (res) {
                const list =
                    Array.isArray(res) ? res :
                        res.data ??                 // { data: [...] }
                        res.resultData ??           // { resultData: [...] }
                        res?.data?.data ??          // { data: { data: [...] } }
                        res?.result?.data ??        // { result: { data: [...] } }
                        [];

                setVeriler(Array.isArray(list) ? list : []);
            } else {
                setVeriler([]);
            }
            console.log("GetByDenetlenen raw res =", res);

        } catch (error) {
            console.log("fetchData error:", error);
            setVeriler([]);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        if (resolvedDipnotNo) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedDipnotNo, controller, modelAdi, user.denetlenenId, user.yil, user.denetciId]);

    const handleInputChange = (id: number, val: string) => {
        setEditValues((prev) => ({ ...prev, [id]: val }));

        // Canlı hesaplama için veriler state'ini de güncelleyelim
        const normalizedVal = val.replace(/\./g, "").replace(",", ".");
        const valNum = parseFloat(normalizedVal);
        if (!isNaN(valNum)) {
            setVeriler((prev) =>
                prev.map((item) => {
                    if (item.id === id) {
                        const newHesaplanan = Math.round(valNum * (item.kur || 0) * 100) / 100;
                        const newFark =
                            Math.round(((item.mizanBakiye || 0) - newHesaplanan) * 100) / 100;
                        return {
                            ...item,
                            dovizBakiye: valNum,
                            hesaplananBakiye: newHesaplanan,
                            degisimTl: newFark,
                        };
                    }
                    return item;
                })
            );
        }
    };

    const handleSaveRow = async (row: YabanciParaTestleriRow) => {
        const valStr = editValues[row.id];
        if (valStr === undefined) return;

        const normalizedVal = valStr.replace(/\./g, "").replace(",", ".");
        const valNum = parseFloat(normalizedVal);

        try {
            const updatedRow = { ...row, dovizBakiye: isNaN(valNum) ? 0 : valNum };

            const result = await updateYabanciParaTestleriRow(
                controller,
                row.id,
                updatedRow
            );

            if (result) {
                setSnackbar({
                    open: true,
                    message: "Kayıt başarıyla güncellendi.",
                    severity: "success",
                });

                setEditValues((prev) => {
                    const copy = { ...prev };
                    delete copy[row.id];
                    return copy;
                });
            }
        } catch (err) {
            setSnackbar({
                open: true,
                message: "Güncelleme sırasında bir hata oluştu.",
                severity: "error",
            });
        }
    };

    if (loading && veriler.length === 0) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                <CircularProgress size={24} />
                <Typography sx={{ ml: 2 }}>Veriler yükleniyor...</Typography>
            </Box>
        );
    }

    if (!loading && veriler.length === 0 && isReport) {
        return null;
    }

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Yabancı Para Testleri
            </Typography>
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: `1px solid ${BORDER_COLOR}`,
                    borderRadius: "0px",
                    width: "100%",
                }}
            >
                <Table size="small" sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: HEADER_BG }}>
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                    textAlign: "center",
                                    color: "white",
                                    py: 1.5,
                                }}
                            >
                                Hesap No
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                    textAlign: "left",
                                    color: "white",
                                    py: 1.5,
                                }}
                            >
                                Hesap Açıklaması
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                    textAlign: "center",
                                    width: 150,
                                    color: "white",
                                    py: 1.5,
                                }}
                            >
                                Döviz Bakiye
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                    textAlign: "center",
                                    width: 100,
                                    color: "white",
                                    py: 1.5,
                                }}
                            >
                                Para Birimi
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                    textAlign: "center",
                                    width: 100,
                                    color: "white",
                                    py: 1.5,
                                }}
                            >
                                Kur
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                    textAlign: "center",
                                    width: 150,
                                    color: "white",
                                    py: 1.5,
                                }}
                            >
                                Hesaplanan Bakiye
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                    textAlign: "center",
                                    width: 150,
                                    color: "white",
                                    py: 1.5,
                                }}
                            >
                                Mizan Bakiyesi
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 700,
                                    textAlign: "center",
                                    width: 150,
                                    color: "white",
                                    py: 1.5,
                                }}
                            >
                                Mizan Farkı
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {veriler.length > 0 ? (
                            veriler.map((row, idx) => {
                                const isEditing = editValues[row.id] !== undefined;
                                const displayValue = isEditing
                                    ? editValues[row.id]
                                    : fmt(row.dovizBakiye);

                                const fark = row.degisimTl ?? 0;

                                return (
                                    <TableRow
                                        key={row.id}
                                        sx={{
                                            backgroundColor: idx % 2 === 1 ? ZEBRA_ROW : BG_PAPER,
                                            "&:hover": { backgroundColor: theme.palette.action.hover },
                                        }}
                                    >
                                        <TableCell
                                            align="center"
                                            sx={{ fontWeight: 500, color: TEXT_COLOR }}
                                        >
                                            {row.detayKodu}
                                        </TableCell>
                                        <TableCell sx={{ color: TEXT_COLOR }}>
                                            {row.hesapAdi}
                                        </TableCell>

                                        <TableCell align="center">
                                            {isReport ? (
                                                <span>{displayValue}</span>
                                            ) : (
                                                <TextField
                                                    size="small"
                                                    value={displayValue}
                                                    onChange={(e) => handleInputChange(row.id, e.target.value)}
                                                    onBlur={() => handleSaveRow(row)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleSaveRow(row)}
                                                    variant="outlined"
                                                    sx={{
                                                        "& .MuiInputBase-input": {
                                                            textAlign: "right",
                                                            padding: "4px 8px",
                                                            fontSize: "0.875rem",
                                                            fontWeight: 500,
                                                            color: TEXT_COLOR,
                                                        },
                                                        backgroundColor: theme.palette.background.paper,
                                                        width: "130px",
                                                    }}
                                                />
                                            )}
                                        </TableCell>

                                        <TableCell
                                            align="center"
                                            sx={{ fontWeight: 500, color: TEXT_COLOR }}
                                        >
                                            {row.paraBirimi}
                                        </TableCell>

                                        <TableCell
                                            align="center"
                                            sx={{ fontWeight: 500, color: TEXT_COLOR }}
                                        >
                                            {fmt(row.kur)}
                                        </TableCell>

                                        <TableCell
                                            align="right"
                                            sx={{ fontWeight: 500, color: TEXT_COLOR }}
                                        >
                                            {fmt(row.hesaplananBakiye)}
                                        </TableCell>

                                        <TableCell
                                            align="right"
                                            sx={{ fontWeight: 500, color: TEXT_COLOR }}
                                        >
                                            {fmt(row.mizanBakiye)}
                                        </TableCell>

                                        <TableCell
                                            align="right"
                                            sx={{
                                                color: fark !== 0 ? theme.palette.error.main : TEXT_COLOR,
                                                fontWeight: fark !== 0 ? 700 : 500,
                                            }}
                                        >
                                            {fmt(fark)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="textSecondary">
                                        Görüntülenecek veri bulunamadı. Lütfen "Kayıtları Yeniden Oluştur"
                                        butonuna basınız.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default YabanciParaTestleri;


