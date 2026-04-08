"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { Box, Typography, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    fetchKrediCalismasi,
    KrediHesaplamaData,
} from "@/api/CalismaKagitlari/KrediCalismasi";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const KrediCalismasi: React.FC<Props> = ({ parentName, childName, dipnotNo, isReport }) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading: setGlobalLoading } = useLoading();
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState<KrediHesaplamaData[]>([]);
    const [detailData, setDetailData] = useState<any[]>([]);

    const hotTableComponent = useRef<any>(null);
    const detailHotTableComponent = useRef<any>(null);

    const [resolvedDipnotNo, setResolvedDipnotNo] = useState(dipnotNo);

    useEffect(() => {
        setResolvedDipnotNo(dipnotNo);
    }, [dipnotNo]);

    useEffect(() => {
        const resolveDipnot = async () => {
            if (!dipnotNo && parentName) {
                setLoading(true);
                try {
                    const { getDipnotNoByDipnotAdi } = await import("@/api/MaddiDogrulama/MaddiDogrulama");
                    const dNo = await getDipnotNoByDipnotAdi(user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                        parentName,
                        user.denetimTuru === "Tfrs"
                    );
                    if (dNo) {
                        setResolvedDipnotNo(dNo);
                    } else {
                        setLoading(false);
                    }
                } catch (error) {
                    console.error("Dipnot no getirilemedi:", error);
                    setLoading(false);
                }
            }
        };
        resolveDipnot();
    }, [dipnotNo, parentName, user]);

    const fetchData = async () => {
        if (!resolvedDipnotNo || resolvedDipnotNo === "") return;

        setLoading(true);
        try {
            const response = await fetchKrediCalismasi(user.denetlenenId || 0,
                user.yil || 0,
                resolvedDipnotNo
            );

            if (response && response.success) {
                const incomingData: KrediHesaplamaData[] = response.data;
                setData(incomingData);

                const details: any[] = [];
                incomingData.forEach((item) => {
                    if (item.krediHesaplamaDetaylari?.length) {
                        item.krediHesaplamaDetaylari.forEach((detay: any) => {
                            details.push({
                                hesapKodu: item.detayHesapKodu,
                                hesapAdi: item.hesapAdi,
                                tarih: detay.taksitTarihi,
                                taksit: detay.taksitTutari,
                                faiz: detay.faizTutari,
                                fonVergi: detay.fonVergi,
                                anaPara: detay.anaPara,
                                gun: detay.gun || 0,
                                tutar:
                                    (detay.anaPara || 0) +
                                    (detay.faizTutari || 0) +
                                    (detay.fonVergi || 0),
                            });
                        });
                    }
                });
                setDetailData(details);
            } else {
                setData([]);
                setDetailData([]);
                if (response?.message)
                    enqueueSnackbar(response.message, { variant: "info" });
            }
        } catch (error) {
            console.log("Veri ÃƒÂ§ekme hatasÃ„Â±:", error);
            enqueueSnackbar("Veriler yÃƒÂ¼klenirken bir hata oluÃ…Å¸tu", {
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.denetlenenId, user.yil, resolvedDipnotNo]);

    if (isReport && !loading && data.length === 0 && detailData.length === 0) return null;

    // ---------------------------
    // ANA TABLO - COLUMNS
    // ---------------------------
    const columns = useMemo(() => {
        return [
            { data: "detayHesapKodu", readOnly: true, width: 80 },
            { data: "hesapAdi", readOnly: true, width: 205 },

            { data: "anaPara", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 89 },
            { data: "iskontolu", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 89 },
            { data: "iskontosuz", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 89 },

            { data: "faizFonVergi", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 158 },
            { data: "kalanFaizFonVergi", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 98 },
            { data: "kalanFaizFonVergiIskontolu", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 175 },

            { data: "faizOrani", type: "numeric", numericFormat: { pattern: "0.00%", culture: "tr-TR" }, readOnly: true, width: 66 },
            { data: "vade", readOnly: true, width: 50 },

            // Vadesel DaÃ„Å¸Ã„Â±lÃ„Â±m - Ã„Â°skontolu
            { data: "vadeselDagilim3AyIskontolu", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htCenter htMiddle", width: 72 },
            { data: "vadeselDagilim12AyIskontolu", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htCenter htMiddle", width: 82 },
            { data: "vadeselDagilim5YilIskontolu", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htCenter htMiddle", width: 89 },
            { data: "vadeselDagilim5YildanUzunIskontolu", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htCenter htMiddle", width: 89 },

            // Vadesel DaÃ„Å¸Ã„Â±lÃ„Â±m - Ã„Â°skontosuz
            { data: "vadeselDagilim3AyIskontosuz", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htCenter htMiddle", width: 72 },
            { data: "vadeselDagilim12AyIskontosuz", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htCenter htMiddle", width: 82 },
            { data: "vadeselDagilim5YilIskontosuz", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htCenter htMiddle", width: 89 },
            { data: "vadeselDagilim5YildanUzunIskontosuz", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htCenter htMiddle", width: 89 },
        ];
    }, []);


    // ANA TABLO - NESTED HEADERS
    const nestedHeaders = useMemo(() => {
        return [
            [
                { label: "Hesap Kodu", rowspan: 3, colspan: 1 },
                { label: "Hesap AdÃ„Â±", rowspan: 3, colspan: 1 },
                { label: "Ana Para", rowspan: 3, colspan: 1 },
                { label: "Ã„Â°skontolu", rowspan: 3, colspan: 1 },
                { label: "Ã„Â°skontosuz", rowspan: 3, colspan: 1 },
                { label: "Raporlama\nTarihine\nKadar\nÃ„Â°Ã…Å¸leyen\nFaiz+Fon+\nVergi", rowspan: 3, colspan: 1 },
                { label: "Kalan\nFaiz+Fon+\nVergi", rowspan: 3, colspan: 1 },
                { label: "Kalan\nFaiz+Fon+\nVerginin\nÃ„Â°skontolu\nTutarÃ„Â±", rowspan: 3, colspan: 1 },
                { label: "Faiz OranÃ„Â±", rowspan: 3, colspan: 1 },
                { label: "Vade", rowspan: 3, colspan: 1 },
                { label: "Vadesel DaÃ„Å¸Ã„Â±lÃ„Â±m", colspan: 8, rowspan: 1 },
            ],
            [
                "", "", "", "", "", "", "", "", "", "",
                { label: "Ã„Â°skontolu", colspan: 4, rowspan: 1 },
                { label: "Ã„Â°skontosuz", colspan: 4, rowspan: 1 },
            ],
            [
                "", "", "", "", "", "", "", "", "", "",
                "1-3 Ay", "4-12 Ay", "1-5 YÃ„Â±l", "5 YÃ„Â±ldan Uzun",
                "1-3 Ay", "4-12 Ay", "1-5 YÃ„Â±l", "5 YÃ„Â±ldan Uzun",
            ],
        ];
    }, []);

    // DETAY TABLO - COLUMNS
    const detailColumns = [
        { data: "hesapKodu", title: "Hesap Kodu", readOnly: true, className: "htCenter htMiddle", },
        { data: "hesapAdi", title: "Hesap AdÃ„Â±", readOnly: true, className: "htLeft htMiddle" },
        { data: "tarih", title: "Tarih", type: "date", dateFormat: "DD.MM.YYYY", readOnly: true, className: "htCenter htMiddle" },
        { data: "taksit", title: "Taksit", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htRight htMiddle" },
        { data: "faiz", title: "Faiz", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htRight htMiddle" },
        { data: "fonVergi", title: "Fon+Vergi", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htRight htMiddle" },
        { data: "anaPara", title: "Ana Para", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htRight htMiddle" },
        { data: "gun", title: "GÃƒÂ¼n", type: "numeric", readOnly: true, className: "htCenter htMiddle" },
        { data: "tutar", title: "Tutar", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, className: "htRight htMiddle" },
    ];

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Kredi Ãƒâ€¡alÃ„Â±Ã…Å¸masÃ„Â±
            </Typography>

            {/* ANA TABLO */}
            <Box
                sx={{
                    width: "100%",
                    overflowX: "auto",
                    minHeight: "400px",
                    borderRadius: "0px",
                    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'}`,
                    mb: 4,
                    backgroundColor: theme.palette.background.paper,
                    "& .handsontable th": {
                        backgroundColor: `${theme.palette.primary.main} !important`,
                        color: "white !important",
                        fontWeight: "bold !important",
                        textAlign: "center !important",
                        verticalAlign: "bottom !important",
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'} !important`,
                        whiteSpace: "pre-line !important",
                        lineHeight: "1.2 !important",
                        padding: "6px !important",
                    },
                    "& .handsontable td": {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'} !important`,
                        whiteSpace: "nowrap !important",
                        verticalAlign: "middle !important",
                        padding: "2px 4px !important",
                    },
                    "& .handsontable tr:nth-of-type(even) td": {
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB",
                    },
                    "& .handsontable td:nth-of-type(2)": {
                        whiteSpace: "normal !important",
                        wordBreak: "break-word !important"
                    },
                    "& .wtHider": {
                        maxWidth: "50px !important"
                    }
                }}
            >
                <CustomHotTable 
                    ref={hotTableComponent}
                    data={data}
                    columns={columns}
                    nestedHeaders={nestedHeaders}
                    colHeaders={false}
                    rowHeaders={false}
                    width="100%"
                    height={isReport ? "auto" : "400px"}
                    stretchH="none"
                    autoColumnSize={{ useHeaders: false }}
                    autoRowSize={true}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    readOnly={isReport}
                    contextMenu={isReport ? false : true}
                    dropdownMenu={!isReport}
                    manualColumnResize={!isReport}
                    filters={!isReport}
                    columnSorting={!isReport}
                />

                {data.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body1" color="textSecondary">
                            Kredi ÃƒÂ¶zeti verisi bulunmamaktadÃ„Â±r.
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* DETAY TABLO */}


            <Box
                sx={{
                    width: "100%",
                    overflowX: "auto",
                    minHeight: "400px",
                    borderRadius: "0px",
                    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'}`,
                    backgroundColor: theme.palette.background.paper,
                    "& .handsontable th": {
                        backgroundColor: `${theme.palette.primary.main} !important`,
                        color: "white !important",
                        fontWeight: "bold !important",
                        textAlign: "center !important",
                        verticalAlign: "middle !important",
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'} !important`,
                        whiteSpace: "pre-line !important",
                        lineHeight: "1.2 !important",
                        padding: "10px !important",
                    },
                    "& .handsontable td": {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'} !important`,
                        whiteSpace: "nowrap !important",
                        verticalAlign: "middle !important",
                    },
                    "& .handsontable tr:nth-of-type(even) td": {
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB",
                    }
                }}
            >
                <CustomHotTable 
                    ref={detailHotTableComponent}
                    data={detailData}
                    columns={detailColumns}
                    colHeaders={true}
                    rowHeaders={false}
                    width="100%"
                    height={isReport ? "auto" : "400px"}
                    autoColumnSize={{ useHeaders: true }}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    stretchH="all"
                    readOnly={isReport}
                    contextMenu={isReport ? false : true}
                    dropdownMenu={!isReport}
                    manualColumnResize={!isReport}
                    filters={!isReport}
                    columnSorting={!isReport}
                />

                {detailData.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body1" color="textSecondary">
                            Ãƒâ€“deme planÃ„Â± detay verisi bulunmamaktadÃ„Â±r.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default KrediCalismasi;


