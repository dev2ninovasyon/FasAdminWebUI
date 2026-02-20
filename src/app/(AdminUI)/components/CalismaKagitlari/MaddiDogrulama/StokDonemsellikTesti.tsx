"use client";

import React, { useEffect, useState, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import "@/utils/languages/handsontable.tr-TR";
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
            console.log("Veri çekme hatası:", error);
            enqueueSnackbar("Veriler yüklenirken bir hata oluştu", { variant: "error" });
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
                enqueueSnackbar("Veriler başarıyla getirildi", { variant: "success" });
                fetchData();
            } else {
                enqueueSnackbar("Veriler getirilirken bir hata oluştu", { variant: "error" });
            }
        } catch (error) {
            console.log("Varsayılana dönme hatası:", error);
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
                        console.log("Güncelleme hatası:", error);
                        enqueueSnackbar("Güncelleme sırasında bir hata oluştu", { variant: "error" });
                    }
                }
            }
        }
    };

    const columns = [
        { data: "detayKodu", title: "Hesap Kodu", readOnly: true },
        { data: "hesapAdi", title: "Hesap Adı", readOnly: true },
        { data: "belgeNevi", title: "Belge Nevi", readOnly: true },
        { data: "belgeNo", title: "Belge No", readOnly: true },
        { data: "belgeTarihi", title: "Belge Tarihi", type: "date", dateFormat: "DD.MM.YYYY", readOnly: true },
        { data: "belgeTutari", title: "Belge Tutarı", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "kayitTarihi", title: "Kayıt Tarihi", type: "date", dateFormat: "DD.MM.YYYY", readOnly: true },
        { data: "kayitNo", title: "Kayıt No", type: "numeric", readOnly: true },
        { data: "tespit", title: "Tespit" },
    ];

    if (isReport && !loading && data.length === 0) return null;

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Stok Dönemsellik Testi
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
                {/* Tablo her zaman render edilir (başlıklar için) */}
                <HotTable
                    ref={hotTableComponent}
                    data={data}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={false}
                    stretchH="all"
                    height={data.length > 0 ? "auto" : "35px"} // Veri yoksa sadece başlık boyu kadar (yaklaşık 35px) yer kaplar
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

                {/* Eğer veri yoksa tablonun hemen altına mesajı basıyoruz */}
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
                            Veri bulunmamaktadır.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default StokDonemsellikTesti;


