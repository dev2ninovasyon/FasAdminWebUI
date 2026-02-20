import React, { useEffect, useState } from "react";
import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Chip,
    IconButton,
    Box,
} from "@mui/material";
import BlankCard from "@/app/components/Shared/BlankCard";
import { IconEdit, IconLock } from "@tabler/icons-react";
import { getKullanicilarByDenetciId } from "@/api/KullaniciIslemleri/KullaniciIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import KullaniciDuzenleModal from "./KullaniciDuzenleModal";
import KullaniciSifreDegistirModal from "./KullaniciSifreDegistirModal";

interface Props {
    denetciId: number | null;
}

const KullaniciTable = ({ denetciId }: Props) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const [rows, setRows] = useState([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const fetchData = async () => {
        if (!denetciId) {
            setRows([]);
            return;
        }
        try {
            const data = await getKullanicilarByDenetciId(user.token || "", denetciId);
            setRows(data || []);
        } catch (error) {
            console.error("Hata:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [denetciId]);

    const handleEdit = (kullanici: any) => {
        setSelectedUser(kullanici);
        setIsModalOpen(true);
    };

    const handlePasswordChange = (kullanici: any) => {
        setSelectedUser(kullanici);
        setIsPasswordModalOpen(true);
    };

    return (
        <Box>
            <BlankCard>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Typography variant="h6">Ad Soyad</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="h6">Unvan</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="h6">Email</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="h6">Telefon</Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="h6">Durum</Typography>
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="subtitle1" color="textSecondary">
                                            {denetciId ? "KullanÄ±cÄ± bulunamadÄ±." : "LÃ¼tfen bir firma seÃ§iniz."}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row: any) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <Typography variant="subtitle1">{row.personelAdi}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">
                                                {row.unvani}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{row.email}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{row.tel || row.gsm}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={row.aktifPasif ? "Aktif" : "Pasif"}
                                                color={row.aktifPasif ? "success" : "error"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handlePasswordChange(row)} title="Åifre DeÄŸiÅŸtir">
                                                <IconLock width={18} />
                                            </IconButton>
                                            <IconButton onClick={() => handleEdit(row)} title="DÃ¼zenle">
                                                <IconEdit width={18} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </BlankCard>

            <KullaniciDuzenleModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                kullanici={selectedUser}
            />

            <KullaniciSifreDegistirModal
                open={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                kullaniciId={selectedUser?.id}
            />
        </Box>
    );
};

export default KullaniciTable;
