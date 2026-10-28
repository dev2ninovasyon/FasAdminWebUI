"use client";

import React, { useEffect, useState } from "react";
import "@/lib/handsontableSetup";

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
    CircularProgress,
    useTheme,
} from "@mui/material";
import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getDavaKarsiliklariData,
    updateDavaKarsiliklari,
    varsayilanaDonDavaKarsiliklari,
    DavaKarsiliklariSatir,
    DavaKarsiliklariSummary
} from "@/api/CalismaKagitlari/DavaKarsiliklariCalismasi";
import { enqueueSnackbar } from "notistack";


registerAllModules();

const fmt = (n: any) =>
    Number(n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
    dipnotNo: string;
    isClickedVarsayilanaDon?: boolean;
    setIsClickedVarsayilanaDon?: (val: boolean) => void;
    isReport?: boolean;
}

const DavaKarsiliklariCalismasi = ({ dipnotNo, isClickedVarsayilanaDon, setIsClickedVarsayilanaDon, isReport }: Props) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);

    const [data, setData] = useState<DavaKarsiliklariSatir[]>([]);
    const [summary, setSummary] = useState<DavaKarsiliklariSummary | null>(null);
    const [loading, setLoading] = useState(false);

    const HEADER_BG = theme.palette.primary.main;
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const TEXT_COLOR = theme.palette.mode === 'dark' ? "#FFFFFF" : "#000000";
    const BORDER_COLOR = theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0';

    const fetchData = async () => {
        if (!user.token) return;
        setLoading(true);
        try {
            const result = await getDavaKarsiliklariData(user.denetciId || 0, user.yil || 0, user.denetlenenId || 0);
            setData(result.liste || []);
            setSummary(result.ozet || null);
        } catch (error) {
            enqueueSnackbar("Veriler yÃƒÂ¼klenirken hata oluÃ…Å¸tu!", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user.denetlenenId, user.yil, user.token, user.denetciId]);

    useEffect(() => {
        if (isClickedVarsayilanaDon && setIsClickedVarsayilanaDon) {
            const handleVarsayilanaDon = async () => {
                try {
                    setLoading(true);
                    await varsayilanaDonDavaKarsiliklari(user.denetciId || 0, user.yil || 0, user.denetlenenId || 0);
                    enqueueSnackbar("Veriler baÃ…Å¸arÃ„Â±yla getirildi.", { variant: "success" });
                    await fetchData();
                } catch (error) {
                    enqueueSnackbar("Ã„Â°Ã…Å¸lem sÃ„Â±rasÃ„Â±nda bir hata oluÃ…Å¸tu!", { variant: "error" });
                } finally {
                    setIsClickedVarsayilanaDon(false);
                    setLoading(false);
                }
            };
            handleVarsayilanaDon();
        }
    }, [isClickedVarsayilanaDon]);

    const handleAfterChange = async (changes: any, source: string) => {
        if (!changes || !user.token || source === "loadData") return;

        let hasChange = false;
        const updatedData = [...data];

        for (const [row, prop, oldValue, newValue] of changes) {
            if (oldValue === newValue) continue;

            // Ensure the row exists in updatedData (for new rows)
            if (!updatedData[row]) {
                updatedData[row] = {
                    id: 0,
                    denetciId: user.denetciId || 0,
                    denetlenenId: user.denetlenenId || 0,
                    yil: user.yil || 0,
                    aleyhteDavacininLehteDavalininUnvani: "",
                    aleyhteLehte: "",
                    davaKonusu: "",
                    davaYili: user.yil || 0,
                    mahkemeAsamasi: "",
                    varsaYerelMahkemeKarari: "",
                    durusmaAsamasi: "",
                    muhtemelDeger: 0,
                    aleyhteKaybetmeLehteKazanmaIhtimali: "",
                    ongorulenSonuclanmaSuresi: "",
                    denetcininVardigiSonuc: "",
                    sonucunTutari: 0
                };
            }

            updatedData[row] = { ...updatedData[row], [prop]: newValue };
            hasChange = true;
        }

        if (hasChange) {
            try {
                // Filter out empty rows before sending
                const filteredData = updatedData.filter(row => row && row.aleyhteDavacininLehteDavalininUnvani);
                await updateDavaKarsiliklari(filteredData);
                setData(updatedData);
                enqueueSnackbar("GÃƒÂ¼ncellendi", { variant: "success" });
                const refresh = await getDavaKarsiliklariData(user.denetciId || 0, user.yil || 0, user.denetlenenId || 0);
                setSummary(refresh.ozet);
            } catch (error) {
                enqueueSnackbar("Hata oluÃ…Å¸tu!", { variant: "error" });
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    if (isReport && !loading && data.length === 0) return null;

    return (
        <Box sx={{ width: "100%", p: 0 }}>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Dava KarÃ…Å¸Ã„Â±lÃ„Â±klarÃ„Â± Ãƒâ€¡alÃ„Â±Ã…Å¸masÃ„Â±
            </Typography>
            {/* Arka plansÃ„Â±z DÃƒÂ¼z Metin BaÃ…Å¸lÃ„Â±k */}
            <Typography variant="h5" fontWeight={700} mb={2} sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50" }}>
                Dava KarÃ…Å¸Ã„Â±lÃ„Â±klarÃ„Â± Ãƒâ€“zeti
            </Typography>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}`, mb: 5 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: HEADER_BG }}>
                            <TableCell sx={{ borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`, width: "120px" }}></TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "white", borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}` }}>Hesaplanan Toplam AyrÃ„Â±lacak Dava KarÃ…Å¸Ã„Â±lÃ„Â±klarÃ„Â±</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "white", borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}` }}>Hesaplanan Toplam KoÃ…Å¸ullu Dava BorÃƒÂ§larÃ„Â±</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "white", borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}` }}>Hesaplanan Toplam KoÃ…Å¸ullu Dava AlacaklarÃ„Â±</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: "white" }}>Uzman GÃƒÂ¶rÃƒÂ¼Ã…Å¸ÃƒÂ¼ Gerektirenler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow sx={{ backgroundColor: BG_PAPER }}>
                            <TableCell sx={{ fontWeight: 700, backgroundColor: HEADER_BG, color: "white", textAlign: 'center', borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}` }}>SayÃ„Â±sÃ„Â±</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: TEXT_COLOR, borderRight: `1px solid ${BORDER_COLOR}` }}>{summary?.hesaplananToplamAyrilacakDavaKarsiliklariSayisi || 0}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: TEXT_COLOR, borderRight: `1px solid ${BORDER_COLOR}` }}>{summary?.hesaplananToplamKosulluDavaBorclariSayisi || 0}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: TEXT_COLOR, borderRight: `1px solid ${BORDER_COLOR}` }}>{summary?.hesaplananToplamKosulluDavaAlacaklariSayisi || 0}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: TEXT_COLOR }}>{summary?.uzmanGorusuGerektirenlerSayisi || 0}</TableCell>
                        </TableRow>
                        <TableRow sx={{ backgroundColor: ZEBRA_ROW }}>
                            <TableCell sx={{ fontWeight: 700, backgroundColor: HEADER_BG, color: "white", textAlign: 'center', borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}` }}>TutarÃ„Â±</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: TEXT_COLOR, borderRight: `1px solid ${BORDER_COLOR}` }}>{fmt(summary?.hesaplananToplamAyrilacakDavaKarsiliklariTutari)}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: TEXT_COLOR, borderRight: `1px solid ${BORDER_COLOR}` }}>{fmt(summary?.hesaplananToplamKosulluDavaBorclariTutari)}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: TEXT_COLOR, borderRight: `1px solid ${BORDER_COLOR}` }}>{fmt(summary?.hesaplananToplamKosulluDavaAlacaklariTutari)}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: TEXT_COLOR }}>{fmt(summary?.uzmanGorusuGerektirenlerTutari)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Arka plansÃ„Â±z DÃƒÂ¼z Metin BaÃ…Å¸lÃ„Â±k */}
            <Typography variant="h5" fontWeight={700} mb={2} sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50" }}>
                Dava DetayÃ„Â± Listesi
            </Typography>

            <Box sx={{
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: "0px",
                backgroundColor: BG_PAPER,
                overflow: "hidden",
                "& .handsontable th": {
                    backgroundColor: `${HEADER_BG} !important`,
                    color: `white !important`,
                    fontWeight: "bold",
                    padding: "8px 4px !important",
                    fontSize: "13px",
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'} !important`,
                    whiteSpace: "normal",
                    lineHeight: "1.2 !important",
                    verticalAlign: "middle !important",
                    height: "45px !important"
                },
                "& .handsontable td": {
                    backgroundColor: BG_PAPER,
                    color: TEXT_COLOR,
                    border: `1px solid ${BORDER_COLOR} !important`,
                },
                "& .handsontable tr:nth-of-type(even) td": {
                    backgroundColor: ZEBRA_ROW,
                }
            }}>
                <CustomHotTable 
                    data={data}
                    afterChange={handleAfterChange}
                    autoColumnSize={true}
                    manualColumnResize={true}
                    colHeaders={[
                        "SN",
                        "Aleyhte DavacÃ„Â±nÃ„Â±n / Lehte DavalÃ„Â±nÃ„Â±n UnvanÃ„Â±",
                        "Aleyhte / Lehte",
                        "Dava Konusu",
                        "Dava YÃ„Â±lÃ„Â±",
                        "Mahkeme AÃ…Å¸amasÃ„Â±",
                        "Varsa, Yerel Mahkeme KararÃ„Â±",
                        "DuruÃ…Å¸ma AÃ…Å¸amasÃ„Â±",
                        "Muhtemel DeÃ„Å¸eri"
                    ]}
                    columns={[
                        { data: "id", readOnly: true, width: 40 },
                        { data: "aleyhteDavacininLehteDavalininUnvani", width: 220 },
                        { data: "aleyhteLehte", type: "dropdown", source: ["Aleyhte", "Lehte"], width: 100 },
                        { data: "davaKonusu", width: 150 },
                        { data: "davaYili", type: "numeric", width: 80 },
                        { data: "mahkemeAsamasi", width: 150 },
                        { data: "varsaYerelMahkemeKarari", width: 200 },
                        { data: "durusmaAsamasi", width: 150 },
                        { data: "muhtemelDeger", type: "numeric", numericFormat: { pattern: "0,0.00" }, width: 120 }
                    ]}
                    stretchH="all"
                    height="auto"
                    minRows={10}
                    contextMenu={isReport ? false : true}
                    dropdownMenu={!isReport}
                    filters={!isReport}
                    columnSorting={!isReport}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    fixedColumnsLeft={1}
                />

                {data.length === 0 && (
                    <Box sx={{
                        p: 1.5,
                        textAlign: 'center',
                        backgroundColor: theme.palette.action.hover,
                        borderTop: `1px solid ${theme.palette.divider}`
                    }}>
                        <Typography variant="body2" color="textSecondary">
                            GÃƒÂ¶rÃƒÂ¼ntÃƒÂ¼lenecek veri bulunmamaktadÃ„Â±r. SaÃ„Å¸ tÃ„Â±klayarak satÃ„Â±r ekleyebilirsiniz.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default DavaKarsiliklariCalismasi;


