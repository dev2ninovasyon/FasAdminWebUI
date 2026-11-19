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
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import {
    AdminKullaniciDto,
    AdminRolOption,
    DEFAULT_ROL_SECENEKLERI,
    DEFAULT_UNVAN_SECENEKLERI,
    syncDenetciAdminRoleId,
    updateAdminKullanici,
} from "@/api/KullaniciIslemleri/KullaniciIslemleri";
import PasswordPolicyChecker from "@/components/PasswordPolicy/PasswordPolicyChecker";
import { validatePassword } from "@/utils/passwordPolicy";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    kullanici: AdminKullaniciDto | any;
    denetciFirmalar?: any[];
    unvanSecenekleri?: string[];
    rolSecenekleri?: AdminRolOption[];
    isLastActiveAdmin?: boolean;
}

const KullaniciDuzenleModal = ({
    open,
    onClose,
    onSuccess,
    kullanici,
    denetciFirmalar = [],
    unvanSecenekleri = DEFAULT_UNVAN_SECENEKLERI,
    rolSecenekleri = DEFAULT_ROL_SECENEKLERI,
    isLastActiveAdmin = false,
}: Props) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [ayarlarTouched, setAyarlarTouched] = useState(false);

    const [formData, setFormData] = useState({
        denetciId: 0,
        personelAdi: "",
        email: "",
        unvani: "",
        bdSicilNo: "",
        tel: "",
        gsm: "",
        personelDosyaArsivId: "",
        legacyOldDbId: "",
        yeniSifre: "",
        yeniSifreTekrar: "",
        aktifPasif: true,
        isDenetciAdmin: false,
        rolIds: [] as number[],
        kurulumTamamlandi: false,
        turTamamlandi: false,
    });

    useEffect(() => {
        if (open && kullanici) {
            setErrorMessage(null);
            setIsSubmitting(false);
            setShowPassword(false);
            setShowConfirmPassword(false);
            setAyarlarTouched(false);

            const initialRolIds: number[] = Array.isArray(kullanici.rolIds)
                ? kullanici.rolIds.map((id: any) => Number(id)).filter((id: number) => id > 0 && id !== 1)
                : kullanici.isDenetciAdmin
                  ? [8]
                  : [];

            setFormData({
                denetciId: Number(kullanici.denetciId || 0),
                personelAdi: kullanici.personelAdi || "",
                email: kullanici.email || "",
                unvani: kullanici.unvani || "",
                bdSicilNo: kullanici.bdSicilNo || "",
                tel: kullanici.tel || "",
                gsm: kullanici.gsm || "",
                personelDosyaArsivId: kullanici.personelDosyaArsivId || "",
                legacyOldDbId:
                    kullanici.legacyOldDbId !== null && kullanici.legacyOldDbId !== undefined
                        ? String(kullanici.legacyOldDbId)
                        : "",
                yeniSifre: "",
                yeniSifreTekrar: "",
                aktifPasif: kullanici.aktifPasif !== false,
                isDenetciAdmin: Boolean(kullanici.isDenetciAdmin || initialRolIds.includes(8)),
                rolIds: initialRolIds,
                kurulumTamamlandi: Boolean(kullanici.kurulumTamamlandi),
                turTamamlandi: Boolean(kullanici.turTamamlandi),
            });
        }
    }, [open, kullanici]);

    const firmOptions = useMemo(() => {
        if (!kullanici?.denetciId) return denetciFirmalar;
        const exists = denetciFirmalar.some(
            (f) => Number(f.id ?? f.Id) === Number(kullanici.denetciId)
        );
        if (exists) return denetciFirmalar;
        return [
            {
                id: kullanici.denetciId,
                firmaAdi: kullanici.denetciFirmaAdi || `Denetçi Firma #${kullanici.denetciId}`,
            },
            ...denetciFirmalar,
        ];
    }, [denetciFirmalar, kullanici]);

    const selectedFirmOption = useMemo(
        () => firmOptions.find((f) => Number(f.id ?? f.Id) === Number(formData.denetciId)) || null,
        [firmOptions, formData.denetciId]
    );

    const selectedRoles = useMemo(
        () => rolSecenekleri.filter((r) => formData.rolIds.includes(r.id)),
        [rolSecenekleri, formData.rolIds]
    );

    const hasPlatformAdminBadge = useMemo(
        () =>
            Array.isArray(kullanici?.roller) &&
            kullanici.roller.some((r: string) => r === "FasAdmin"),
        [kullanici]
    );

    const showLastAdminWarning =
        isLastActiveAdmin && (!formData.isDenetciAdmin || !formData.aktifPasif);

    const isFirmChanged =
        Boolean(kullanici?.denetciId) &&
        formData.denetciId > 0 &&
        Number(formData.denetciId) !== Number(kullanici.denetciId);

    const hasPasswordInput = formData.yeniSifre.length > 0 || formData.yeniSifreTekrar.length > 0;

    const handleSubmit = async () => {
        if (!kullanici?.id) return;

        const personelAdi = formData.personelAdi.trim();
        const email = formData.email.trim();
        const legacyText = formData.legacyOldDbId.trim();
        const parsedLegacyId = legacyText ? Number(legacyText) : null;

        if (!formData.denetciId || formData.denetciId <= 0) {
            setErrorMessage("Geçerli bir denetçi firma seçilmelidir.");
            return;
        }
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

        if (hasPasswordInput) {
            if (!formData.yeniSifre) {
                setErrorMessage("Yeni şifre boş olamaz.");
                return;
            }
            if (formData.yeniSifre !== formData.yeniSifreTekrar) {
                setErrorMessage("Yeni şifreler eşleşmiyor.");
                return;
            }
            const policyError = validatePassword(formData.yeniSifre, email);
            if (policyError) {
                setErrorMessage(policyError);
                return;
            }
        }

        const hadLegacyId =
            kullanici.legacyOldDbId !== null && kullanici.legacyOldDbId !== undefined;
        const shouldSendAyarlar =
            ayarlarTouched ||
            (kullanici.kurulumTamamlandi !== null && kullanici.kurulumTamamlandi !== undefined) ||
            (kullanici.turTamamlandi !== null && kullanici.turTamamlandi !== undefined);

        setErrorMessage(null);
        setIsSubmitting(true);
        try {
            const result = await updateAdminKullanici(user.token || "", Number(kullanici.id), {
                denetciId: formData.denetciId,
                personelAdi,
                email,
                unvani: formData.unvani.trim() || undefined,
                bdSicilNo: formData.bdSicilNo.trim() || undefined,
                tel: formData.tel.trim() || undefined,
                gsm: formData.gsm.trim() || undefined,
                personelDosyaArsivId: formData.personelDosyaArsivId.trim() || undefined,
                legacyOldDbId: parsedLegacyId,
                clearLegacyOldDbId: hadLegacyId && !legacyText,
                yeniSifre: hasPasswordInput ? formData.yeniSifre : undefined,
                yeniSifreTekrar: hasPasswordInput ? formData.yeniSifreTekrar : undefined,
                aktifPasif: formData.aktifPasif,
                isDenetciAdmin: formData.isDenetciAdmin,
                rolIds: formData.rolIds,
                kurulumTamamlandi: shouldSendAyarlar ? formData.kurulumTamamlandi : undefined,
                turTamamlandi: shouldSendAyarlar ? formData.turTamamlandi : undefined,
            });

            if (result.ok) {
                enqueueSnackbar(
                    isFirmChanged
                        ? "Kullanıcı bilgileri güncellendi ve seçilen denetçi firmaya aktarıldı."
                        : "Kullanıcı bilgileri güncellendi.",
                    { variant: "success" }
                );
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
        <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Box>
                        <Typography variant="h6" component="span">
                            Kullanıcı Düzenle
                        </Typography>
                        {kullanici?.personelAdi ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                {kullanici.personelAdi} (#{kullanici.id})
                            </Typography>
                        ) : null}
                    </Box>
                    {hasPlatformAdminBadge ? (
                        <Chip label="Platform FasAdmin Rolü Korunuyor" size="small" color="secondary" />
                    ) : null}
                </Stack>
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

                    {isFirmChanged && (
                        <Grid size={{ xs: 12 }}>
                            <Alert severity="info">
                                Bu kullanıcıyı kaydettiğinizde seçilen yeni denetçi firmaya
                                aktarılacaktır.
                            </Alert>
                        </Grid>
                    )}

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="primary">
                            Firma ve Profil Bilgileri
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Autocomplete
                            options={firmOptions}
                            value={selectedFirmOption}
                            onChange={(_, newValue) => {
                                if (newValue) {
                                    setFormData((prev) => ({
                                        ...prev,
                                        denetciId: Number(newValue.id ?? newValue.Id ?? 0),
                                    }));
                                }
                            }}
                            getOptionLabel={(option) => {
                                const adi = option?.firmaAdi || option?.FirmaAdi || "";
                                const vkn = option?.vergiNo || option?.VergiNo || "";
                                return vkn ? `${adi} (VKN: ${vkn})` : adi;
                            }}
                            isOptionEqualToValue={(option, value) =>
                                Number(option?.id ?? option?.Id) === Number(value?.id ?? value?.Id)
                            }
                            renderInput={(params) => (
                                <TextField {...params} fullWidth required label="Bağlı Denetçi Firma" />
                            )}
                        />
                    </Grid>

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
                        <TextField
                            fullWidth
                            label="Personel Dosya Arşiv ID"
                            value={formData.personelDosyaArsivId}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    personelDosyaArsivId: e.target.value,
                                }))
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
                            placeholder="Boş bırakılırsa kaldırılır"
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 0.5 }} />
                        <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mt: 1 }}>
                            Yetki, Roller ve Hesap Ayarları
                        </Typography>
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
                                    placeholder="Rol ekleyin veya kaldırın"
                                />
                            )}
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

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.kurulumTamamlandi}
                                    onChange={(e) => {
                                        setAyarlarTouched(true);
                                        setFormData((prev) => ({
                                            ...prev,
                                            kurulumTamamlandi: e.target.checked,
                                        }));
                                    }}
                                />
                            }
                            label="Kurulum Sihirbazı Tamamlandı"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.turTamamlandi}
                                    onChange={(e) => {
                                        setAyarlarTouched(true);
                                        setFormData((prev) => ({
                                            ...prev,
                                            turTamamlandi: e.target.checked,
                                        }));
                                    }}
                                />
                            }
                            label="Tanıtım Turu Tamamlandı"
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ my: 0.5 }} />
                        <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mt: 1 }}>
                            Şifre Güncelleme (Opsiyonel)
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: hasPasswordInput ? 6 : 12 }}>
                        <TextField
                            fullWidth
                            label="Yeni Şifre"
                            placeholder="Değiştirmek istemiyorsanız boş bırakın"
                            type={showPassword ? "text" : "password"}
                            value={formData.yeniSifre}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, yeniSifre: e.target.value }))
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
                    </Grid>

                    {hasPasswordInput && (
                        <>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Yeni Şifre (Tekrar)"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.yeniSifreTekrar}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            yeniSifreTekrar: e.target.value,
                                        }))
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() =>
                                                        setShowConfirmPassword((prev) => !prev)
                                                    }
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? (
                                                        <IconEyeOff size={20} />
                                                    ) : (
                                                        <IconEye size={20} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <PasswordPolicyChecker
                                    password={formData.yeniSifre}
                                    email={formData.email}
                                />
                            </Grid>
                        </>
                    )}
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
