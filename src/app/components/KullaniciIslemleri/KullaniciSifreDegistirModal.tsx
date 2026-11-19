"use client";

import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { updateKullaniciSifreAdminDetayli } from "@/api/KullaniciIslemleri/KullaniciIslemleri";
import PasswordPolicyChecker from "@/components/PasswordPolicy/PasswordPolicyChecker";
import { validatePassword } from "@/utils/passwordPolicy";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
    open: boolean;
    onClose: () => void;
    kullaniciId: number | null;
    kullaniciAdi?: string;
    kullaniciEmail?: string;
}

const KullaniciSifreDegistirModal = ({
    open,
    onClose,
    kullaniciId,
    kullaniciAdi,
    kullaniciEmail,
}: Props) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (open) {
            setFormData({ newPassword: "", confirmPassword: "" });
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            setErrorMessage(null);
            setIsSubmitting(false);
        }
    }, [open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        if (!kullaniciId) return;

        if (!formData.newPassword) {
            setErrorMessage("Yeni şifre boş olamaz.");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setErrorMessage("Yeni şifreler eşleşmiyor.");
            return;
        }

        const policyError = validatePassword(formData.newPassword, kullaniciEmail);
        if (policyError) {
            setErrorMessage(policyError);
            return;
        }

        setErrorMessage(null);
        setIsSubmitting(true);
        try {
            const result = await updateKullaniciSifreAdminDetayli(
                user.token || "",
                kullaniciId,
                formData
            );
            if (result.ok) {
                enqueueSnackbar("Şifre başarıyla güncellendi.", { variant: "success" });
                onClose();
            } else {
                const msg = result.message || "Şifre güncellenirken bir hata oluştu.";
                setErrorMessage(msg);
                enqueueSnackbar(msg, { variant: "error" });
            }
        } catch (error) {
            console.error("Hata:", error);
            const msg = "Şifre güncellenirken bağlantı hatası oluştu.";
            setErrorMessage(msg);
            enqueueSnackbar(msg, { variant: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Şifre Değiştir (Admin)
                {kullaniciAdi || kullaniciEmail ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {kullaniciAdi}
                        {kullaniciEmail ? ` (${kullaniciEmail})` : ""}
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

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Yeni Şifre"
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            edge="end"
                                        >
                                            {showNewPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <PasswordPolicyChecker
                            password={formData.newPassword}
                            email={kullaniciEmail || ""}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Yeni Şifre (Tekrar)"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
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
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={isSubmitting}>
                    İptal
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KullaniciSifreDegistirModal;
