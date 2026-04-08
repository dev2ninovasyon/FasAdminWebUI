"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { Box, Typography, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    fetchVarlikVeAmortismanOzetTablo,
    VarlikVeAmortismanOzetTabloData,
} from "@/api/CalismaKagitlari/VarlikVeAmortismanOzetTablo";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const VarlikVeAmortismanOzetTablo: React.FC<Props> = ({ parentName, childName, dipnotNo, isReport }) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading: setGlobalLoading } = useLoading();
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState<any[]>([]);

    const hotTableComponent = useRef<any>(null);

    const [resolvedDipnotNo, setResolvedDipnotNo] = useState(dipnotNo);

    useEffect(() => {
        setResolvedDipnotNo(dipnotNo);
    }, [dipnotNo]);

    useEffect(() => {
        const resolveDipnot = async () => {
            if (!dipnotNo && parentName) {
                try {
                    const { getDipnotNoByDipnotAdi } = await import("@/api/MaddiDogrulama/MaddiDogrulama");
                    const dNo = await getDipnotNoByDipnotAdi(user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                        parentName,
                        user.denetimTuru === "Tfrs"
                    );
                    if (dNo) setResolvedDipnotNo(dNo);
                } catch (error) {
                    console.error("Dipnot no getirilemedi:", error);
                }
            }
        };
        resolveDipnot();
    }, [dipnotNo, parentName, user]);

    const fetchData = async () => {
        if (!resolvedDipnotNo || resolvedDipnotNo === "") {
            console.warn("DipnotNo boÃ…Å¸, veri ÃƒÂ§ekilemiyor");
            return;
        }

        console.log("Veri ÃƒÂ§ekiliyor - dipnotNo:", resolvedDipnotNo, "denetlenenId:", user.denetlenenId, "yil:", user.yil);
        setLoading(true);
        try {
            const response = await fetchVarlikVeAmortismanOzetTablo(user.denetlenenId || 0,
                user.yil || 0,
                resolvedDipnotNo
            );

            console.log("API YanÃ„Â±tÃ„Â± alÃ„Â±ndÃ„Â±:", response);

            if (response && response.success) {
                if (Array.isArray(response.data)) {
                    const incomingData: VarlikVeAmortismanOzetTabloData[] = response.data;
                    const formattedData = incomingData.map((item, index) => ({
                        sira: index + 1,
                        ...item,
                        amortismanBaslangicTarihi: item.amortismanBaslangicTarihi ? new Date(item.amortismanBaslangicTarihi).toLocaleDateString("tr-TR") : "",
                        amortismanBitisTarihi: item.amortismanBitisTarihi ? new Date(item.amortismanBitisTarihi).toLocaleDateString("tr-TR") : "",
                    }));
                    console.log("FormatlanmÃ„Â±Ã…Å¸ veri:", formattedData);
                    setData(formattedData);
                } else {
                    console.log("API yanÃ„Â±tÃ„Â± beklenmeyen formatta:", response.data);
                    setData([]);
                    enqueueSnackbar("Veri formatÃ„Â± hatalÃ„Â±", { variant: "error" });
                }
            } else {
                console.warn("API baÃ…Å¸arÃ„Â±sÃ„Â±z yanÃ„Â±t dÃƒÂ¶ndÃƒÂ¼:", response);
                setData([]);
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

    if (isReport && !loading && data.length === 0) return null;

    const columns = useMemo(() => {
        return [
            { data: "sira", readOnly: true, width: 50, className: "htCenter htMiddle" },
            { data: "detayHesapKodu", readOnly: true, width: 100, className: "htCenter htMiddle" },
            { data: "hesapAdi", readOnly: true, width: 250, className: "htLeft htMiddle" },
            { data: "amortismanBaslangicTarihi", readOnly: true, width: 100, className: "htCenter htMiddle" },
            { data: "amortismanBitisTarihi", readOnly: true, width: 100, className: "htCenter htMiddle" },
            { data: "girisTutari", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
            { data: "yenidenDegerlemeArtisi", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
            { data: "iptalEdilecekYenidenDegerlemeTutari", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
            { data: "kalintiDeger", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
            { data: "bobiTfrsAmortismanOrani", type: "numeric", numericFormat: { pattern: "0.00%", culture: "tr-TR" }, readOnly: true, width: 100, className: "htCenter htMiddle" },
            { data: "vukCariYilAmortisman", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
            { data: "bobiTfrsCariYilAmortisman", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
            { data: "cariYilAmortismanFarki", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
            { data: "vukDonemSonuBirikmisAmortisman", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
            { data: "bobiTfrsDonemSonuBirikmisAmortisman", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
            { data: "bobiTfrsVukBirikmisAmortismanFarki", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true, width: 120, className: "htRight htMiddle" },
        ];
    }, []);

    const nestedHeaders = useMemo(() => {
        return [
            [
                { label: "SÃ„Â±ra", rowspan: 2, colspan: 1 },
                { label: "Hesap Kodu", rowspan: 2, colspan: 1 },
                { label: "Hesap AdÃ„Â±", rowspan: 2, colspan: 1 },
                { label: "A. BaÃ…Å¸. Tarihi", rowspan: 2, colspan: 1 },
                { label: "A. Bit. Tarihi", rowspan: 2, colspan: 1 },
                { label: "GiriÃ…Å¸ TutarÃ„Â±", rowspan: 2, colspan: 1 },
                { label: "Yeniden DeÃ„Å¸erleme", colspan: 2, rowspan: 1 },
                { label: "KalÃ„Â±ntÃ„Â± DeÃ„Å¸er", rowspan: 2, colspan: 1 },
                { label: "BOBI/TFRS A. OranÃ„Â±", rowspan: 2, colspan: 1 },
                { label: "Cari YÃ„Â±l AmortismanÃ„Â±", colspan: 3, rowspan: 1 },
                { label: "DÃƒÂ¶nem Sonu BirikmiÃ…Å¸ AmortismanÃ„Â±", colspan: 3, rowspan: 1 },
            ],
            [
                "", "", "", "", "", "",
                "ArtÃ„Â±Ã…Å¸", "AzalÃ„Â±Ã…Å¸",
                "", "",
                "VUK", "BOBI/TFRS", "Fark",
                "VUK", "BOBI/TFRS", "Fark",
            ],
        ];
    }, []);

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                VarlÃ„Â±k ve Amortisman Ãƒâ€“zet Tablo
            </Typography>

            <Box
                sx={{
                    width: "100%",
                    overflowX: "auto",
                    minHeight: "500px",
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
                        padding: "8px !important",
                    },
                    "& .handsontable td": {
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'} !important`,
                        whiteSpace: "nowrap !important",
                        verticalAlign: "middle !important",
                        padding: "4px 8px !important",
                    },
                    "& .handsontable tr:nth-of-type(even) td": {
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB",
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
                    height={isReport ? "auto" : "500px"}
                    stretchH="none"
                    autoColumnSize={{ useHeaders: true }}
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
                            Veri bulunamadÃ„Â±.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default VarlikVeAmortismanOzetTablo;


