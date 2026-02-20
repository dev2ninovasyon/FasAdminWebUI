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
    deleteHissedarlarById,
    getHissedarlarByDenetlenenIdYil,
} from "@/api/Musteri/MusteriIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BlankCard from "@/app/components/Shared/BlankCard";

interface Props {
    isClickedMizandanHissedarEkle: boolean;
    setIsClickedMizandanHissedarEkle: (bool: boolean) => void;
}

const HissedarlarTable: React.FC<Props> = ({
    isClickedMizandanHissedarEkle,
    setIsClickedMizandanHissedarEkle,
}) => {
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

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const router = useRouter();

    const user = useSelector((state: AppState) => state.userReducer);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDuzenle = () => {
        handleClose();
        router.push(`/StandartCalismaKagitlari/Musteri/Hissedarlar/HissedarDuzenle/${selectedId}`);
    };

    const handleDelete = async () => {
        handleClose();
        try {
            const result = await deleteHissedarlarById(selectedId || 0);
            if (result) {
                fetchData();
            } else {
                console.log("Hissedar silinemedi");
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    const [rows, setRows] = useState([]);

    const fetchData = async () => {
        try {
            const hissedarlerVerileri = await getHissedarlarByDenetlenenIdYil(0, 0); // Admin panelinde 0,0
            if (hissedarlerVerileri) {
                const newRows = hissedarlerVerileri.map((hissedar: any) => ({
                    id: hissedar.id,
                    hissedarAdi: hissedar.hissedarAdi,
                    hisseTutari: hissedar.hisseTutari,
                    paySayisi: hissedar.paySayisi,
                    hisseOrani: hissedar.hisseOrani,
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

    useEffect(() => {
        if (isClickedMizandanHissedarEkle) {
            fetchData();
            setIsClickedMizandanHissedarEkle(false);
        }
    }, [isClickedMizandanHissedarEkle]);

    return (
        <BlankCard>
            <TableContainer>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography variant="h6">Hissedar Adı</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography textAlign="center" variant="h6">
                                    Hisste Tutarı
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography textAlign="center" variant="h6">
                                    Pay Sayısı
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography textAlign="center" variant="h6">
                                    Hisse Oranı (%)
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
                                    <Typography variant="h6">{row.hissedarAdi}</Typography>
                                </TableCell>
                                <TableCell scope="row">
                                    <Typography
                                        textAlign="center"
                                        variant="subtitle1"
                                        color="textSecondary"
                                    >
                                        {formatNumber(row.hisseTutari)}
                                    </Typography>
                                </TableCell>
                                <TableCell scope="row">
                                    <Typography
                                        textAlign="center"
                                        variant="subtitle1"
                                        color="textSecondary"
                                    >
                                        {row.paySayisi}
                                    </Typography>
                                </TableCell>
                                <TableCell scope="row">
                                    <Typography
                                        textAlign="center"
                                        variant="subtitle1"
                                        color="textSecondary"
                                    >
                                        {formatNumber(row.hisseOrani)}
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

export default HissedarlarTable;
