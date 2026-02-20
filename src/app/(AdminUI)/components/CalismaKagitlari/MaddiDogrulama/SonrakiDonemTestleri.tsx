"use client";

import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import "@/utils/languages/handsontable.tr-TR";
import { Box, Typography, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getSonrakiDonemTestleri,
    sonrakiDonemTestleriSatirEkle,
    sonrakiDonemTestleriSatirSil,
    sonrakiDonemTestleriSatirGuncelle,
    sonrakiDonemTestleriTopluSatirSil,
    MaddiDogrulukTahsilatKayitlari,
} from "@/api/CalismaKagitlari/SonrakiDonemTestleri";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";
import moment from "moment";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const SonrakiDonemTestleri = forwardRef<any, Props>(({
    parentName,
    childName,
    dipnotNo,
    isReport,
}, ref) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading: setGlobalLoading } = useLoading();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<(MaddiDogrulukTahsilatKayitlari & { selected?: boolean })[]>([]);
    const hotTableComponent = useRef<any>(null);

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
        if (!user.denetlenenId || !user.yil || !resolvedDipnotNo) return;
        setLoading(true);
        try {
            const response = await getSonrakiDonemTestleri(
                user.denetlenenId,
                user.yil,
                resolvedDipnotNo
            );
            setData((response.tahsilatKayitlari || []).map((item: any) => ({
                ...item,
                selected: false,
                tarih: item.tarih ? moment(item.tarih).format("DD.MM.YYYY") : ""
            })));
        } catch (error) {
            console.log("Veri çekme hatası:", error);
            enqueueSnackbar("Veriler yüklenirken bir hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetlenenId, user.yil, resolvedDipnotNo]);

    const handleSatirEkle = async () => {
        if (!user.denetlenenId || !user.yil) return;
        try {
            const result = await sonrakiDonemTestleriSatirEkle({
                denetlenenId: user.denetlenenId,
                yil: user.yil,
                hesapNo: "",
                hesapAciklamasi: "",
                kayitNo: (data.length + 1).toString(),
                tarih: new Date(user.yil, 11, 31).toISOString(),
                giris: 0,
                tahsilat: 0,
                bakiye: 0
            });
            if (result.success) {
                enqueueSnackbar(result.message, { variant: "success" });
                fetchData();
            } else {
                enqueueSnackbar(result.message, { variant: "error" });
            }
        } catch (error) {
            console.log("Ekleme hatası:", error);
            enqueueSnackbar("Satır eklenirken bir hata oluştu", { variant: "error" });
        }
    };

    const handleSeciliSatirlariSil = async () => {
        const selectedIds = data.filter(item => item.selected).map(item => item.id);
        if (selectedIds.length === 0) {
            enqueueSnackbar("Silinecek satır seçilmedi", { variant: "warning" });
            return;
        }
        try {
            setLoading(true);
            const result = await sonrakiDonemTestleriTopluSatirSil(selectedIds);
            if (result.success) {
                enqueueSnackbar(result.message, { variant: "success" });
                fetchData();
            } else {
                enqueueSnackbar(result.message, { variant: "error" });
            }
        } catch (error) {
            console.log("Toplu silme hatası:", error);
            enqueueSnackbar("Seçili satırlar silinirken bir hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleSatirEkle,
        handleSeciliSatirlariSil
    }));

    const handleAfterChange = async (changes: any) => {
        if (!changes) return;

        for (const [row, prop, oldValue, newValue] of changes) {
            if (oldValue === newValue) continue;

            const rowData = data[row];
            if (!rowData) continue;

            let updatedRow = { ...rowData, [prop]: newValue };

            if (prop === "selected") {
                const newData = [...data];
                newData[row] = updatedRow;
                setData(newData);
                continue;
            }

            if (prop === "tarih" && newValue) {
                const isoDate = moment(newValue, "DD.MM.YYYY").toISOString();
                updatedRow = { ...updatedRow, tarih: isoDate };
            }

            try {
                const result = await sonrakiDonemTestleriSatirGuncelle(updatedRow);
                if (result.success) {
                    const newData = [...data];
                    newData[row] = { ...updatedRow, tarih: prop === "tarih" ? newValue : updatedRow.tarih };
                    setData(newData);
                } else {
                    enqueueSnackbar(result.message, { variant: "error" });
                }
            } catch (error) {
                console.log("Güncelleme hatası:", error);
                enqueueSnackbar("Güncelleme sırasında bir hata oluştu", { variant: "error" });
            }
        }
    };

    const columns = [
        ...(!isReport ? [{ data: "selected", title: "Seç", type: "checkbox", className: "htCenter" }] : []),
        { data: "kayitNo", title: "Kayıt No" },
        { data: "hesapNo", title: "Hesap No" },
        { data: "hesapAciklamasi", title: "Hesap Açıklaması" },
        { data: "tarih", title: "Tarih", type: "date", dateFormat: "DD.MM.YYYY", correctFormat: true },
        { data: "giris", title: "Giriş", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
        { data: "tahsilat", title: "Tahsilat", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
        { data: "bakiye", title: "Bakiye", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
    ];

    if (isReport && !loading && data.length === 0) return null;

    return (
        <Box>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Sonraki Dönem Testleri
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
                <HotTable
                    ref={hotTableComponent}
                    data={data}
                    columns={columns}
                    colHeaders={true}
                    rowHeaders={false}
                    stretchH="all"
                    width="100%"
                    height={isReport ? "auto" : (data.length > 15 ? "calc(100vh - 300px)" : "auto")}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    language="tr-TR"
                    licenseKey="non-commercial-and-evaluation"
                    className={customizer.activeMode === "dark" ? "htDark" : ""}
                    afterChange={handleAfterChange}
                    readOnly={isReport}
                    contextMenu={isReport ? false : true}
                    dropdownMenu={!isReport}
                    manualColumnResize={!isReport}
                    filters={!isReport}
                    columnSorting={!isReport}
                />
                {data.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body1" color="textSecondary">Veri bulunmamaktadır.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
});
SonrakiDonemTestleri.displayName = "SonrakiDonemTestleri";

export default SonrakiDonemTestleri;


