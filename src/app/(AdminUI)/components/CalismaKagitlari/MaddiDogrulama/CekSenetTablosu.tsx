"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";
import Handsontable from "handsontable";


import { Box, Typography, Button, Snackbar, Alert, CircularProgress, useTheme } from "@mui/material";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getCekSenetReeskontVerileriByDenetciDenetlenenYil,
    createCekSenetReeskontVerisi,
} from "@/api/Veri/CekSenetReeskont";

// Handsontable modÃƒÂ¼llerini kaydet
registerAllModules();

interface Props {
    dipnotNo: string;
    isReport?: boolean;
}

const CekSenetTablosu: React.FC<Props> = ({
    dipnotNo,
    isReport
}) => {
    const theme = useTheme();
    const hotRef = useRef<any>(null);
    const [veriler, setVeriler] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: AppState) => state.userReducer);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

    const fetchData = useCallback(async () => {
        if (user.token && user.denetciId && user.yil && user.denetlenenId) {
            setLoading(true);
            try {
                const result = await getCekSenetReeskontVerileriByDenetciDenetlenenYil(user.denetciId, user.denetlenenId, user.yil);
                setVeriler(result || []);
            } catch (error) {
                showSnackbar("Veriler yÃƒÂ¼klenirken hata oluÃ…Å¸tu.", "error");
            } finally {
                setLoading(false);
            }
        }
    }, [user.token, user.denetciId, user.yil, user.denetlenenId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSave = async () => {
        const hotInstance = hotRef.current?.hotInstance;
        const data = hotInstance.getSourceData();

        try {
            const success = await createCekSenetReeskontVerisi(data);
            if (success) {
                showSnackbar("BaÃ…Å¸arÃ„Â±yla kaydedildi.", "success");
                fetchData();
            } else {
                showSnackbar("Kaydetme hatasÃ„Â±!", "error");
            }
        } catch (error) {
            showSnackbar("Kaydetme hatasÃ„Â±!", "error");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isReport && !loading && veriler.length === 0) return null;

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Ãƒâ€¡ek Senet Tablosu
            </Typography>
            {!isReport && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<IconDeviceFloppy size={16} />}
                        onClick={handleSave}
                        sx={{ px: 2, borderRadius: "6px", fontSize: '0.8125rem' }}
                    >
                        TÃƒÂ¼mÃƒÂ¼nÃƒÂ¼ Kaydet
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
                    backgroundColor: `${theme.palette.primary.main} !important`,
                    color: "white !important",
                    fontWeight: "bold !important",
                    textAlign: "center !important",
                    verticalAlign: "middle !important",
                    padding: "8px !important",
                    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'} !important`,
                },
                "& .handsontable td": {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ddd'} !important`,
                },
                "& .handsontable tr:nth-of-type(even) td": {
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB",
                }
            }}>
                <CustomHotTable 
                    ref={hotRef}
                    data={veriler}
                    language="tr-TR"
                    colHeaders={[
                        "Hesap Kodu",
                        "Hesap AdÃ„Â±",
                        "KayÃ„Â±t Tarihi",
                        "Muhatap Firma",
                        "No",
                        "Vade Tarihi",
                        "Nominal DeÃ„Å¸er",
                        "Para Birimi",
                        "A/V"
                    ]}
                    columns={[
                        { data: 'detayHesapKodu', type: 'text' },
                        { data: 'hesapAdi', type: 'text' },
                        { data: 'cekSenetKayitTarihi', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true },
                        { data: 'muhatapFirma', type: 'text' },
                        { data: 'cekSenetNo', type: 'numeric' },
                        { data: 'cekSenetVadeTarihi', type: 'date', dateFormat: 'YYYY-MM-DD', correctFormat: true },
                        { data: 'kayitTutariNominalDeger', type: 'numeric', numericFormat: { pattern: '0,0.00', culture: 'tr-TR' } },
                        { data: 'paraBirimi', type: 'text' },
                        { data: 'alinanAVerilenV', type: 'text' }
                    ]}
                    stretchH="all"
                    height="auto"
                    autoWrapRow={true}
                    autoWrapCol={true}
                    dropdownMenu={!isReport}
                    filters={!isReport}
                    manualColumnResize={!isReport}
                    columnSorting={!isReport}
                    contextMenu={isReport ? false : {
                        items: {
                            "row_above": { name: "ÃƒÅ“ste SatÃ„Â±r Ekle" },
                            "row_below": { name: "Alta SatÃ„Â±r Ekle" },
                            "separator": Handsontable.plugins.ContextMenu.SEPARATOR,
                            "remove_row": { name: "SeÃƒÂ§ili SatÃ„Â±rÃ„Â± Sil" },
                            "undo": { name: "Geri Al" },
                            "redo": { name: "Ã„Â°leri Al" }
                        }
                    }}
                    readOnly={isReport}
                    afterCreateRow={(index, amount) => {
                        const hotInstance = hotRef.current?.hotInstance;
                        for (let i = 0; i < amount; i++) {
                            hotInstance.setDataAtRowProp(index + i, 'denetciId', user.denetciId);
                            hotInstance.setDataAtRowProp(index + i, 'denetlenenId', user.denetlenenId);
                            hotInstance.setDataAtRowProp(index + i, 'yil', user.yil);
                        }
                    }}
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

export default CekSenetTablosu;

