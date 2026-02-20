"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
import "@/utils/languages/handsontable.tr-TR";

import { Box, Typography, Button, Snackbar, Alert, CircularProgress, useTheme } from "@mui/material";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getSupheliAlacakTestleri,
    saveAllSupheliAlacakTestleri,
    varsayilanaDon,
    SupheliAlacakTestleriData,
} from "@/api/CalismaKagitlari/SupheliAlacakTestleri";

registerAllModules();

interface Props {
    dipnotNo: string;
    modelAdi: string;
    isClickedVarsayilanaDon: boolean;
    setIsClickedVarsayilanaDon: (deger: boolean) => void;
    isReport?: boolean;
}

const SupheliAlacakTestleri: React.FC<Props> = ({
    dipnotNo,
    modelAdi,
    isClickedVarsayilanaDon,
    setIsClickedVarsayilanaDon,
    isReport
}) => {
    const theme = useTheme();
    const hotRef = useRef<any>(null);
    const [veriler, setVeriler] = useState<SupheliAlacakTestleriData[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: AppState) => state.userReducer);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    const [resolvedDipnotNo, setResolvedDipnotNo] = useState(dipnotNo);

    useEffect(() => {
        setResolvedDipnotNo(dipnotNo);
    }, [dipnotNo]);

    useEffect(() => {
        const resolveDipnot = async () => {
            if (!dipnotNo && modelAdi) {
                try {
                    const { getDipnotNoByDipnotAdi } = await import("@/api/MaddiDogrulama/MaddiDogrulama");
                    const dNo = await getDipnotNoByDipnotAdi(user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                        modelAdi,
                        user.denetimTuru === "Tfrs"
                    );
                    if (dNo) setResolvedDipnotNo(dNo);
                } catch (error) {
                    console.error("Dipnot no getirilemedi:", error);
                }
            }
        };
        resolveDipnot();
    }, [dipnotNo, modelAdi, user]);

    const fetchData = useCallback(async () => {
        if (user.token && user.denetciId && user.yil && user.denetlenenId && resolvedDipnotNo) {
            setLoading(true);
            try {
                const result = await getSupheliAlacakTestleri(user.denetciId, user.yil, user.denetlenenId, resolvedDipnotNo);
                setVeriler(result || []);
            } catch (error) {
                showSnackbar("Veriler yüklenirken hata oluştu.", "error");
            } finally {
                setLoading(false);
            }
        } else {
            if (resolvedDipnotNo === "") setLoading(false);
        }
    }, [user.token, user.denetciId, user.yil, user.denetlenenId, resolvedDipnotNo]);

    useEffect(() => {
        const handleVarsayilanaDon = async () => {
            if (isClickedVarsayilanaDon && user.token) {
                try {
                    setLoading(true);
                    const success = await varsayilanaDon(
                        user.denetciId || 0,
                        user.yil || 0,
                        user.denetlenenId || 0,
                        dipnotNo
                    );
                    if (success) {
                        showSnackbar("Veriler başarıyla sıfırlandı.", "success");
                        await fetchData();
                    }
                } catch (error) {
                    showSnackbar("Sıfırlama işlemi sırasında hata oluştu.", "error");
                } finally {
                    setIsClickedVarsayilanaDon(false);
                    setLoading(false);
                }
            }
        };
        handleVarsayilanaDon();
    }, [isClickedVarsayilanaDon, user, dipnotNo, fetchData, setIsClickedVarsayilanaDon]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSaveAll = async () => {
        const hotInstance = hotRef.current?.hotInstance;
        if (!hotInstance) return;

        const allData = hotInstance.getSourceData();

        // Sadece gerekli alanları gönderiyoruz ve navigation property'leri temizliyoruz
        const dataToSend = allData.map((row: any) => ({
            id: Number(row.id) || 0,
            denetciId: user.denetciId,
            denetlenenId: user.denetlenenId,
            yil: user.yil,
            dipnotNo: dipnotNo,
            baslik: row.baslik || "Şüpheli Alacak Testleri",
            hesapNo: row.hesapNo || "",
            hesapAdi: row.hesapAdi || "",
            kebirKodu: row.kebirKodu || "128",
            oncekiDonemBakiye: Number(row.oncekiDonemBakiye) || 0,
            cariDonemBakiye: Number(row.cariDonemBakiye) || 0,
            degisimTl: Number(row.degisimTl) || 0,
            avukatMektubu: row.avukatMektubu || "",
            standartmi: row.standartmi === true,
            tfrsmi: row.tfrsmi === true
        }));

        try {
            const success = await saveAllSupheliAlacakTestleri(dataToSend);

            if (success) {
                showSnackbar("Tüm tablo başarıyla kaydedildi.", "success");
                fetchData();
            } else {
                showSnackbar("Kaydetme sırasında bir hata oluştu. Lütfen verileri kontrol ediniz.", "error");
            }
        } catch (error) {
            showSnackbar("Bağlantı hatası oluştu!", "error");
        }
    };

    const handleAfterChange = (changes: any, source: string) => {
        if (source === 'loadData' || !changes) return;
        const hotInstance = hotRef.current?.hotInstance;

        for (const [row, prop, oldValue, newValue] of changes) {
            if (oldValue === newValue) continue;

            const rowData = hotInstance.getSourceDataAtRow(row);

            if (prop === 'oncekiDonemBakiye' || prop === 'cariDonemBakiye') {
                const onceki = Number(prop === 'oncekiDonemBakiye' ? newValue : rowData.oncekiDonemBakiye) || 0;
                const cari = Number(prop === 'cariDonemBakiye' ? newValue : rowData.cariDonemBakiye) || 0;
                hotInstance.setDataAtRowProp(row, 'degisimTl', Math.abs(onceki - cari), 'internal');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isReport && !loading && veriler.length === 0) {
        return null;
    }

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Şüpheli Alacak Testleri
            </Typography>
            {!isReport && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<IconDeviceFloppy size={16} />}
                        onClick={handleSaveAll}
                        sx={{ px: 2, borderRadius: "6px", fontSize: '0.8125rem', textTransform: 'none' }}
                    >
                        Tüm Tabloyu Kaydet
                    </Button>
                </Box>
            )}

            <Box sx={{
                width: '100%',
                border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'}`,
                borderRadius: '0px',
                backgroundColor: theme.palette.background.paper,
                overflow: 'hidden',
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
            }}>
                <HotTable
                    ref={hotRef}
                    data={veriler}
                    language="tr-TR"
                    colHeaders={[
                        "Hesap No",
                        "Hesap Adı",
                        "Önceki Dönem Bakiye",
                        "Cari Dönem Bakiye",
                        "Değişim (TL)",
                        "Avukat Mektubu"
                    ]}
                    columns={[
                        { data: 'hesapNo', type: 'text' },
                        { data: 'hesapAdi', type: 'text' },
                        { data: 'oncekiDonemBakiye', type: 'numeric', numericFormat: { pattern: '0,0.00', culture: 'tr-TR' } },
                        { data: 'cariDonemBakiye', type: 'numeric', numericFormat: { pattern: '0,0.00', culture: 'tr-TR' } },
                        { data: 'degisimTl', type: 'numeric', numericFormat: { pattern: '0,0.00', culture: 'tr-TR' }, readOnly: true },
                        { data: 'avukatMektubu', type: 'text' }
                    ]}
                    stretchH="all"
                    height={isReport ? "auto" : "500px"}
                    width="100%"
                    viewportColumnRenderingOffset={10}
                    viewportRowRenderingOffset={10}
                    autoWrapRow={true}
                    autoWrapCol={true}
                    dropdownMenu={!isReport}
                    filters={!isReport}
                    manualColumnResize={!isReport}
                    columnSorting={!isReport}
                    contextMenu={isReport ? false : {
                        items: {
                            "row_above": { name: "Üste Satır Ekle" },
                            "row_below": { name: "Alta Satır Ekle" },
                            "separator": Handsontable.plugins.ContextMenu.SEPARATOR,
                            "remove_row": { name: "Seçili Satırı Sil" },
                            "undo": { name: "Geri Al" },
                            "redo": { name: "İleri Al" }
                        }
                    }}
                    readOnly={isReport}
                    afterCreateRow={(index, amount) => {
                        const hotInstance = hotRef.current?.hotInstance;
                        for (let i = 0; i < amount; i++) {
                            hotInstance.setDataAtRowProp(index + i, 'id', 0);
                            hotInstance.setDataAtRowProp(index + i, 'oncekiDonemBakiye', 0);
                            hotInstance.setDataAtRowProp(index + i, 'cariDonemBakiye', 0);
                            hotInstance.setDataAtRowProp(index + i, 'degisimTl', 0);
                        }
                    }}
                    afterChange={handleAfterChange}
                    licenseKey="non-commercial-and-evaluation"
                />
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SupheliAlacakTestleri;


