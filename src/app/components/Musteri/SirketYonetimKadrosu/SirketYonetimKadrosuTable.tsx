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
    deleteSirketYonetimKadrosuById,
    getSirketYonetimKadrosuByDenetlenenId,
} from "@/api/Musteri/MusteriIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BlankCard from "@/app/components/Shared/BlankCard";

const SirketYonetimKadrosuTable = () => {
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
        router.push(
            `/StandartCalismaKagitlari/Musteri/SirketYonetimKadrosu/SirketYonetimKadrosuDuzenle/${selectedId}`
        );
    };

    const handleDelete = async () => {
        handleClose();
        try {
            const result = await deleteSirketYonetimKadrosuById(selectedId || 0
            );
            if (result) {
                fetchData();
            } else {
                console.log("Åirket YÃ¶netim Kadrosu silinemedi");
            }
        } catch (error) {
            console.log("Bir hata oluÅŸtu:", error);
        }
    };

    const [rows, setRows] = useState([]);

    const fetchData = async () => {
        try {
            const SirketYonetimKadrosuVerileri =
                await getSirketYonetimKadrosuByDenetlenenId(0); // Admin panelinde denetlenenId 0

            if (SirketYonetimKadrosuVerileri) {
                const newRows = SirketYonetimKadrosuVerileri.map(
                    (sirketYonetimKadrosu: any) => ({
                        id: sirketYonetimKadrosu.id,
                        uyeAdiSoyadi: sirketYonetimKadrosu.uyeAdiSoyadi,
                        uyeUnvani: sirketYonetimKadrosu.uyeUnvani,
                    })
                );
                setRows(newRows);
            }
        } catch (error) {
            console.log("Bir hata oluÅŸtu:", error);
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
                                <Typography variant="h6">Ãœye AdÄ± SoyadÄ±</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography textAlign="center" variant="h6">
                                    Ãœye ÃœnvanÄ±
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
                                    <Typography variant="h6">{row.uyeAdiSoyadi}</Typography>
                                </TableCell>
                                <TableCell scope="row">
                                    <Typography
                                        textAlign="center"
                                        variant="subtitle1"
                                        color="textSecondary"
                                    >
                                        {row.uyeUnvani}
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
                                            DÃ¼zenle
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

export default SirketYonetimKadrosuTable;
