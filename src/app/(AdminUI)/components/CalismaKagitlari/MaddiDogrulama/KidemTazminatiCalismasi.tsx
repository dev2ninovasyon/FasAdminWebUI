"use client";

import React, { useEffect, useState, useRef } from "react";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { Box, Typography, useTheme, Divider } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getKidemTazminatiCalismasi,
    KidemTazminatiHesaplamaSonuclari,
} from "@/api/CalismaKagitlari/KidemTazminatiCalismasi";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const KidemTazminatiCalismasi: React.FC<Props> = ({
    parentName,
    childName,
    dipnotNo,
    isReport,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading: setGlobalLoading } = useLoading();
    const [loading, setLoading] = useState(false);
    const [dataBobi, setDataBobi] = useState<KidemTazminatiHesaplamaSonuclari[]>([]);
    const [dataOncekiBobi, setDataOncekiBobi] = useState<KidemTazminatiHesaplamaSonuclari[]>([]);

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
        if (!user.denetlenenId || !user.yil || !resolvedDipnotNo) return;
        setLoading(true);
        try {
            const response = await getKidemTazminatiCalismasi(
                user.denetciId || 0,
                user.denetlenenId,
                user.yil,
                resolvedDipnotNo
            );
            setDataBobi(response.kidemVerileriBobi || []);
            setDataOncekiBobi(response.kidemVerileriOncekiYilBobi || []);
        } catch (error) {
            console.log("Veri ÃƒÂ§ekme hatasÃ„Â±:", error);
            enqueueSnackbar("Veriler yÃƒÂ¼klenirken bir hata oluÃ…Å¸tu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetlenenId, user.yil, resolvedDipnotNo]);

    if (isReport && !loading && dataBobi.length === 0 && dataOncekiBobi.length === 0) return null;

    const columns = [
        { data: "tcKimlikNo", title: "TC Kimlik No", readOnly: true },
        { data: "adiSoyadi", title: "AdÃ„Â± SoyadÃ„Â±", readOnly: true },
        { data: "kidemTazminati", title: "KÃ„Â±dem TazminatÃ„Â±", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "ihbarTazminati", title: "Ã„Â°hbar TazminatÃ„Â±", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "toplamTutar", title: "Toplam Tutar", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: isReport ? 2 : 4 }}>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                KÃ„Â±dem TazminatÃ„Â± Ãƒâ€¡alÃ„Â±Ã…Å¸masÃ„Â±
            </Typography>
            <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}>
                    Cari DÃƒÂ¶nem KÃ„Â±dem TazminatÃ„Â± Ãƒâ€¡alÃ„Â±Ã…Å¸masÃ„Â± ({user.yil || ""})
                </Typography>
                <Box
                    sx={{
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: "0px",
                        border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'}`,
                        backgroundColor: theme.palette.background.paper,
                        "& .handsontable th": {
                            backgroundColor: theme.palette.primary.main,
                            color: "white",
                            fontWeight: 'bold',
                            border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'}`,
                        },
                        "& .handsontable td": {
                            backgroundColor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'}`,
                        },
                        "& .handsontable tr:nth-of-type(even) td": {
                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB",
                        }
                    }}
                >
                    <CustomHotTable 
                        data={dataBobi}
                        columns={columns}
                        colHeaders={true}
                        rowHeaders={false}
                        stretchH="all"
                        width="100%"
                        height="auto"
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
                    {dataBobi.length === 0 && (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <Typography variant="body1" color="textSecondary">Veri bulunmamaktadÃ„Â±r.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}>
                    Ãƒâ€“nceki DÃƒÂ¶nem KÃ„Â±dem TazminatÃ„Â± Ãƒâ€¡alÃ„Â±Ã…Å¸masÃ„Â± ({(user.yil || 0) - 1})
                </Typography>
                <Box
                    sx={{
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: "8px",
                        border: `1px solid ${theme.palette.divider}`,
                        "& .handsontable th": {
                            backgroundColor: theme.palette.primary.main,
                            color: "white",
                        }
                    }}
                >
                    <CustomHotTable 
                        data={dataOncekiBobi}
                        columns={columns}
                        colHeaders={true}
                        rowHeaders={false}
                        stretchH="all"
                        width="100%"
                        height="auto"
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
                    {dataOncekiBobi.length === 0 && (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <Typography variant="body1" color="textSecondary">Veri bulunmamaktadÃ„Â±r.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default KidemTazminatiCalismasi;


