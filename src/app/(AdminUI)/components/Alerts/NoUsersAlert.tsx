import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
} from "@mui/material";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface NoUsersAlertProps {
    open: boolean;
    onClose: () => void;
}

const NoUsersAlert: React.FC<NoUsersAlertProps> = ({ open, onClose }) => {
    const router = useRouter();

    const handleNavigate = () => {
        router.push("/Kullanici/KullaniciIslemleri/KullaniciEkle");
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <IconAlertTriangle size={24} color="orange" />
                    <Typography variant="h6">Kullanıcı Bulunamadı</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    Kullanıcı eklenmemiştir. Devam edebilmek için kullanıcı ekleyiniz.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ padding: 2 }}>
                <Button onClick={onClose} variant="outlined" color="secondary">
                    Kapat
                </Button>
                <Button onClick={handleNavigate} variant="contained" color="primary">
                    Kullanıcı Ekle
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NoUsersAlert;

