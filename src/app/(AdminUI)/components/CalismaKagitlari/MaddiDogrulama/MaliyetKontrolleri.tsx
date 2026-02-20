"use client";

import React, { useEffect, useState, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import "@/utils/languages/handsontable.tr-TR";
import { Box, Typography, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getMaliyetKontrolleri,
    MaliyetKontrolleriResponseDto,
} from "@/api/CalismaKagitlari/MaliyetKontrolleri";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const MaliyetKontrolleri: React.FC<Props> = ({
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
    const [data, setData] = useState<MaliyetKontrolleriResponseDto[]>([]);
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
        if (!user.denetlenenId || !user.yil || !resolvedDipnotNo) {
            console.warn("Parametreler eksik, istek atılmıyor:", {
                denetlenenId: user.denetlenenId,
                yil: user.yil,
                dipnotNo: resolvedDipnotNo
            });
            return;
        }
        setLoading(true);
        try {
            const response = await getMaliyetKontrolleri(
                user.denetlenenId,
                user.yil,
                resolvedDipnotNo
            );
            if (Array.isArray(response)) {
                console.log("Veri geldi, satır sayısı:", response.length);
                setData(response);
            } else {
                console.log("Beklenmeyen veri formatı:", response);
                enqueueSnackbar("Sunucudan geçersiz veri formatı alındı", { variant: "error" });
                setData([]);
            }
        } catch (error) {
            console.log("Veri çekme hatası:", error);
            enqueueSnackbar("Veriler yüklenirken bir hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (resolvedDipnotNo) {
            fetchData();
        }
    }, [user.denetlenenId, user.yil, resolvedDipnotNo]);

    if (isReport && !loading && (!Array.isArray(data) || data.length === 0)) {
        return null;
    }

    const columns = [
        { data: "hesapNo", title: "Hesap No", readOnly: true },
        { data: "hesapAciklamasi", title: "Hesap Açıklaması", readOnly: true },
        { data: "oncekiDonemBakiye", title: "Önceki Dönem Bakiye", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "cariDonemBakiye", title: "Cari Dönem Bakiye", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "degisimTL", title: "Değişim TL", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "degisimYuzde", title: "Değişim Yüzde", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    return (
        <Box>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Maliyet Kontrolleri
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
                    },
                    "& .bold-row": {
                        fontWeight: "bold",
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.action.hover,
                    },
                    "& .header-row": {
                        fontWeight: "bold",
                        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
                        color: theme.palette.text.primary,
                    }
                }}
            >
                <HotTable
                    ref={hotTableComponent}
                    data={data}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={false}
                    stretchH="all"
                    width="100%"
                    height={isReport ? "auto" : (Array.isArray(data) && data.length > 15 ? "calc(100vh - 300px)" : "auto")}
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
                    cells={(row, col) => {
                        const cellProperties: any = {};
                        const rowData = data[row];
                        if (rowData?.isBold) {
                            cellProperties.className = (cellProperties.className || "") + " bold-row";
                        }
                        if (rowData?.isHeader) {
                            cellProperties.className = (cellProperties.className || "") + " header-row";
                        }
                        return cellProperties;
                    }}
                />

                {(!Array.isArray(data) || data.length === 0) && (
                    <Box
                        sx={{
                            p: 4,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: theme.palette.background.paper
                        }}
                    >
                        <Typography variant="body1" color="textSecondary">
                            Veri bulunmamaktadır.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default MaliyetKontrolleri;


