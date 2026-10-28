import { Grid, Button, Autocomplete, TextField } from "@mui/material";
import React, { useState, useEffect } from "react";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { useRouter } from "next/navigation";
import { getDenetciler, getOldDbDenetciler, importDenetci } from "@/api/DenetciIslemleri/DenetciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const DenetciSecimFormu = () => {
    const user = useSelector((state: AppState) => state.userReducer);
    const router = useRouter();

    const [denetciler, setDenetciler] = useState<any[]>([]);
    const [selectedDenetci, setSelectedDenetci] = useState<any | null>(null);

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
        setDenetciler(prev => prev.filter(d => (d.id ?? d.Id) !== savedId));
        setSelectedDenetci(null);
        setFirmaAdi(""); setFirmaUnvani(""); setAdress(""); setIl("");
        setTel(""); setFax(""); setEmail(""); setWeb("");
        setVergiNo(""); setVergidairesi(""); setTicaretSicilNo("");
        setAutocompleteKey(k => k + 1);
    };

    useEffect(() => {
        const fetchDenetciler = async () => {
            try {
                const token = user?.token || "";
                const [oldData, newData] = await Promise.all([
                    getOldDbDenetciler(),
                    getDenetciler(token),
                ]);
                if (Array.isArray(oldData)) {
                    const newIds = new Set(
                        Array.isArray(newData) ? newData.map((d: any) => d.id ?? d.Id) : []
                    );
                    setDenetciler(oldData.filter((d: any) => !newIds.has(d.id ?? d.Id)));
                } else {
                    setDenetciler([]);
                }
            } catch (err) {
                setDenetciler([]);
            }
        };
        fetchDenetciler();
    }, [user]);

    const handleDenetciChange = (event: any, newValue: any) => {
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

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
                <Autocomplete
                    key={autocompleteKey}
                    id="denetci-select"
                    options={denetciler}
                    getOptionLabel={(option) => option.firmaUnvani || option.firmaAdi || ""}
                    onChange={handleDenetciChange}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Denetçi Seçiniz"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
            </Grid>

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
                                Id: selectedDenetci.id ?? selectedDenetci.Id,
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
                                KayitTarihi: selectedDenetci.kayitTarihi || selectedDenetci.KayitTarihi || null,
                                ArsivId: selectedDenetci.arsivId || selectedDenetci.ArsivId || null,
                                Aktifmi: selectedDenetci.aktifmi ?? selectedDenetci.Aktifmi ?? true,
                                Aciklama: selectedDenetci.aciklama || selectedDenetci.Aciklama || null,
                            };

                            const token = user?.token || "";
                            const result = await importDenetci(token, payload);
                            if (result === "ok" || result === "already_exists") {
                                resetForm(payload.Id);
                            } else {
                                console.error("Denetçi içe aktarma başarısız oldu.");
                            }
                        } catch (err) {
                            console.error("Kaydet hatası:", err);
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
