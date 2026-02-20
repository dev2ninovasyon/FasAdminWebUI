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
            alert("Yeni ÅŸifre boÅŸ olamaz.");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            alert("Yeni ÅŸifreler eÅŸleÅŸmiyor.");
            return;
        }

        try {
            const result = await updateKullaniciSifreAdmin(
                user.token || "",
                kullaniciId,
                formData
            );
            if (result) {
                alert("Åifre baÅŸarÄ±yla gÃ¼ncellendi.");
                setFormData({ newPassword: "", confirmPassword: "" });
                onClose();
            } else {
                alert("Åifre gÃ¼ncellenirken bir hata oluÅŸtu.");
            }
        } catch (error) {
            console.error("Hata:", error);
            alert("Bir hata oluÅŸtu.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Åifre DeÄŸiÅŸtir (Admin)</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Yeni Åifre"
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
                            label="Yeni Åifre (Tekrar)"
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
                <Button onClick={onClose}>Ä°ptal</Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    GÃ¼ncelle
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KullaniciSifreDegistirModal;
