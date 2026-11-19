"use client";

import React, { useEffect, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { enqueueSnackbar } from "notistack";
import {
    AdminKullaniciDto,
    DEFAULT_UNVAN_SECENEKLERI,
    updateAdminKullanici,
} from "@/api/KullaniciIslemleri/KullaniciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    kullanici: AdminKullaniciDto | any;
    unvanSecenekleri?: string[];
    isLastActiveAdmin?: boolean;
}

const KullaniciDuzenleModal = ({
    open,
    onClose,
    onSuccess,
    kullanici,
    unvanSecenekleri = DEFAULT_UNVAN_SECENEKLERI,
    isLastActiveAdmin = false,
}: Props) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        personelAdi: "",
        email: "",
        unvani: "",
        bdSicilNo: "",
        tel: "",
        gsm: "",
        aktifPasif: true,
        isDenetciAdmin: false,
    });

    useEffect(() => {
        if (open && kullanici) {
            setErrorMessage(null);
            setIsSubmitting(false);
            setFormData({
                personelAdi: kullanici.personelAdi || "",
                email: kullanici.email || "",
                unvani: kullanici.unvani || "",
                bdSicilNo: kullanici.bdSicilNo || "",
                tel: kullanici.tel || "",
                gsm: kullanici.gsm || "",
                aktifPasif: kullanici.aktifPasif !== false,
                isDenetciAdmin: Boolean(kullanici.isDenetciAdmin),
            });
        }
    }, [open, kullanici]);

    const showLastAdminWarning =
        isLastActiveAdmin && (!formData.isDenetciAdmin || !formData.aktifPasif);

    const handleSubmit = async () => {
        if (!kullanici?.id) return;

        const personelAdi = formData.personelAdi.trim();
        const email = formData.email.trim();

        if (!personelAdi) {
            setErrorMessage("Personel adı zorunludur.");
            return;
        }
        if (!email) {
            setErrorMessage("E-posta adresi zorunludur.");
            return;
        }

        setErrorMessage(null);
        setIsSubmitting(true);
        try {
            const result = await updateAdminKullanici(user.token || "", Number(kullanici.id), {
                personelAdi,
                email,
                unvani: formData.unvani.trim() || undefined,
                bdSicilNo: formData.bdSicilNo.trim() || undefined,
                tel: formData.tel.trim() || undefined,
                gsm: formData.gsm.trim() || undefined,
                aktifPasif: formData.aktifPasif,
                isDenetciAdmin: formData.isDenetciAdmin,
            });

            if (result.ok) {
                enqueueSnackbar("Kullanıcı bilgileri güncellendi.", { variant: "success" });
                onSuccess();
                onClose();
            } else {
                const msg = result.message || "Güncelleme sırasında bir hata oluştu.";
                setErrorMessage(msg);
                enqueueSnackbar(msg, { variant: "error" });
            }
        } catch (error) {
            console.error("Hata:", error);
            const msg = "Güncelleme sırasında beklenmeyen bir hata oluştu.";
            setErrorMessage(msg);
            enqueueSnackbar(msg, { variant: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Kullanıcı Düzenle
                {kullanici?.personelAdi ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {kullanici.personelAdi}
                    </Typography>
                ) : null}
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    {errorMessage && (
                        <Grid size={{ xs: 12 }}>
                            <Alert severity="error">{errorMessage}</Alert>
                        </Grid>
                    )}

                    {showLastAdminWarning && (
                        <Grid size={{ xs: 12 }}>
                            <Alert severity="warning">
                                Dikkat: Bu kullanıcı firmanın son aktif DenetciAdmin (Ana Kullanıcı)
                                hesabıdır. Değişikliği kaydederseniz firmada aktif Ana Kullanıcı
                                kalmayacaktır.
                            </Alert>
                        </Grid>
                    )}

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            required
                            label="Personel Adı"
                            value={formData.personelAdi}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, personelAdi: e.target.value }))
                            }
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            required
                            type="email"
                            label="E-posta"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, email: e.target.value }))
                            }
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            freeSolo
                            options={unvanSecenekleri}
                            value={formData.unvani}
                            onInputChange={(_, newValue) =>
                                setFormData((prev) => ({ ...prev, unvani: newValue }))
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth label="Ünvanı" placeholder="Seçin veya yazın" />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="BD Sicil No"
                            value={formData.bdSicilNo}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, bdSicilNo: e.target.value }))
                            }
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Telefon"
                            value={formData.tel}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, tel: e.target.value }))
                            }
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="GSM"
                            value={formData.gsm}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, gsm: e.target.value }))
                            }
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: formData.isDenetciAdmin ? "primary.main" : "divider",
                                bgcolor: (theme) =>
                                    formData.isDenetciAdmin
                                        ? alpha(theme.palette.primary.main, 0.08)
                                        : "transparent",
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isDenetciAdmin}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                isDenetciAdmin: e.target.checked,
                                            }))
                                        }
                                        color="primary"
                                    />
                                }
                                label="Ana Kullanıcı (DenetciAdmin)"
                            />
                            <Typography variant="caption" color="text.secondary" display="block">
                                Firma içi kullanıcı ve yetki yönetimi yapabilir.
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box
                            sx={{
                                p: 1.5,
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.aktifPasif}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                aktifPasif: e.target.checked,
                                            }))
                                        }
                                        color="success"
                                    />
                                }
                                label={formData.aktifPasif ? "Aktif Hesap" : "Pasif Hesap"}
                            />
                            <Typography variant="caption" color="text.secondary" display="block">
                                Pasif hesaplar sisteme giriş yapamaz.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting}>
                    İptal
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KullaniciDuzenleModal;
