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

    useEffect(() => {
        const fetchDenetciler = async () => {
            try {
                console.log("🔄 DenetciSecimFormu: Denetçiler yükleniyor...");
                // ✅ Fetch from public DataTransfer endpoint (no token required)
                const data = await getOldDbDenetciler();
                console.log("✅ DenetciSecimFormu: getOldDbDenetciler sonuç ->", data);
                
                if (Array.isArray(data)) {
                    console.log("📊 DenetciSecimFormu: Denetçi sayısı:", data.length);
                    setDenetciler(data);
                } else {
                    console.warn("⚠️ DenetciSecimFormu: Beklenmeyen veri formatı (array değil):", data);
                    setDenetciler([]);
                }
            } catch (err) {
                console.error("❌ DenetciSecimFormu: fetchDenetciler hata:", err);
                setDenetciler([]);
            }
        };
        // ✅ Public endpoint - fetch on component mount
        console.log("🚀 DenetciSecimFormu: Component mounted, fetching data...");
        fetchDenetciler();
    }, []);

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
                <CustomTextField
                    id="firmaAdi"
                    fullWidth
                    value={firmaAdi}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="firmaUnvani" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Firma Ünvanı
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="firmaUnvani"
                    fullWidth
                    value={firmaUnvani}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="adres" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Adres
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="adres"
                    fullWidth
                    value={adres}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="il" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    İl
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="il"
                    fullWidth
                    value={il}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="tel" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Tel
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="tel"
                    fullWidth
                    value={tel}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="fax" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Fax
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="fax"
                    fullWidth
                    value={fax}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="email" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Email
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="email"
                    fullWidth
                    value={email}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="web" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Web Sitesi
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="web"
                    fullWidth
                    value={web}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="vergiNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Vergi Numarası
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="vergiNo"
                    fullWidth
                    value={vergiNo}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="vergiDairesi" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Vergi Dairesi
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="vergiDairesi"
                    fullWidth
                    value={vergiDairesi}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
                <CustomFormLabel htmlFor="ticaretSicilNo" sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}>
                    Ticaret Sicil Numarası
                </CustomFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <CustomTextField
                    id="ticaretSicilNo"
                    fullWidth
                    value={ticaretSicilNo}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}></Grid>
            <Grid size={{ xs: 12, sm: 9 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={async () => {
                        if (!selectedDenetci) {
                            console.warn("❗ Kaydet: Lütfen kaydetmek için önce bir denetçi seçin.");
                            return;
                        }
                        try {
                            setIsSaving(true);

                            // Map frontend object to backend DTO (PascalCase keys)
                            const payload: any = {
                                Id: selectedDenetci.id ?? selectedDenetci.Id,
                                FirmaAdi: selectedDenetci.firmaAdi || selectedDenetci.FirmaAdi || "",
                                FirmaUnvani: selectedDenetci.firmaUnvani || selectedDenetci.FirmaUnvani || null,
                                Adres: selectedDenetci.adres || selectedDenetci.Adres || null,
                                Il: selectedDenetci.il || selectedDenetci.Il || null,
                                Tel: selectedDenetci.tel || selectedDenetci.Tel || null,
                                Fax: selectedDenetci.fax || selectedDenetci.Fax || null,
                                Email: selectedDenetci.email || selectedDenetci.Email || null,
                                Web: selectedDenetci.web || selectedDenetci.Web || null,
                                VergiNo: selectedDenetci.vergiNo || selectedDenetci.VergiNo || null,
                                VergiDairesi: selectedDenetci.vergiDairesi || selectedDenetci.VergiDairesi || null,
                                TicaretSicilNo: selectedDenetci.ticaretSicilNo || selectedDenetci.TicaretSicilNo || null,
                                KayitTarihi: selectedDenetci.kayitTarihi || selectedDenetci.KayitTarihi || null,
                                ArsivId: selectedDenetci.arsivId || selectedDenetci.ArsivId || null,
                                Aktifmi: selectedDenetci.aktifmi ?? selectedDenetci.Aktifmi ?? true,
                                Aciklama: selectedDenetci.aciklama || selectedDenetci.Aciklama || null,
                            };

                            // token from store (if required for protected endpoint)
                            const token = user?.token || "";
                            const ok = await importDenetci(token, payload);
                            if (ok) {
                                console.log("✅ Kaydet: Denetçi başarıyla yeni DB'ye eklendi (aynı Id ile)");
                                // Optionally navigate back or show notification
                                router.push("/DenetciFirmaIslemleri");
                            } else {
                                console.error("❌ Kaydet: Denetçi içe aktarma başarısız oldu.");
                            }
                        } catch (err) {
                            console.error("❌ Kaydet: Hata oluştu:", err);
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
