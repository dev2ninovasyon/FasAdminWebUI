import React, { useEffect, useMemo, useState } from "react";
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
    Stack,
    MenuItem,
    IconButton,
    Button,
    Snackbar,
    Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { IconDeviceFloppy } from "@tabler/icons-react";

import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";

import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";
import {
    getHesapTestleriByDenetlenen,
    updateHesapTestRow,
    type HesapTestRow,
} from "@/api/CalismaKagitlari/HesaplaraIliskinUygulananDenetimTestleri";

interface CalismaKagidiProps {
    controller: string;
    dipnotAdi: string;
    dipnotNo: string;
    modelAdi: string;
    setDip: (str: string) => void;
    isReport?: boolean;
}

const fmt = (n: any) =>
    Number(n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });


function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
        ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
        Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
    };
    let normalized = (str ?? "").replace(/[çğıöşüÇĞÖŞÜıİ]/g, (m) => turkishChars[m] || m);
    normalized = normalized.replace(/\s+/g, "");
    return normalized.toLowerCase();
}

const HesaplaraIliskinUygulananDenetimTestleri: React.FC<CalismaKagidiProps> = ({
    controller,
    dipnotAdi,
    dipnotNo,
    modelAdi,
    setDip,
    isReport,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);

    // Dynamic colors based on theme mode
    const HEADER_BG = theme.palette.primary.main;
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const TEXT_COLOR = theme.palette.mode === 'dark' ? "#FFFFFF" : "#000000";

    const [veriler, setVeriler] = useState<HesapTestRow[]>([]);
    const [savingRowId, setSavingRowId] = useState<number | null>(null);
    const [savingKebir, setSavingKebir] = useState<string | null>(null);

    // Bulk selection state for each Kebir group
    const [bulkOnemlilik, setBulkOnemlilik] = useState<Record<string, string>>({});

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const [loading, setLoading] = useState(false);
    const [resolvedDipnotNo, setResolvedDipnotNo] = useState(dipnotNo);

    useEffect(() => {
        setResolvedDipnotNo(dipnotNo);
    }, [dipnotNo]);

    useEffect(() => {
        const resolveDipnot = async () => {
            if (!dipnotNo && modelAdi) {
                setLoading(true);
                try {
                    const { getDipnotNoByDipnotAdi } = await import("@/api/MaddiDogrulama/MaddiDogrulama");
                    const dNo = await getDipnotNoByDipnotAdi(user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                        modelAdi,
                        user.denetimTuru === "Tfrs"
                    );
                    if (dNo) {
                        setResolvedDipnotNo(dNo);
                    } else {
                        console.warn("Dipnot no bulunamadı:", modelAdi);
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Dipnot no getirilemedi:", error);
                    setLoading(false);
                }
            }
        };
        resolveDipnot();
    }, [dipnotNo, modelAdi, user]);

    const fetchData = async () => {
        if (!resolvedDipnotNo) return;
        setLoading(true);
        try {
            console.log("HesapTestleri Fetching:", { controller, resolvedDipnotNo, modelAdi });
            const res = await getHesapTestleriByDenetlenen(
                controller,
                user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                resolvedDipnotNo,
                modelAdi
            );

            if (!res) {
                setVeriler([]);
                return;
            }

            const rawList = Array.isArray(res) ? res : (res.data ?? []);

            // Flatten mapping - The backend json is already flat
            const list: HesapTestRow[] = rawList.map((x: any) => ({
                id: x.id,
                dipnotNo: x.dipnotNo,
                baslik: x.baslik,
                hesapAdi: x.hesapAdi ?? "",
                kebirKodu: String(x.kebirKodu ?? ""),
                detayKodu: String(x.detayKodu ?? ""),
                oncekiDonemBakiye: x.oncekiDonemBakiye,
                cariDonemBakiye: x.cariDonemBakiye,
                degisimTl: x.degisimTl,
                degisimYuzde: x.degisimYuzde,
                onemlilik: String(x.onemlilik ?? "0"),
                dipnot: x.dipnot ?? "",
                paraBirimi: x.paraBirimi ?? "",
                denetlenen: x.denetlenen,
                modelAdi: x.modelAdi
            }));

            // Filter by dipnotAdi if necessary, though backend should have done it or returns relevant set.
            // User's previous code filtered by `hesapAdi` vs `dipnotAdi`.
            // Let's trust the backend result but apply the normalize filter if needed.
            // Backend `getHesapTestleriByDenetlenen` uses `dipnotNo`.
            // If the result is just for that dipnot, we can use it all.
            // But `hesapAdi` needs to be set for the Page Title via `setDip`.
            // Let's find the first One that matches parentName/dipnotAdi just to be safe or update title.
            const titleRow = list.find((r: any) => normalizeString(r.hesapAdi) === normalizeString(dipnotAdi));
            if (titleRow?.hesapAdi) setDip(titleRow.hesapAdi);

            // Use all data returned
            setVeriler(list);
        } catch (error) {
            console.error("Veri çekme hatası:", error);
            showSnackbar("Veriler yüklenirken bir hata oluştu", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedDipnotNo]);

    if (isReport && !loading && veriler.length === 0) return null;

    // Split Data
    const anaHesaplar = useMemo(() => {
        // Summary rows typically have kebirKodu == detayKodu
        return veriler.filter(x => x.kebirKodu === x.detayKodu).sort((a, b) => a.kebirKodu.localeCompare(b.kebirKodu));
    }, [veriler]);

    const altHesaplar = useMemo(() => {
        // Detail rows
        return veriler.filter(x => x.kebirKodu !== x.detayKodu).sort((a, b) => a.detayKodu.localeCompare(b.detayKodu));
    }, [veriler]);

    const groupedAlt = useMemo(() => {
        const groups: Record<string, HesapTestRow[]> = {};
        altHesaplar.forEach(row => {
            if (!groups[row.kebirKodu]) groups[row.kebirKodu] = [];
            groups[row.kebirKodu].push(row);
        });
        return groups;
    }, [altHesaplar]);

    // Handlers
    const handleSetRowOnemlilik = async (id: number, val: string) => {
        // Optimistic UI update
        setVeriler((prev) => prev.map((x) => (x.id === id ? { ...x, onemlilik: val } : x)));

        setSavingRowId(id);
        try {
            const row = veriler.find((r) => r.id === id);
            if (row) {
                // Send update to backend
                await updateHesapTestRow(controller, id, { ...row, onemlilik: val });
                showSnackbar("Kayıt başarıyla güncellendi.", "success");
            }
        } catch (err) {
            console.log(err);
            showSnackbar("Güncelleme sırasında bir hata oluştu.", "error");
        } finally {
            setSavingRowId(null);
        }
    };

    const handleSetBulkOnemlilik = async (kebirKodu: string, val: string) => {
        setBulkOnemlilik((prev) => ({ ...prev, [kebirKodu]: val }));

        // Optimistic UI update for all sub-rows
        setVeriler((prev) =>
            prev.map((r) =>
                r.kebirKodu === kebirKodu && r.kebirKodu !== r.detayKodu
                    ? { ...r, onemlilik: val }
                    : r
            )
        );

        const rowsToSave = groupedAlt[kebirKodu] || [];
        if (rowsToSave.length === 0) return;

        setSavingKebir(kebirKodu);
        try {
            // Fetch fresh copy or use optimistic? Using optimistic is fine for "Onemlilik".
            // Update all rows in backend
            await Promise.all(
                rowsToSave.map((r) =>
                    updateHesapTestRow(controller, r.id, { ...r, onemlilik: val })
                )
            );
            showSnackbar("Tüm kayıtlar başarıyla güncellendi.", "success");
        } catch (err) {
            console.log(err);
            showSnackbar("Toplu güncelleme sırasında bir hata oluştu.", "error");
        } finally {
            setSavingKebir(null);
        }
    };

    // Calculate totals for a group (including anaHesap row logic if needed)
    // Actually, AnaHesap row usually holds the total from backend. 
    // We should display the total row at bottom of detail table by summing children OR using anaHesap row?
    // User image shows "Toplam" row at bottom of detail table.
    // And Ana Hesaplar table at top.

    // Helper to render total row
    const renderTotalRow = (rows: HesapTestRow[], label: string = "Toplam") => {
        const tOnceki = rows.reduce((s, x) => s + (x.oncekiDonemBakiye ?? 0), 0);
        const tCari = rows.reduce((s, x) => s + (x.cariDonemBakiye ?? 0), 0);
        const tDegisim = rows.reduce((s, x) => s + (x.degisimTl ?? 0), 0);
        // % change
        const tYuzde = tOnceki !== 0 ? ((tCari - tOnceki) / tOnceki) * 100 : 0;

        return (
            <TableRow sx={{ backgroundColor: BG_PAPER }}>
                <TableCell colSpan={2} sx={{ fontWeight: 800 }}>{label}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>{fmt(tOnceki)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>{fmt(tCari)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>{fmt(tDegisim)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>% {tYuzde.toFixed(2)}</TableCell>
                <TableCell colSpan={1} />
            </TableRow>
        );
    };

    const renderAnaHesaplar = () => {
        // Calculate total of Ana Hesaplar
        const tOnceki = anaHesaplar.reduce((s, x) => s + (x.oncekiDonemBakiye ?? 0), 0);
        const tCari = anaHesaplar.reduce((s, x) => s + (x.cariDonemBakiye ?? 0), 0);
        const tDegisim = anaHesaplar.reduce((s, x) => s + (x.degisimTl ?? 0), 0);
        const tYuzde = tOnceki !== 0 ? ((tCari - tOnceki) / tOnceki) * 100 : 0;

        return (
            <Box mb={4}>
                <Box sx={{ backgroundColor: HEADER_BG, px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="white">
                        Ana Hesaplar
                    </Typography>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0'}` }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: HEADER_BG }}>
                                <TableCell sx={{ fontWeight: 700, width: "10%", color: "white" }}>Hesap No</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: "35%", color: "white" }}>Hesap Açıklaması</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, width: "11%", color: "white" }}>Önceki Dönem Bakiye</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, width: "11%", color: "white" }}>Cari Dönem Bakiye</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, width: "11%", color: "white" }}>Değişim TL</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, width: "7%", color: "white" }}>Değişim %</TableCell>
                                <TableCell sx={{ width: "15%", color: "white" }} />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {anaHesaplar.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">Kayıt bulunamadı.</TableCell>
                                </TableRow>
                            )}
                            {anaHesaplar.map((row, idx) => (
                                <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                    <TableCell sx={{ color: TEXT_COLOR }}>{row.kebirKodu}</TableCell>
                                    <TableCell sx={{ color: TEXT_COLOR }}>{row.hesapAdi}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.oncekiDonemBakiye)}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.cariDonemBakiye)}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.degisimTl)}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>% {(row.degisimYuzde ?? 0).toFixed(2)}</TableCell>
                                    <TableCell />
                                </TableRow>
                            ))}
                            {/* Grand Total Row */}
                            <TableRow sx={{ backgroundColor: BG_PAPER, borderTop: `2px solid ${HEADER_BG}` }}>
                                <TableCell colSpan={2} sx={{ fontWeight: 800, color: TEXT_COLOR }}>Toplam</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: TEXT_COLOR }}>{fmt(tOnceki)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: TEXT_COLOR }}>{fmt(tCari)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: TEXT_COLOR }}>{fmt(tDegisim)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>% {tYuzde.toFixed(2)}</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    const renderDetailTable = (kebirKodu: string) => {
        const rows = groupedAlt[kebirKodu] || [];
        // Find Ana Hesap row to get the Title (e.g. "100 - Kasa")
        const parentRow = anaHesaplar.find(x => x.kebirKodu === kebirKodu);
        const title = parentRow
            ? `${parentRow.kebirKodu} - ${parentRow.hesapAdi}`
            : `${kebirKodu} - Detaylar`;

        return (
            <Box mb={4} key={kebirKodu}>
                <Box sx={{ backgroundColor: HEADER_BG, px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="white">
                        {title}
                    </Typography>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0'}` }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: HEADER_BG }}>
                                <TableCell sx={{ fontWeight: 700, width: "10%", color: "white" }}>Hesap No</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: "35%", color: "white" }}>Hesap Açıklaması</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, width: "11%", color: "white" }}>Önceki Dönem Bakiye</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, width: "11%", color: "white" }}>Cari Dönem Bakiye</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, width: "11%", color: "white" }}>Değişim TL</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, width: "7%", color: "white" }}>Değişim %</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: "15%", color: "white" }}>
                                    {!isReport && (
                                        <CustomSelect
                                            value={bulkOnemlilik[kebirKodu] || ""}
                                            onChange={(e: any) => handleSetBulkOnemlilik(kebirKodu, e.target.value)}
                                            size="small"
                                            fullWidth
                                            disabled={savingKebir === kebirKodu}
                                            sx={{
                                                minWidth: 100, // Reduced from 140
                                                bgcolor: BG_PAPER,
                                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                                                "& .MuiSelect-select": { color: bulkOnemlilik[kebirKodu] ? "inherit" : "white" }
                                            }}
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>Tümü İçin Önemlilik</MenuItem>
                                            <MenuItem value="0">Önemlilik Yok</MenuItem>
                                            <MenuItem value="1">Önemsiz</MenuItem>
                                            <MenuItem value="2">Orta</MenuItem>
                                            <MenuItem value="3">Yüksek</MenuItem>
                                        </CustomSelect>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, idx) => (
                                <TableRow key={row.id} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                    <TableCell sx={{ color: TEXT_COLOR }}>{row.detayKodu}</TableCell>
                                    <TableCell sx={{ color: TEXT_COLOR }}>{row.hesapAdi} {row.paraBirimi ? `(${row.paraBirimi})` : ""}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.oncekiDonemBakiye)}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.cariDonemBakiye)}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.degisimTl)}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>% {(row.degisimYuzde ?? 0).toFixed(2)}</TableCell>
                                    <TableCell>
                                        {isReport ? (
                                            <span>
                                                {row.onemlilik === "1" ? "Önemsiz" : row.onemlilik === "2" ? "Orta" : row.onemlilik === "3" ? "Yüksek" : "Önemlilik Yok"}
                                            </span>
                                        ) : (
                                            <CustomSelect
                                                value={row.onemlilik || "0"}
                                                onChange={(e: any) => handleSetRowOnemlilik(row.id, e.target.value)}
                                                size="small"
                                                fullWidth
                                                disabled={savingRowId === row.id}
                                                sx={{ minWidth: 100, bgcolor: BG_PAPER }} // Reduced from 130
                                            >
                                                <MenuItem value="0">Önemlilik Seçiniz</MenuItem>
                                                <MenuItem value="1">Önemsiz</MenuItem>
                                                <MenuItem value="2">Orta</MenuItem>
                                                <MenuItem value="3">Yüksek</MenuItem>
                                            </CustomSelect>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {renderTotalRow(rows)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    return (
        <Grid container>
            <Grid size={12}>
                <Box px={isReport ? 0 : 3} pt={isReport ? 0 : 3} pb={isReport ? 0 : 5} sx={{ width: "100%", margin: "0 auto" }}>
                    {renderAnaHesaplar()}
                    {/* Render each kebir group */}
                    {anaHesaplar.map(main => (
                        // only render if there are sub accounts? Or render empty if needed? 
                        // Usually there are sub accounts if it's in the list.
                        // But use groupedAlt keys for safety or iterate anaHesaplar and find children.
                        (groupedAlt[main.kebirKodu] && groupedAlt[main.kebirKodu].length > 0 ? renderDetailTable(main.kebirKodu) : null)
                    ))}
                    {/* Catch any orphan groups that didn't have a main account logic? (Unlikely per logic) */}
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

export default HesaplaraIliskinUygulananDenetimTestleri;


