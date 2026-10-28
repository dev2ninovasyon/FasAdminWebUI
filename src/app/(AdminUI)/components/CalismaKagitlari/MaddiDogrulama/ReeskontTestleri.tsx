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
    Grid,
    useTheme,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getReeskontTestleri, ReeskontTestleriData } from "@/api/CalismaKagitlari/ReeskontTestleri";

interface Props {
    dipnotNo: string;
    modelAdi: string;
    isReport?: boolean;
}

const ReeskontTestleri: React.FC<Props> = ({ dipnotNo, modelAdi, isReport }) => {
    const theme = useTheme();
    const [data, setData] = useState<ReeskontTestleriData | null>(null);
    const [loading, setLoading] = useState(true);

    const user = useSelector((state: AppState) => state.userReducer);

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
        const fetchData = async () => {
            if (user.token && user.denetciId !== undefined && user.yil !== undefined && user.denetlenenId !== undefined && resolvedDipnotNo) {
                try {
                    const result = await getReeskontTestleri(
                        "ReeskontTestleri",
                        user.denetciId,
                        user.yil,
                        user.denetlenenId,
                        resolvedDipnotNo,
                        modelAdi
                    );
                    if (result) {
                        setData(result);
                    }
                } catch (error) {
                    console.error("Hata:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                if (resolvedDipnotNo === "") setLoading(false);
            }
        };
        fetchData();
    }, [user, resolvedDipnotNo, modelAdi]);

    const fmt = (n: any) =>
        Number(n ?? 0).toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const currencies = ["TL", "USD", "EUR", "GBP"];

    const mergedRows = currencies.map((curr) => {
        const readyRow = (data?.degerlerKayitlari || []).find(
            (item) => (item.paraBirimi || "").trim().toUpperCase() === curr
        );

        return {
            paraBirimi: curr,
            alinanNominal: Number(readyRow?.alinanNominalDeger || 0),
            alinanIcIskonto: Number(readyRow?.alinanIcIskonto || 0),
            alinanNetBugunku: Number(readyRow?.alinanNetBugunkuDeger || 0),
            verilenNominal: Number(readyRow?.verilenNominalDeger || 0),
            verilenIcIskonto: Number(readyRow?.verilenIcIskonto || 0),
            verilenNetBugunku: Number(readyRow?.verilenNetBugunkuDeger || 0),
        };
    });

    const totalRow = {
        paraBirimi: "Toplam",
        alinanNominal: mergedRows.reduce((s, r) => s + r.alinanNominal, 0),
        verilenNominal: mergedRows.reduce((s, r) => s + r.verilenNominal, 0),
        alinanIcIskonto: mergedRows.reduce((s, r) => s + r.alinanIcIskonto, 0),
        verilenIcIskonto: mergedRows.reduce((s, r) => s + r.verilenIcIskonto, 0),
        alinanNetBugunku: mergedRows.reduce((s, r) => s + r.alinanNetBugunku, 0),
        verilenNetBugunku: mergedRows.reduce((s, r) => s + r.verilenNetBugunku, 0),
    };

    const HEADER_BG = theme.palette.primary.main;
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const TEXT_COLOR = theme.palette.mode === 'dark' ? "#FFFFFF" : "#000000";
    const BORDER_COLOR = theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0';

    const tableHeaderStyle = {
        backgroundColor: HEADER_BG,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        border: `1px solid ${BORDER_COLOR}`,
        verticalAlign: "middle"
    };

    const tableCellStyle = {
        textAlign: "right",
        border: `1px solid ${BORDER_COLOR}`,
        color: TEXT_COLOR
    };

    const firstColStyle = {
        textAlign: "left",
        fontWeight: "bold",
        border: `1px solid ${BORDER_COLOR}`,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : "#f9f9f9",
        color: TEXT_COLOR
    };

    const hasData = data && (
        (data.degerlerKayitlari && data.degerlerKayitlari.length > 0) ||
        (data.farklarKayitlari && data.farklarKayitlari.length > 0)
    );

    if (isReport && !loading && !hasData) {
        return null;
    }

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Reeskont Testleri
            </Typography>

            {loading && <Typography sx={{ mb: 2 }}>Veriler yükleniyor...</Typography>}

            <Grid container spacing={3}>
                <Grid size={12}>
                    <Typography variant="h6" align="center" sx={{ mb: 1, fontWeight: "bold", color: TEXT_COLOR }}>
                        Reeskont Hesaplama
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}` }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell rowSpan={2} sx={tableHeaderStyle}>Para Birimi</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>Nominal Değer</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>İç İskonto Reeskont Tutarı</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>Net Bugünkü Değer Reeskont Tutarı</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={tableHeaderStyle}>Alınan</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Verilen</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Alınan</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Verilen</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Alınan</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Verilen</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {mergedRows.map((row, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                        <TableCell sx={firstColStyle}>{row.paraBirimi}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.alinanNominal)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.verilenNominal)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.alinanIcIskonto)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.verilenIcIskonto)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.alinanNetBugunku)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.verilenNetBugunku)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow sx={{ backgroundColor: BG_PAPER, borderTop: `2px solid ${HEADER_BG}` }}>
                                    <TableCell sx={firstColStyle}>{totalRow.paraBirimi}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.alinanNominal)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.verilenNominal)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.alinanIcIskonto)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.verilenIcIskonto)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.alinanNetBugunku)}</TableCell>
                                    <TableCell sx={{ ...tableCellStyle, fontWeight: "bold" }}>{fmt(totalRow.verilenNetBugunku)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid size={12}>
                    <Typography variant="h6" align="center" sx={{ mb: 1, mt: 2, fontWeight: "bold", color: TEXT_COLOR }}>
                        Reeskont Düzeltme Farkları
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}` }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell rowSpan={2} sx={tableHeaderStyle}>Düzeltme Farkları</TableCell>
                                    <TableCell rowSpan={2} sx={tableHeaderStyle}>Ayrılan Reeskont (VUK)</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>BOBİ Hesaplanan</TableCell>
                                    <TableCell colSpan={2} sx={tableHeaderStyle}>BOBİ Fark</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={tableHeaderStyle}>İç iskonto</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Net Bugünkü değer</TableCell>
                                    <TableCell sx={tableHeaderStyle}>İç iskonto</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Net Bugünkü değer</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(data?.farklarKayitlari || []).map((row, index) => {
                                    const isTotal = row.duzeltmeFarklari === "Toplam";
                                    return (
                                        <TableRow key={index} sx={{ backgroundColor: isTotal ? BG_PAPER : (index % 2 === 0 ? BG_PAPER : ZEBRA_ROW), borderTop: isTotal ? `2px solid ${HEADER_BG}` : 'none' }}>
                                            <TableCell sx={{
                                                ...tableCellStyle,
                                                textAlign: "left",
                                                fontWeight: "bold",
                                                backgroundColor: isTotal ? "transparent" : (theme.palette.mode === 'dark' ? theme.palette.grey[800] : "#f9f9f9")
                                            }}>
                                                {row.duzeltmeFarklari}
                                            </TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.ayrilanVuk)}</TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.hesaplananIcIskonto)}</TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.hesaplananNetBugunkuDeger)}</TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.farkIcIskonto)}</TableCell>
                                            <TableCell sx={{ ...tableCellStyle, fontWeight: isTotal ? "bold" : "normal" }}>{fmt(row.farkNetBugunkuDeger)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                {(!data || data.farklarKayitlari?.length === 0) && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={tableCellStyle}>Kayıt bulunamadı.</TableCell>
                                    </TableRow>
                                )}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid size={12}>
                    <Typography variant="h6" align="center" sx={{ mb: 1, mt: 2, fontWeight: "bold", color: TEXT_COLOR }}>
                        Reeskont Hesaplamada Kullanılan Değerler
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}` }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeaderStyle}>Vadeye Kalan Gün</TableCell>
                                    <TableCell sx={tableHeaderStyle}>USD LIBOR</TableCell>
                                    <TableCell sx={tableHeaderStyle}>USD Kur</TableCell>
                                    <TableCell sx={tableHeaderStyle}>EURO LIBOR</TableCell>
                                    <TableCell sx={tableHeaderStyle}>EURO Kur</TableCell>
                                    <TableCell sx={tableHeaderStyle}>GBP LIBOR</TableCell>
                                    <TableCell sx={tableHeaderStyle}>GBP Kur</TableCell>
                                    <TableCell sx={tableHeaderStyle}>TL REESKONT ORANI</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(data?.referansTablosuListesi || []).map((row, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                        <TableCell sx={{ ...tableCellStyle, fontWeight: "bold", textAlign: "center" }}>{row.vadeyeKalanGun}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.usdLibor)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.usdKur)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.eurLibor)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.eurKur)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.gbpLibor)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.gbpdKur)}</TableCell>
                                        <TableCell sx={tableCellStyle}>{fmt(row.tcmb)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReeskontTestleri;

