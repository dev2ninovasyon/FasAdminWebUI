import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { updateKullaniciSifreAdmin } from "@/api/KullaniciIslemleri/KullaniciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
    open: boolean;
    onClose: () => void;
    kullaniciId: number | null;
}

const KullaniciSifreDegistirModal = ({ open, onClose, kullaniciId }: Props) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.newPassword) {
            alert("Yeni şifre boş olamaz.");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            alert("Yeni şifreler eşleşmiyor.");
            return;
        }

        try {
            const result = await updateKullaniciSifreAdmin(
                user.token || "",
                kullaniciId,
                formData
            );
            if (result) {
                alert("Şifre başarıyla güncellendi.");
                setFormData({ newPassword: "", confirmPassword: "" });
                onClose();
            } else {
                alert("Şifre güncellenirken bir hata oluştu.");
            }
        } catch (error) {
            console.error("Hata:", error);
            alert("Bir hata oluştu.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Şifre Değiştir (Admin)</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 1 }}>
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
                                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <IconEyeOff size="20" /> : <IconEye size="20" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
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
                                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <IconEyeOff size="20" /> : <IconEye size="20" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Güncelle
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KullaniciSifreDegistirModal;
