"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import {
    AdminRolOption,
    DEFAULT_ROL_SECENEKLERI,
    createAdminKullanici,
    syncDenetciAdminRoleId,
} from "@/api/KullaniciIslemleri/KullaniciIslemleri";
import PasswordPolicyChecker from "@/components/PasswordPolicy/PasswordPolicyChecker";
import { validatePassword } from "@/utils/passwordPolicy";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
    open: boolean;
    denetciId: number | null;
    firmaAdi?: string;
    unvanSecenekleri: string[];
    rolSecenekleri?: AdminRolOption[];
    defaultIsDenetciAdmin?: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const initialState = (defaultAdmin: boolean) => ({
    personelAdi: "",
    email: "",
    unvani: "",
    bdSicilNo: "",
    tel: "",
    gsm: "",
    personelDosyaArsivId: "",
    legacyOldDbId: "",
    sifre: "",
    aktifPasif: true,
    isDenetciAdmin: defaultAdmin,
    rolIds: defaultAdmin ? [8] : [],
});

const KullaniciEkleModal = ({
    open,
    denetciId,
    firmaAdi,
    unvanSecenekleri,
    rolSecenekleri = DEFAULT_ROL_SECENEKLERI,
    defaultIsDenetciAdmin = false,
    onClose,
    onSuccess,
}: Props) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [formData, setFormData] = useState(() => initialState(defaultIsDenetciAdmin));
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setFormData(initialState(defaultIsDenetciAdmin));
            setShowPassword(false);
            setErrorMessage(null);
            setIsSubmitting(false);
        }
    }, [open, defaultIsDenetciAdmin]);

    const selectedRoles = useMemo(
        () => rolSecenekleri.filter((r) => formData.rolIds.includes(r.id)),
        [rolSecenekleri, formData.rolIds]
    );

    const handleSubmit = async () => {
        if (!denetciId) {
            setErrorMessage("Önce bir denetçi firma seçilmelidir.");
            return;
        }

        const personelAdi = formData.personelAdi.trim();
        const email = formData.email.trim();
        const legacyText = formData.legacyOldDbId.trim();
        const parsedLegacyId = legacyText ? Number(legacyText) : null;

        if (!personelAdi) {
            setErrorMessage("Personel adı zorunludur.");
            return;
        }
        if (!email) {
            setErrorMessage("E-posta adresi zorunludur.");
            return;
        }
        if (legacyText && (!Number.isInteger(parsedLegacyId) || (parsedLegacyId ?? 0) <= 0)) {
            setErrorMessage("Eski Sistem ID pozitif bir tam sayı olmalıdır.");
            return;
        }

        const passwordValidationError = validatePassword(formData.sifre, email);
        if (passwordValidationError) {
            setErrorMessage(passwordValidationError);
            return;
        }

        setErrorMessage(null);
        setIsSubmitting(true);
        try {
            const result = await createAdminKullanici(user.token || "", {
                denetciId,
                personelAdi,
                email,
                unvani: formData.unvani.trim() || undefined,
                bdSicilNo: formData.bdSicilNo.trim() || undefined,
                tel: formData.tel.trim() || undefined,
                gsm: formData.gsm.trim() || undefined,
                personelDosyaArsivId: formData.personelDosyaArsivId.trim() || undefined,
                legacyOldDbId: parsedLegacyId,
                sifre: formData.sifre,
                aktifPasif: formData.aktifPasif,
                isDenetciAdmin: formData.isDenetciAdmin,
                rolIds: formData.rolIds,
            });

            if (result.ok) {
                enqueueSnackbar("Kullanıcı başarıyla oluşturuldu.", { variant: "success" });
                onSuccess();
                onClose();
            } else {
                const msg = result.message || "Kullanıcı oluşturulamadı.";
                setErrorMessage(msg);
                enqueueSnackbar(msg, { variant: "error" });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="md">
            <DialogTitle>
                Yeni Kullanıcı Ekle
                {firmaAdi ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {firmaAdi}
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
                                <TextField {...params} fullWidth label="Ünvan" placeholder="Seçin veya yazın" />
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
                        <TextField
                            fullWidth
                            label="Personel Dosya Arşiv ID"
                            value={formData.personelDosyaArsivId}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, personelDosyaArsivId: e.target.value }))
                            }
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Eski Sistem (Legacy) ID"
                            value={formData.legacyOldDbId}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, legacyOldDbId: e.target.value }))
                            }
                            placeholder="Opsiyonel sayısal kimlik"
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Autocomplete
                            multiple
                            options={rolSecenekleri}
                            value={selectedRoles}
                            getOptionLabel={(option) => option.adi}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(_, newValues) => {
                                const nextIds = newValues.map((v) => v.id);
                                setFormData((prev) => ({
                                    ...prev,
                                    rolIds: nextIds,
                                    isDenetciAdmin: nextIds.includes(8),
                                }));
                            }}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        {...getTagProps({ index })}
                                        key={option.id}
                                        size="small"
                                        label={option.adi}
                                        color={option.id === 8 ? "primary" : "default"}
                                    />
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    label="Firma İçi Roller"
                                    placeholder="Kullanıcıya atanacak rolleri seçin"
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            required
                            label="Şifre"
                            type={showPassword ? "text" : "password"}
                            value={formData.sifre}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, sifre: e.target.value }))
                            }
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            edge="end"
                                        >
                                            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <PasswordPolicyChecker password={formData.sifre} email={formData.email} />
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
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setFormData((prev) => ({
                                                ...prev,
                                                isDenetciAdmin: checked,
                                                rolIds: syncDenetciAdminRoleId(prev.rolIds, checked),
                                            }));
                                        }}
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
                    {isSubmitting ? "Kaydediliyor..." : "Kullanıcıyı Ekle"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KullaniciEkleModal;
