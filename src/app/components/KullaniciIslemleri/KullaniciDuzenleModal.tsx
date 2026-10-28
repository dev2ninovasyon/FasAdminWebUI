import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { updateKullanici } from "@/api/KullaniciIslemleri/KullaniciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    kullanici: any;
}

const KullaniciDuzenleModal = ({ open, onClose, onSuccess, kullanici }: Props) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [formData, setFormData] = useState<any>({
        unvani: "",
        personelAdi: "",
        tel: "",
        gsm: "",
        bdSicilNo: "",
        email: "",
        aktifPasif: true,
    });

    useEffect(() => {
        if (kullanici) {
            setFormData({
                unvani: kullanici.unvani || "",
                personelAdi: kullanici.personelAdi || "",
                tel: kullanici.tel || "",
                gsm: kullanici.gsm || "",
                bdSicilNo: kullanici.bdSicilNo || "",
                email: kullanici.email || "",
                aktifPasif: kullanici.aktifPasif !== false,
            });
        }
    }, [kullanici]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const result = await updateKullanici(
                user.token || "",
                kullanici.id,
                formData
            );
            if (result) {
                onSuccess();
                onClose();
            } else {
                alert("Güncelleme sırasında bir hata oluştu.");
            }
        } catch (error) {
            console.error("Hata:", error);
            alert("Bir hata oluştu.");
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Personel Adı"
                            name="personelAdi"
                            value={formData.personelAdi}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Unvanı"
                            name="unvani"
                            value={formData.unvani}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="BD Sicil No"
                            name="bdSicilNo"
                            value={formData.bdSicilNo}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="Telefon"
                            name="tel"
                            value={formData.tel}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            label="GSM"
                            name="gsm"
                            value={formData.gsm}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="aktifPasif"
                                    checked={formData.aktifPasif}
                                    onChange={handleChange}
                                />
                            }
                            label="Aktif"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Kaydet
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KullaniciDuzenleModal;
