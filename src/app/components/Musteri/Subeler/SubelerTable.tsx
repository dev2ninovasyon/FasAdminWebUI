import React, { useEffect, useState } from "react";
import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Menu,
    MenuItem,
    IconButton,
    ListItemIcon,
} from "@mui/material";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import {
    deleteSubelerById,
    getSubelerByDenetlenenId,
} from "@/api/Musteri/MusteriIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BlankCard from "@/app/components/Shared/BlankCard";

const SubelerTable = () => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const open = Boolean(anchorEl);
    const handleClick = (
        event: React.MouseEvent<HTMLButtonElement>,
        id: number
    ) => {
        setAnchorEl(event.currentTarget);
        setSelectedId(id);
    };

    const router = useRouter();

    const user = useSelector((state: AppState) => state.userReducer);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDuzenle = () => {
        handleClose();
        router.push(`/StandartCalismaKagitlari/Musteri/Subeler/SubeDuzenle/${selectedId}`);
    };

    const handleDelete = async () => {
        handleClose();
        try {
            const result = await deleteSubelerById(selectedId || 0);
            if (result) {
                fetchData();
            } else {
                console.log("Åube silinemedi");
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    const [rows, setRows] = useState([]);

    const fetchData = async () => {
        try {
            const subelerVerileri = await getSubelerByDenetlenenId(0);
            if (subelerVerileri) {
                const newRows = subelerVerileri.map((subeler: any) => ({
                    id: subeler.id,
                    unvan: subeler.unvan,
                    subeAdi: subeler.subeAdi,
                    adres: subeler.adres,
                }));
                setRows(newRows);
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <BlankCard>
            <TableContainer>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="h6">Ünvan</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography textAlign="center" variant="h6">
                                    Åube Adı
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography textAlign="center" variant="h6">
                                    Adres
                                </Typography>
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row: any) => (
                            <TableRow
                                key={row.id}
                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                            >
                                <TableCell>
                                    <Typography variant="h6">{row.unvan}</Typography>
                                </TableCell>
                                <TableCell scope="row">
                                    <Typography
                                        textAlign="center"
                                        variant="subtitle1"
                                        color="textSecondary"
                                    >
                                        {row.subeAdi}
                                    </Typography>
                                </TableCell>
                                <TableCell scope="row">
                                    <Typography
                                        textAlign="center"
                                        variant="subtitle1"
                                        color="textSecondary"
                                    >
                                        {row.adres}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        id="basic-button2"
                                        aria-controls={open ? "basic-menu2" : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={open ? "false" : undefined}
                                        onClick={(event) => handleClick(event, row.id)}
                                    >
                                        <IconDotsVertical width={18} />
                                    </IconButton>
                                    <Menu
                                        id="basic-menu2"
                                        anchorEl={anchorEl}
                                        open={open}
                                        onClose={handleClose}
                                        MenuListProps={{
                                            "aria-labelledby": "basic-button2",
                                        }}
                                    >
                                        <MenuItem onClick={() => handleDuzenle()}>
                                            <ListItemIcon>
                                                <IconEdit width={18} />
                                            </ListItemIcon>
                                            Düzenle
                                        </MenuItem>
                                        <MenuItem onClick={() => handleDelete()}>
                                            <ListItemIcon>
                                                <IconTrash width={18} />
                                            </ListItemIcon>
                                            Sil
                                        </MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </BlankCard>
    );
};

export default SubelerTable;
