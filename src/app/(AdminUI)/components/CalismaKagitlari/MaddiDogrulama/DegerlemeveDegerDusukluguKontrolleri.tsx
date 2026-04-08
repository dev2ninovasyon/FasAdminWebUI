"use client";

import React, { useEffect, useState, useRef } from "react";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { Box, Typography, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getDegerlemeveDegerDusukluguKontrolleri,
} from "@/api/CalismaKagitlari/DegerlemeveDegerDusukluguKontrolleri";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const DegerlemeveDegerDusukluguKontrolleri: React.FC<Props> = ({
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
    const [data, setData] = useState<any[]>([]);

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
            const response = await getDegerlemeveDegerDusukluguKontrolleri(
                user.denetlenenId,
                user.yil,
                resolvedDipnotNo
            );
            setData(response.donusumMizanBobi || []);
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

    if (isReport && !loading && data.length === 0) return null;

    const columns = [
        { data: "detayKodu", title: "Hesap No", readOnly: true },
        { data: "hesapAdi", title: "Hesap AdÃ„Â±", readOnly: true },
        { data: "fisBorc", title: "BorÃƒÂ§", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "fisAlacak", title: "Alacak", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "fisBakiye", title: "Bakiye", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    const processedData = data.map(item => ({
        ...item,
        fisBakiye: item.fisBorc - item.fisAlacak
    }));

    return (
        <Box sx={{ p: isReport ? 0 : 0 }}>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
                DeÃ„Å¸erleme ve DeÃ„Å¸er DÃƒÂ¼Ã…Å¸ÃƒÂ¼klÃƒÂ¼Ã„Å¸ÃƒÂ¼ Kontrolleri
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
                    data={processedData}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={false}
                    stretchH="all"
                    width="100%"
                    height={processedData.length > 15 ? "calc(100vh - 300px)" : "auto"}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    readOnly={isReport}
                    contextMenu={isReport ? false : true}
                    dropdownMenu={isReport ? false : [
                        "filter_by_condition",
                        "filter_by_value",
                        "filter_action_bar",
                    ]}
                    manualColumnResize={!isReport}
                    filters={!isReport}
                    columnSorting={!isReport}
                />
                {processedData.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body1" color="textSecondary">Veri bulunmamaktadÃ„Â±r.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default DegerlemeveDegerDusukluguKontrolleri;


