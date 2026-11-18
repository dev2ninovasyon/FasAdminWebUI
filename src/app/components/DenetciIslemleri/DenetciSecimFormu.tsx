import {
    Grid,
    Button,
    Autocomplete,
    TextField,
    Alert,
    Box,
    Chip,
    Stack,
    Typography,
    CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { enqueueSnackbar } from "notistack";
import {
    getDenetciler,
    getOldDbDenetciler,
    importDenetci,
    OldDenetciListItem,
} from "@/api/DenetciIslemleri/DenetciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const DenetciSecimFormu = () => {
    const user = useSelector((state: AppState) => state.userReducer);

    const [denetciler, setDenetciler] = useState<OldDenetciListItem[]>([]);
    const [selectedDenetci, setSelectedDenetci] = useState<OldDenetciListItem | null>(null);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [listError, setListError] = useState<string | null>(null);

    const [firmaAdi, setFirmaAdi] = useState("");
    const [firmaUnvani, setFirmaUnvani] = useState("");
    const [adres, setAdress] = useState("");
    const [il, setIl] = useState("");
    const [tel, setTel] = useState("");
    const [fax, setFax] = useState("");
    const [email, setEmail] = useState("");
    const [web, setWeb] = useState("");
    const [vergiNo, setVergiNo] = useState("");
    const [vergiDairesi, setVergidairesi] = useState("");
    const [ticaretSicilNo, setTicaretSicilNo] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [autocompleteKey, setAutocompleteKey] = useState(0);

    const resetForm = (savedId: any) => {
        setDenetciler(prev => prev.filter(d => Number(d.id) !== Number(savedId)));
        setSelectedDenetci(null);
        setFirmaAdi(""); setFirmaUnvani(""); setAdress(""); setIl("");
        setTel(""); setFax(""); setEmail(""); setWeb("");
        setVergiNo(""); setVergidairesi(""); setTicaretSicilNo("");
        setAutocompleteKey(k => k + 1);
    };

    useEffect(() => {
        let cancelled = false;
        const fetchDenetciler = async () => {
            setIsLoadingList(true);
            setListError(null);
            try {
                const token = user?.token || "";
                const [oldData, newData] = await Promise.all([
                    getOldDbDenetciler(token),
                    getDenetciler(token),
                ]);

                if (cancelled) return;

                if (Array.isArray(oldData)) {
                    const importedLegacyIds = new Set(
                        Array.isArray(newData)
                            ? newData
                                  .map((d: any) => d.legacyOldDbId ?? d.LegacyOldDbId)
                                  .filter((val: any) => val !== null && val !== undefined && Number(val) > 0)
                                  .map((val: any) => Number(val))
                            : []
                    );
                    setDenetciler(oldData.filter((d) => !importedLegacyIds.has(Number(d.id))));
                } else {
                    setDenetciler([]);
                }
            } catch (err: any) {
                if (cancelled) return;
                const msg = err?.message || "Eski sistem denetçi listesi alınamadı.";
                setListError(msg);
                setDenetciler([]);
            } finally {
                if (!cancelled) {
                    setIsLoadingList(false);
                }
            }
        };
        fetchDenetciler();
        return () => {
            cancelled = true;
        };
    }, [user?.token]);

    const handleDenetciChange = (event: any, newValue: OldDenetciListItem | null) => {
        setSelectedDenetci(newValue);
        if (newValue) {
            setFirmaAdi(newValue.firmaAdi || "");
            setFirmaUnvani(newValue.firmaUnvani || "");
            setAdress(newValue.adres || "");
            setIl(newValue.il || "");
            setTel(newValue.tel || "");
            setFax(newValue.fax || "");
            setEmail(newValue.email || "");
            setWeb(newValue.web || "");
            setVergiNo(newValue.vergiNo || "");
            setVergidairesi(newValue.vergiDairesi || "");
            setTicaretSicilNo(newValue.ticaretSicilNo || "");
        }
    };

    const previewAdminUsers = selectedDenetci?.denetciAdminKullanicilar || [];

    return (
        <Grid container spacing={3}>
            {listError && (
                <Grid size={{ xs: 12 }}>
                    <Alert severity="error">{listError}</Alert>
                </Grid>
            )}

            <Grid size={{ xs: 12 }}>
                <Autocomplete
                    key={autocompleteKey}
                    id="denetci-select"
                    options={denetciler}
                    value={selectedDenetci}
                    isOptionEqualToValue={(option, val) => Number(option.id) === Number(val.id)}
                    loading={isLoadingList}
                    getOptionLabel={(option) =>
                        `${option.firmaUnvani || option.firmaAdi || `Denetçi #${option.id}`} (Eski ID: ${option.id})`
                    }
                    renderOption={(props, option) => {
                        const { key, ...restProps } = props as any;
                        return (
                            <Box component="li" key={option.id} {...restProps}>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" width="100%">
                                    <Typography variant="body2">
                                        {option.firmaUnvani || option.firmaAdi} (Eski ID: {option.id})
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={`${option.denetciAdminSayisi ?? 0} Ana Kullanıcı`}
                                        color={(option.denetciAdminSayisi ?? 0) > 0 ? "primary" : "default"}
                                        variant="outlined"
                                    />
                                </Stack>
                            </Box>
                        );
                    }}
                    onChange={handleDenetciChange}
                    noOptionsText={isLoadingList ? "Yükleniyor..." : "Aktarılacak denetçi bulunamadı"}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Denetçi Seçiniz"
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isLoadingList ? <CircularProgress color="inherit" size={18} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            </Grid>

            {selectedDenetci && (
                <Grid size={{ xs: 12 }}>
                    {previewAdminUsers.length > 0 ? (
                        <Alert severity="info">
                            <Typography variant="subtitle2" gutterBottom>
                                Eski sistemdeki DenetciAdmin (Ana Kullanıcı) hesapları da otomatik aktarılacak ({previewAdminUsers.length} kişi):
                            </Typography>
                            <Stack spacing={0.5}>
                                {previewAdminUsers.map((u) => (
                                    <Typography key={u.id} variant="body2">
                                        • {u.personelAdi || "Adsız"} ({u.email || "e-posta yok"})
                                        {u.aktifPasif === false ? " [Pasif]" : ""}
                                    </Typography>
                                ))}
                            </Stack>
                        </Alert>
                    ) : (
                        <Alert severity="warning">
                            Bu denetçi firması için eski veritabanında DenetciAdmin rolüne sahip ana kullanıcı bulunamadı. Kayıt sonrasında ana kullanıcıyı manuel eklemeniz gerekecektir.
                        </Alert>
                    )}
                </Grid>
            )}

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="firmaAdi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Firma Adı
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="firmaAdi" fullWidth value={firmaAdi} onChange={(e: any) => setFirmaAdi(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="firmaUnvani" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Firma Ünvanı
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="firmaUnvani" fullWidth value={firmaUnvani} onChange={(e: any) => setFirmaUnvani(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="adres" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Adres
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="adres" fullWidth value={adres} onChange={(e: any) => setAdress(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="il" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    İl
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="il" fullWidth value={il} onChange={(e: any) => setIl(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="tel" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Tel
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="tel" fullWidth value={tel} onChange={(e: any) => setTel(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="fax" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Fax
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="fax" fullWidth value={fax} onChange={(e: any) => setFax(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="email" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Email
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="email" fullWidth value={email} onChange={(e: any) => setEmail(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="web" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Web Sitesi
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="web" fullWidth value={web} onChange={(e: any) => setWeb(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="vergiNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Vergi Numarası
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="vergiNo" fullWidth value={vergiNo} onChange={(e: any) => setVergiNo(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="vergiDairesi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Vergi Dairesi
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="vergiDairesi" fullWidth value={vergiDairesi} onChange={(e: any) => setVergidairesi(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="ticaretSicilNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Ticaret Sicil Numarası
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField id="ticaretSicilNo" fullWidth value={ticaretSicilNo} onChange={(e: any) => setTicaretSicilNo(e.target.value)} />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}></Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                        if (!selectedDenetci) {
                            return;
                        }
                        try {
                            setIsSaving(true);

                            const payload: any = {
                                Id: selectedDenetci.id,
                                LegacyOldDbId: selectedDenetci.id,
                                FirmaAdi: firmaAdi || null,
                                FirmaUnvani: firmaUnvani || null,
                                Adres: adres || null,
                                Il: il || null,
                                Tel: tel || null,
                                Fax: fax || null,
                                Email: email || null,
                                Web: web || null,
                                VergiNo: vergiNo || null,
                                VergiDairesi: vergiDairesi || null,
                                TicaretSicilNo: ticaretSicilNo || null,
                                KayitTarihi: selectedDenetci.kayitTarihi || null,
                                ArsivId: selectedDenetci.arsivId || null,
                                Aktifmi: selectedDenetci.aktifmi ?? true,
                                Aciklama: selectedDenetci.aciklama || null,
                            };

                            const token = user?.token || "";
                            const result = await importDenetci(token, payload);
                            if (result.status === "ok") {
                                const importedCount = result.data?.importedAdminUsers ?? 0;
                                const existingCount = result.data?.existingAdminUsers ?? 0;
                                const totalLinked = importedCount + existingCount;
                                const odemeText = result.data?.odemeBilgileriImported
                                    ? " ödeme/kota bilgisiyle"
                                    : "";

                                enqueueSnackbar(
                                    totalLinked > 0
                                        ? `Denetçi${odemeText} ve ${totalLinked} DenetciAdmin (ana kullanıcı) aktarıldı (${importedCount} yeni, ${existingCount} mevcut).`
                                        : `Denetçi${odemeText} aktarıldı (aktarılan ana kullanıcı yok).`,
                                    { variant: "success" }
                                );

                                if (result.data?.skippedUsers && result.data.skippedUsers.length > 0) {
                                    enqueueSnackbar(
                                        `Atlanan kullanıcılar: ${result.data.skippedUsers.join(" | ")}`,
                                        { variant: "warning", autoHideDuration: 8000 }
                                    );
                                }

                                resetForm(payload.Id);
                            } else if (result.status === "already_exists") {
                                enqueueSnackbar(result.message || "Bu denetçi zaten aktarılmış.", {
                                    variant: "info",
                                });
                                resetForm(payload.Id);
                            } else {
                                enqueueSnackbar(
                                    result.message || "Denetçi içe aktarma başarısız oldu.",
                                    { variant: "error" }
                                );
                            }
                        } catch (err: any) {
                            enqueueSnackbar(
                                err?.message || "Denetçi içe aktarma sırasında hata oluştu.",
                                { variant: "error" }
                            );
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                    disabled={isSaving}
                >
                    {isSaving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
            </Grid>
        </Grid>
    );
};

export default DenetciSecimFormu;
