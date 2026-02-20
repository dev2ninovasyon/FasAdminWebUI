import React, { useEffect, useState } from "react";
import {
    fetchAmortismanKontrolleri,
    saveAmortismanKontrolSatir,
    AmortismanKontrolleriResponseDto,
} from "@/api/CalismaKagitlari/AmortismanKontrolleri";
import { useSnackbar } from "notistack";
import { CircularProgress, Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, useTheme } from "@mui/material";

interface Props {
    denetlenenId: number;
    yil: number;
    dipnotNo: string;
    isReport?: boolean;
}

const AmortismanKontrolleri: React.FC<Props> = ({
    denetlenenId,
    yil,
    dipnotNo,
    isReport,
}) => {
    const theme = useTheme();
    const [data, setData] = useState<AmortismanKontrolleriResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    const [resolvedDipnotNo, setResolvedDipnotNo] = useState(dipnotNo);

    useEffect(() => {
        setResolvedDipnotNo(dipnotNo);
    }, [dipnotNo]);

    useEffect(() => {
        const resolveDipnot = async () => {
            if (!dipnotNo) {
                // Logic to resolve if needed
            }
        };
        resolveDipnot();
    }, [dipnotNo]);

    const fetchData = async () => {
        if (!resolvedDipnotNo) return;
        setLoading(true);
        try {
            const result = await fetchAmortismanKontrolleri(denetlenenId, yil, resolvedDipnotNo);
            // Backend returns { success: true, data: { ... }, message: ... }
            if (result && result.success && result.data) {
                setData(result.data);
            } else {
                enqueueSnackbar(result.message || "Veri alınamadı", { variant: "error" });
            }
        } catch (error) {
            console.log("Fetch error:", error);
            enqueueSnackbar("Bir hata oluştu", { variant: "error" });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [denetlenenId, yil, resolvedDipnotNo]);

    if (isReport && !loading && !data) return null;

    const handleSaveSatir = async (hesapKodu: string, value: string, id: number) => {
        const numValue = parseFloat(value.replace(",", "."));
        if (isNaN(numValue)) return;

        const result = await saveAmortismanKontrolSatir({
            id: id || 0,
            hesapKodu: hesapKodu,
            tahminiAmortismanGideri: numValue,
            denetlenenId,
            yil,
        });

        if (result.success) {
            enqueueSnackbar("Kaydedildi", { variant: "success" });
            fetchDataSilently();
        } else {
            enqueueSnackbar("Kaydetme başarısız", { variant: "error" });
        }
    };

    const fetchDataSilently = async () => {
        try {
            const result = await fetchAmortismanKontrolleri(denetlenenId, yil, dipnotNo);
            if (result?.success && result.data) {
                setData(result.data);
            }
        } catch (error) {
            console.log("Silent fetch error:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <CircularProgress />
            </div>
        );
    }

    if (!data) {
        return <div>Veri bulunamadı.</div>;
    }

    // Filter Accounts (257 or 268 based on DipnotNo)
    const targetKebir = dipnotNo === "16" ? 268 : 257;

    // Group DonusumMizan by DetayKodu
    const groupedAccounts = data.donusumMizanBobi
        .filter((x: any) => x.kebirKodu === targetKebir && x.detayKodu.length > 3)
        .reduce((acc: any, curr: any) => {
            if (!acc[curr.detayKodu]) {
                acc[curr.detayKodu] = {
                    detayKodu: curr.detayKodu,
                    hesapAdi: curr.hesapAdi,
                    cari: 0,
                    onceki: 0,
                };
            }
            if (curr.yil === yil) acc[curr.detayKodu].cari = curr.bakiye;
            if (curr.yil === yil - 1) acc[curr.detayKodu].onceki = curr.bakiye;
            return acc;
        }, {});

    const accountList = Object.values(groupedAccounts).sort((a: any, b: any) => a.detayKodu.localeCompare(b.detayKodu));

    // Mapping for Detail Cards
    const getAssetCodes = (accDeprCode: string) => {
        const map: { [key: string]: string[] } = {
            "257.02": ["251"],
            "257.03": ["252"],
            "257.04": ["253"],
            "257.05": ["254"],
            "257.06": ["255"],
            "257.07": ["256"],
            "268.01": ["260"],
            "268.02": ["261"],
            "268.03": ["262"],
            "268.04": ["263"],
            "268.05": ["264"],
            "268.06": ["265"],
            "268.07": ["267"],
            "268.08": ["266"],
        };
        return map[accDeprCode] || [];
    };

    const HEADER_BG = theme.palette.primary.main;
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const TEXT_COLOR = theme.palette.mode === 'dark' ? "#FFFFFF" : "#000000";
    const BORDER_COLOR = theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0';

    // Common Header Style
    const headerStyle = {
        backgroundColor: HEADER_BG,
        "& th": {
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            verticalAlign: "middle",
            borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
        },
        "& th:last-child": {
            borderRight: "none",
        }
    };

    // Zebra Striping Style
    const rowStyle = {
        backgroundColor: BG_PAPER,
        "&:nth-of-type(even)": {
            backgroundColor: ZEBRA_ROW,
        },
        "&:hover": {
            backgroundColor: theme.palette.action.hover,
        },
    };

    return (
        <div className={isReport ? "space-y-4" : "p-4 space-y-8"}>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Amortisman Kontrolleri
            </Typography>
            {/* Table 1: Hesap Bakiyeleri */}
            <Card sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}`, backgroundColor: BG_PAPER }}>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                        <Table size="small">
                            <TableHead sx={headerStyle}>
                                <TableRow>
                                    <TableCell>Hesap No</TableCell>
                                    <TableCell>Hesap Açıklaması</TableCell>
                                    <TableCell>Açılış Bakiyesi</TableCell>
                                    <TableCell>Girişler</TableCell>
                                    <TableCell>Çıkışlar</TableCell>
                                    <TableCell>Kapanış Bakiyesi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accountList.map((row: any) => {
                                    const diff = row.cari - row.onceki;
                                    const giris = diff > 0 ? diff : 0; // Increase (Credit for 257)
                                    const cikis = diff < 0 ? Math.abs(diff) : 0; // Decrease (Debit for 257)

                                    return (
                                        <TableRow key={row.detayKodu} sx={rowStyle}>
                                            <TableCell align="center" sx={{ color: TEXT_COLOR }}>{row.detayKodu}</TableCell>
                                            <TableCell sx={{ color: TEXT_COLOR }}>{row.hesapAdi}</TableCell>
                                            <TableCell align="right" sx={{ color: TEXT_COLOR }}>{row.onceki.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right" sx={{ color: TEXT_COLOR }}>{giris.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right" sx={{ color: TEXT_COLOR }}>{cikis.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right" sx={{ color: TEXT_COLOR }}>{row.cari.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Table 2: Amortisman Kontrolleri */}
            <Card sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}`, backgroundColor: BG_PAPER }}>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                        <Table size="small">
                            <TableHead sx={headerStyle}>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Hesap No</TableCell>
                                    <TableCell>Hesap Açıklaması</TableCell>
                                    <TableCell>Önceki Dönem<br />Amort. Gideri</TableCell>
                                    <TableCell>Cari Dönem<br />Amort. Gideri</TableCell>
                                    <TableCell>Cari Dönem Tahmini<br />Amort. Gideri</TableCell>
                                    <TableCell>Fark</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {accountList.map((row: any, index: number) => {
                                    const kontrolKayit = data.amortismanKontrolKayitlari.find((k) => k.hesapNo === row.detayKodu);

                                    const oncekiDonem = row.onceki;
                                    const cariDonem = row.cari;
                                    const cariDonemGider = cariDonem - oncekiDonem; // Net Change
                                    const tahmini = kontrolKayit?.cariDonemTahminiAmortismanGideri || 0;
                                    const fark = cariDonemGider - tahmini;

                                    return (
                                        <TableRow key={row.detayKodu} sx={rowStyle}>
                                            <TableCell align="center" sx={{ color: TEXT_COLOR }}>{index + 1}</TableCell>
                                            <TableCell align="center" sx={{ color: TEXT_COLOR }}>{row.detayKodu}</TableCell>
                                            <TableCell sx={{ color: TEXT_COLOR }}>{row.hesapAdi}</TableCell>
                                            <TableCell align="right" sx={{ color: TEXT_COLOR }}>{oncekiDonem.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right" sx={{ color: TEXT_COLOR }}>{cariDonemGider.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell align="right">
                                                {isReport ? (
                                                    <span>{tahmini.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        inputMode="decimal"
                                                        defaultValue={tahmini}
                                                        onBlur={(e) => handleSaveSatir(row.detayKodu, e.target.value, kontrolKayit?.id || 0)}
                                                        className="w-full p-1 text-right border rounded bg-white focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                {fark.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Table 3: Hesap Detayları */}
            <div className="space-y-4">
                {accountList.map((row: any) => {
                    if (row.detayKodu === "257.00") return null;

                    const assetCodes = getAssetCodes(row.detayKodu);
                    const details = data.amortismanHesaplamaKayitlari.filter((h: any) =>
                        assetCodes.some(code => h.detayHesapKodu?.startsWith(code))
                    );

                    const girisToplami = details.reduce((sum: number, item: any) => sum + (item.girisTutari || 0), 0);
                    const bobiTfrsToplami = details.reduce((sum: number, item: any) => sum + (item.bobiTfrsCariYilAmortisman || 0), 0);
                    const faydaliOmurAvg = details.length > 0
                        ? Math.round(details.reduce((sum: number, item: any) => sum + (item.bobiTfrsFaydaliOmur || 0), 0) / details.length)
                        : 0;

                    const cariDonemGider = row.cari - row.onceki;

                    return (
                        <Card key={row.detayKodu} className="bg-gray-50 border">
                            <CardContent>
                                <div className="p-2 rounded mb-2 font-bold text-white" style={{ backgroundColor: "#4B49AC", textAlign: "center" }}>
                                    {row.detayKodu} {row.hesapAdi}
                                </div>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Cari Dönemde Amortismana Tabi {row.hesapAdi} Tutarı</TableCell>
                                            <TableCell align="right" className="font-bold">{girisToplami.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Ortalama Kullanım Ömrü (YIL)</TableCell>
                                            <TableCell align="right" className="font-bold">{faydaliOmurAvg}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Cari Dönemde Beklenen Amortisman Tutarı</TableCell>
                                            <TableCell align="right" className="font-bold">{cariDonemGider.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Cari Dönemde Hesaplanan Amortisman Tutarı</TableCell>
                                            <TableCell align="right" className="font-bold">{bobiTfrsToplami.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                        <TableRow className="bg-gray-100">
                                            <TableCell className="font-bold">TOPLAM</TableCell>
                                            <TableCell align="right" className="font-bold text-lg">{row.cari.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default AmortismanKontrolleri;

