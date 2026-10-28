"use client";

import React, { useEffect, useState, useRef } from "react";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { Box, Button, Typography, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getStokDonemsellikTesti,
    updateStokDonemsellikTesti,
    varsayilanaDonStokDonemsellik,
    StokDonemsellikTestiData,
} from "@/api/CalismaKagitlari/StokDonemsellikTesti";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const StokDonemsellikTesti: React.FC<Props> = ({
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
    const [data, setData] = useState<StokDonemsellikTestiData[]>([]);
    const hotTableComponent = useRef<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getStokDonemsellikTesti(user.denetlenenId || 0
            );
            if (response) {
                setData(response);
            }
        } catch (error) {
            console.log("Veri ÃƒÂ§ekme hatasÃ„Â±:", error);
            enqueueSnackbar("Veriler yÃƒÂ¼klenirken bir hata oluÃ…Å¸tu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetlenenId]);

    const handleVarsayilanaDon = async () => {
        setLoading(true);
        try {
            const success = await varsayilanaDonStokDonemsellik(user.denetciId || 0,
                user.yil || 0,
                user.denetlenenId || 0,
                dipnotNo
            );
            if (success) {
                enqueueSnackbar("Veriler baÃ…Å¸arÃ„Â±yla getirildi", { variant: "success" });
                fetchData();
            } else {
                enqueueSnackbar("Veriler getirilirken bir hata oluÃ…Å¸tu", { variant: "error" });
            }
        } catch (error) {
            console.log("VarsayÃ„Â±lana dÃƒÂ¶nme hatasÃ„Â±:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAfterChange = async (changes: any, source: string) => {
        if (source === "loadData") return;
        if (changes) {
            for (const [row, prop, oldValue, newValue] of changes) {
                if (oldValue !== newValue) {
                    const updatedRow = data[row];
                    const updateData = { [prop]: newValue };
                    try {
                        await updateStokDonemsellikTesti(updatedRow.id, updateData);
                    } catch (error) {
                        console.log("GÃƒÂ¼ncelleme hatasÃ„Â±:", error);
                        enqueueSnackbar("GÃƒÂ¼ncelleme sÃ„Â±rasÃ„Â±nda bir hata oluÃ…Å¸tu", { variant: "error" });
                    }
                }
            }
        }
    };

    const columns = [
        { data: "detayKodu", title: "Hesap Kodu", readOnly: true },
        { data: "hesapAdi", title: "Hesap AdÃ„Â±", readOnly: true },
        { data: "belgeNevi", title: "Belge Nevi", readOnly: true },
        { data: "belgeNo", title: "Belge No", readOnly: true },
        { data: "belgeTarihi", title: "Belge Tarihi", type: "date", dateFormat: "DD.MM.YYYY", readOnly: true },
        { data: "belgeTutari", title: "Belge TutarÃ„Â±", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "kayitTarihi", title: "KayÃ„Â±t Tarihi", type: "date", dateFormat: "DD.MM.YYYY", readOnly: true },
        { data: "kayitNo", title: "KayÃ„Â±t No", type: "numeric", readOnly: true },
        { data: "tespit", title: "Tespit" },
    ];

    if (isReport && !loading && data.length === 0) return null;

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Stok DÃƒÂ¶nemsellik Testi
            </Typography>
            {!isReport && (
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleVarsayilanaDon}
                        sx={{ borderRadius: "20px", textTransform: "none" }}
                    >
                        Verileri Getir
                    </Button>
                </Box>
            )}
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
                {/* Tablo her zaman render edilir (baÃ…Å¸lÃ„Â±klar iÃƒÂ§in) */}
                <CustomHotTable 
                    ref={hotTableComponent}
                    data={data}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={false}
                    stretchH="all"
                    height={data.length > 0 ? "auto" : "35px"} // Veri yoksa sadece baÃ…Å¸lÃ„Â±k boyu kadar (yaklaÃ…Å¸Ã„Â±k 35px) yer kaplar
                    autoWrapRow={true}
                    autoWrapCol={true}
                    language="tr-TR"
                    afterChange={handleAfterChange}
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    readOnly={isReport}
                    contextMenu={isReport ? false : true}
                    dropdownMenu={!isReport}
                    manualColumnResize={!isReport}
                    filters={!isReport}
                    columnSorting={!isReport}
                />

                {/* EÃ„Å¸er veri yoksa tablonun hemen altÃ„Â±na mesajÃ„Â± basÃ„Â±yoruz */}
                {data.length === 0 && (
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
                            Veri bulunmamaktadÃ„Â±r.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default StokDonemsellikTesti;


