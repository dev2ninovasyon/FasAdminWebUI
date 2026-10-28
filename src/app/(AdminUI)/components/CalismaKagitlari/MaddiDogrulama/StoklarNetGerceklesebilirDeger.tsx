"use client";

import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import "@/lib/handsontableSetup";

import CustomHotTable from "@/components/HotTableWrapper";
import { registerAllModules } from "handsontable/registry";

import { Box, Typography, useTheme, Button } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getStoklarNetGerceklesebilirDeger,
    stoklarNetGerceklesebilirDegerOlustur,
    stokNetGerceklesebilirDegerUpdate,
    MdStokNetGerceklesebilirDeger,
} from "@/api/CalismaKagitlari/StoklarNetGerceklesebilirDeger";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";
import { IconRefresh } from "@tabler/icons-react";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    isReport?: boolean;
}

const StoklarNetGerceklesebilirDeger = forwardRef<any, Props>(({
    parentName,
    childName,
    isReport,
}, ref) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const { setLoading: setGlobalLoading } = useLoading();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MdStokNetGerceklesebilirDeger[]>([]);
    const hotTableComponent = useRef<any>(null);

    const fetchData = async () => {
        if (!user.denetlenenId || !user.yil) return;
        setLoading(true);
        try {
            const response = await getStoklarNetGerceklesebilirDeger(
                user.denetlenenId,
                user.yil
            );
            setData(response.stokVerileri || []);
        } catch (error) {
            console.log("Veri ÃƒÂ§ekme hatasÃ„Â±:", error);
            enqueueSnackbar("Veriler yÃƒÂ¼klenirken bir hata oluÃ…Å¸tu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.denetlenenId, user.yil]);

    const handleOlustur = async () => {
        if (!user.denetlenenId || !user.yil) return;
        setLoading(true);
        try {
            const result = await stoklarNetGerceklesebilirDegerOlustur(user.denetlenenId, user.yil);
            if (result.success) {
                enqueueSnackbar(result.message, { variant: "success" });
                fetchData();
            } else {
                enqueueSnackbar(result.message, { variant: "error" });
            }
        } catch (error) {
            console.log("OluÃ…Å¸turma hatasÃ„Â±:", error);
            enqueueSnackbar("Veriler oluÃ…Å¸turulurken bir hata oluÃ…Å¸tu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handleOlustur
    }));

    const handleAfterChange = async (changes: any) => {
        if (!changes) return;

        for (const [row, prop, oldValue, newValue] of changes) {
            if (oldValue === newValue) continue;

            const rowData = data[row];
            if (!rowData) continue;

            const updatedRow = { ...rowData, [prop]: newValue };

            try {
                const result = await stokNetGerceklesebilirDegerUpdate({
                    id: updatedRow.id,
                    gercegeUygunDeger: updatedRow.gercegeUygunDeger,
                    tamamlamaMaliyeti: updatedRow.tamamlamaMaliyeti,
                    satisGiderleri: updatedRow.satisGiderleri,
                });
                if (result.success) {
                    const newData = [...data];
                    newData[row] = {
                        ...updatedRow,
                        netGerceklesebilirDeger: updatedRow.gercegeUygunDeger - updatedRow.tamamlamaMaliyeti - updatedRow.satisGiderleri,
                        degerDusukluguTutar: Math.max(0, updatedRow.maliyetDegeri - (updatedRow.gercegeUygunDeger - updatedRow.tamamlamaMaliyeti - updatedRow.satisGiderleri))
                    };
                    setData(newData);
                } else {
                    enqueueSnackbar(result.message, { variant: "error" });
                }
            } catch (error) {
                console.log("GÃƒÂ¼ncelleme hatasÃ„Â±:", error);
                enqueueSnackbar("GÃƒÂ¼ncelleme sÃ„Â±rasÃ„Â±nda bir hata oluÃ…Å¸tu", { variant: "error" });
            }
        }
    };

    const columns = [
        { data: "detayKodu", title: "Hesap No", readOnly: true },
        { data: "hesapAdi", title: "Hesap AdÃ„Â±", readOnly: true },
        { data: "maliyetDegeri", title: "Maliyet DeÃ„Å¸eri", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "gercegeUygunDeger", title: "GerÃƒÂ§eÃ„Å¸e Uygun DeÃ„Å¸er", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
        { data: "tamamlamaMaliyeti", title: "Tamamlama Maliyeti", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
        { data: "satisGiderleri", title: "SatÃ„Â±Ã…Å¸ Giderleri", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" } },
        { data: "netGerceklesebilirDeger", title: "Net GerÃƒÂ§ekleÃ…Å¸ebilir DeÃ„Å¸er", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
        { data: "degerDusukluguTutar", title: "DeÃ„Å¸er DÃƒÂ¼Ã…Å¸ÃƒÂ¼klÃƒÂ¼Ã„Å¸ÃƒÂ¼ TutarÃ„Â±", type: "numeric", numericFormat: { pattern: "0,0.00", culture: "tr-TR" }, readOnly: true },
    ];

    if (isReport && !loading && !data.length) return null;

    return (
        <Box sx={{ p: isReport ? 0 : 3 }}>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Stoklar Net GerÃƒÂ§ekleÃ…Å¸ebilir DeÃ„Å¸er
            </Typography>
            {/* Buton BÃƒÂ¶lÃƒÂ¼mÃƒÂ¼ */}
            {!isReport && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<IconRefresh size={18} />}
                        onClick={handleOlustur}
                        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: "600" }}
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
                <CustomHotTable 
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
                        <Typography variant="body1" color="textSecondary">
                            Veri bulunmamaktadÃ„Â±r. SaÃ„Å¸ ÃƒÂ¼stteki buton yardÃ„Â±mÃ„Â±yla verileri oluÃ…Å¸turabilirsiniz.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
});

StoklarNetGerceklesebilirDeger.displayName = "StoklarNetGerceklesebilirDeger";

export default StoklarNetGerceklesebilirDeger;

