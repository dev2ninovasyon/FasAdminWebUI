"use client";
import React, { useEffect, useState, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import "@/utils/languages/handsontable.tr-TR";
import { Box, Button, Typography, useTheme, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    getHasilatDonemsellikTesti,
    saveHasilatDonemsellikTesti,
    HasilatDonemsellikTestiResponseDto,
    HasilatDonemsellikTestiAddDto,
} from "@/api/CalismaKagitlari/HasilatDonemsellikTesti";
import { useLoading } from "@/contexts/LoadingContext";
import { enqueueSnackbar } from "notistack";
import { format } from "date-fns";

registerAllModules();

interface Props {
    parentName: string;
    childName: string;
    dipnotNo: string;
    isReport?: boolean;
}

const HasilatDonemsellikTesti: React.FC<Props> = ({
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
    const [data, setData] = useState<HasilatDonemsellikTestiResponseDto[]>([]);
    const hotTableComponent = useRef<any>(null);

    const [filters, setFilters] = useState({
        baslangictarih: format(new Date(user.yil || new Date().getFullYear(), 11, 15), "yyyy-MM-dd"), // Default to Dec 15 of audit year
        bitistarih: format(new Date(user.yil || new Date().getFullYear() + 1, 0, 15), "yyyy-MM-dd"), // Default to Jan 15 of next year
        hesaplar: "600,601,602",
        tutardanFazla: 0,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: name === "tutardanFazla" ? parseFloat(value) || 0 : value,
        }));
    };

    const fetchData = async () => {
        if (!user.denetlenenId) {
            enqueueSnackbar("Lütfen bir denetlenen seçiniz", { variant: "warning" });
            return;
        }
        setLoading(true);
        try {
            const response = await getHasilatDonemsellikTesti(
                user.denetciId || 0,
                user.denetlenenId,
                user.yil || 0,
                filters.baslangictarih,
                filters.bitistarih,
                filters.hesaplar,
                filters.tutardanFazla
            );
            if (response && Array.isArray(response)) {
                setData(response);
                enqueueSnackbar("Veriler başarıyla yüklendi", { variant: "success" });
            } else {
                setData([]);
                enqueueSnackbar("Veri bulunamadı", { variant: "info" });
            }
        } catch (error) {
            console.log("Veri çekme hatası:", error);
            setData([]);
            enqueueSnackbar("Veriler yüklenirken bir hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const listToSave: HasilatDonemsellikTestiAddDto[] = data.map((item) => ({
                denetciId: user.denetciId || 0,
                denetlenenId: user.denetlenenId || 0,
                yil: user.yil || 0,
                dipnotNo: dipnotNo,
                detayKodu: item.detayKodu,
                hesapAdi: item.hesapAdi,
                buyukDefterId: item.buyukDefterId,
                belgeNevi: item.belgeNevi,
                belgeNo: item.belgeNo,
                belgeTarihi: item.belgeTarihi,
                belgeTutari: item.belgeTutari,
                kayitTarihi: item.kayitTarihi,
                kayitNo: item.kayitNo,
                tespit: item.tespit,
            }));

            await saveHasilatDonemsellikTesti(listToSave, true);
            enqueueSnackbar("Veriler başarıyla kaydedildi", { variant: "success" });
        } catch (error) {
            console.log("Kaydetme hatası:", error);
            enqueueSnackbar("Kaydetme sırasında bir hata oluştu", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleAfterChange = (changes: any, source: string) => {
        if (source === "loadData") return;
        if (changes) {
            const newData = [...data];
            changes.forEach(([row, prop, oldValue, newValue]: any) => {
                if (oldValue !== newValue) {
                    (newData[row] as any)[prop] = newValue;
                }
            });
            setData(newData);
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
        <Box sx={{ p: isReport ? 0 : 0 }}>
            <Typography variant="h6" sx={{ color: "#2C3E50", fontWeight: "bold", mb: 3 }}>
                Hasılat Dönemsellik Testi
            </Typography>
            {!isReport && (
                <Grid container spacing={2} mb={3} alignItems="flex-end">
                    <Grid
                        size={{
                            xs: 12,
                            sm: 3
                        }}>
                        <TextField
                            fullWidth
                            label="Başlangıç Tarihi"
                            type="date"
                            name="baslangictarih"
                            value={filters.baslangictarih}
                            onChange={handleFilterChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 3
                        }}>
                        <TextField
                            fullWidth
                            label="Bitiş Tarihi"
                            type="date"
                            name="bitistarih"
                            value={filters.bitistarih}
                            onChange={handleFilterChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 3
                        }}>
                        <TextField
                            fullWidth
                            label="Hesaplar"
                            name="hesaplar"
                            value={filters.hesaplar}
                            onChange={handleFilterChange}
                            placeholder="600,601,602"
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 3
                        }}>
                        <TextField
                            fullWidth
                            label="Tutardan Fazla"
                            type="number"
                            name="tutardanFazla"
                            value={filters.tutardanFazla}
                            onChange={handleFilterChange}
                        />
                    </Grid>
                    <Grid display="flex" justifyContent="flex-end" gap={2} size={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={fetchData}
                            sx={{ borderRadius: "20px", textTransform: "none" }}
                        >
                            Verileri Getir
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleSave}
                            sx={{ borderRadius: "20px", textTransform: "none" }}
                        >
                            Verileri Kaydet
                        </Button>
                    </Grid>
                </Grid>
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
                    afterChange={handleAfterChange}
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
                            Veri bulunmamaktadır. Filtreleri ayarlayıp "Verileri Getir" butonuna basınız.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default HasilatDonemsellikTesti;

