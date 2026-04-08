"use client";

import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import "@/lib/handsontableSetup";

import React, { useEffect, useState } from "react";
import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { Box, useTheme, Typography, CircularProgress } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getFaturaTestleri, faturaTestiGuncelle, FaturaTestleriSatir } from "@/api/CalismaKagitlari/FaturaTestleri";
import { enqueueSnackbar } from "notistack";
import moment from "moment";

registerAllModules();

const FaturaTestleriTablo = ({ dipnotNo, isReport }: { dipnotNo: string, isReport?: boolean }) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const [data, setData] = useState<FaturaTestleriSatir[]>([]);
    const [loading, setLoading] = useState(false);

    const TITLE_TEXT_COLOR = "#FFFFFF";

    const [resolvedDipnotNo, setResolvedDipnotNo] = useState(dipnotNo);

    useEffect(() => {
        setResolvedDipnotNo(dipnotNo);
    }, [dipnotNo]);

    useEffect(() => {
        const resolveDipnot = async () => {
            if (!dipnotNo) {
                // Fatura Testleri usually doesn't have a specific model name passed, but let's try if needed or skip
            }
        };
        resolveDipnot();
    }, [dipnotNo]);

    const fetchData = async () => {
        if (!resolvedDipnotNo) return;
        setLoading(true);
        try {
            const res = await getFaturaTestleri(user.denetciId || 0, user.denetlenenId || 0, user.yil || 0, resolvedDipnotNo);
            if (Array.isArray(res)) {
                setData(res.map((item: any) => ({
                    ...item,
                    yevmiyeTarihi: item.yevmiyeTarihi ? moment(item.yevmiyeTarihi).format("DD-MM-YYYY") : "",
                    faturaTarihi: item.faturaTarihi ? moment(item.faturaTarihi).format("DD-MM-YYYY") : ""
                })));
            }
        } catch (error) {
            enqueueSnackbar("Veriler yÃƒÂ¼klenirken hata oluÃ…Å¸tu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetlenenId, user.yil, resolvedDipnotNo]);

    const handleAfterChange = async (changes: any) => {
        if (!changes) return;
        for (const [row, prop, oldValue, newValue] of changes) {
            if (oldValue === newValue) continue;
            const updatedRow = { ...data[row], [prop]: newValue };
            try {
                await faturaTestiGuncelle(updatedRow);
                enqueueSnackbar("GÃƒÂ¼ncellendi", { variant: "success" });
            } catch (error) {
                enqueueSnackbar("GÃƒÂ¼ncelleme hatasÃ„Â±", { variant: "error" });
            }
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    if (isReport && !loading && data.length === 0) return null;

    return (
        <Box sx={{ width: "100%", p: isReport ? 0 : 0 }}>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Fatura Testleri
            </Typography>

            <Box
                sx={{
                    width: "100%",
                    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'}`,
                    borderRadius: "0px",
                    overflow: "hidden",
                    "& .handsontable": {
                        fontFamily: "inherit",
                    },
                    "& .handsontable th": {
                        backgroundColor: `${theme.palette.primary.main} !important`,
                        color: `white !important`,
                        fontWeight: "bold",
                        fontSize: "13px",
                        whiteSpace: "normal",
                        lineHeight: "1.2 !important",
                        padding: "8px 4px !important",
                        verticalAlign: "middle !important",
                        height: "45px !important",
                        zIndex: 100,
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'} !important`,
                    },
                    "& .handsontable td": {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        fontSize: "13px",
                        verticalAlign: "middle",
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'} !important`,
                    },
                    "& .handsontable tr:nth-of-type(even) td": {
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB",
                    },
                    "& ::-webkit-scrollbar": { width: "8px", height: "8px" },
                    "& ::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: "4px" }
                }}
            >
                <CustomHotTable 
                    data={data.length > 0 ? data : [{}, {}, {}]}
                    afterChange={handleAfterChange}
                    colHeaders={[
                        "Yevmiye Tarihi", "Yevmiye No", "Fatura No", "Fatura Tarih",
                        "Hesap Kodu", "Hesap Adi", "AÃƒÂ§Ã„Â±klama", "Para Birimi",
                        "BorÃƒÂ§", "Alacak", "BorÃƒÂ§ Tespit", "Alacak Tespit",
                        "Tespit Fark", "Tespit AÃƒÂ§Ã„Â±klama"
                    ]}
                    columns={[
                        { data: "yevmiyeTarihi", type: "date", dateFormat: "DD-MM-YYYY", readOnly: true, width: 100 },
                        { data: "yevmiyeNo", readOnly: true, width: 100 },
                        { data: "faturaNo", width: 100 },
                        { data: "faturaTarihi", type: "date", dateFormat: "DD-MM-YYYY", width: 100 },
                        { data: "hesapKodu", readOnly: true, width: 100 },
                        { data: "hesapAdi", readOnly: true, width: 180 },
                        { data: "aciklama", width: 220 },
                        { data: "paraBirimi", readOnly: true, width: 80 },
                        { data: "borc", type: "numeric", numericFormat: { pattern: "0,0.00" }, readOnly: true, width: 100 },
                        { data: "alacak", type: "numeric", numericFormat: { pattern: "0,0.00" }, readOnly: true, width: 100 },
                        { data: "borcTespit", type: "numeric", numericFormat: { pattern: "0,0.00" }, width: 100 },
                        { data: "alacakTespit", type: "numeric", numericFormat: { pattern: "0,0.00" }, width: 100 },
                        { data: "tespitFark", type: "numeric", numericFormat: { pattern: "0,0.00" }, readOnly: true, width: 100 },
                        { data: "tespitAciklama", width: 200 }
                    ]}
                    rowHeaders={true}
                    width="100%"
                    height="auto"
                    stretchH="none"
                    autoColumnSize={true}
                    manualColumnResize={!isReport}
                    filters={!isReport}
                    columnSorting={!isReport}
                    dropdownMenu={!isReport}
                    language={dictionary.languageCode}
                    licenseKey="non-commercial-and-evaluation"
                    fixedColumnsLeft={2}
                    fixedRowsTop={0}
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    readOnly={isReport}
                    contextMenu={isReport ? false : true}
                />

                {data.length === 0 && (
                    <Box sx={{
                        p: 1.5,
                        textAlign: 'center',
                        backgroundColor: theme.palette.action.hover,
                        borderTop: `1px solid ${theme.palette.divider}`
                    }}>
                        <Typography variant="body2" color="textSecondary">
                            GÃƒÂ¶rÃƒÂ¼ntÃƒÂ¼lenecek veri bulunmamaktadÃ„Â±r.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default FaturaTestleriTablo;


