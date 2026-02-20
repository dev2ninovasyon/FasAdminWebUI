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
import BlankCard from "@/app/components/Shared/BlankCard";
import {
  IconCash,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import {
  deleteFormatById,
  getFormatlar,
} from "@/api/FormatIslemleri/FormatIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const FormatTable = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };
  const router = useRouter();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDuzenle = () => {
    handleClose();
    router.push(`/Formatlar/FormatDuzenle/${selectedId}`);
  };

  const handleDelete = async () => {
    handleClose();
    try {
      const result = await deleteFormatById(user.token || "", selectedId || 0);
      if (result) {
        fetchData();
      } else {
        console.error("Format silinemedi");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [rows, setRows] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const formatVerileri = await getFormatlar(user.token || "");
      if (formatVerileri && Array.isArray(formatVerileri)) {
        const newRows = formatVerileri.map((format: any) => ({
          id: format.id,
          adi: format.adi,
          satirSayisi: format.satirSayisi,
        }));
        setRows(newRows);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
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
                <Typography variant="h6">Format Adı</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Satır Sayısı
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
                  <Typography variant="h6">{row.adi}</Typography>
                </TableCell>
                <TableCell scope="row">
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.satirSayisi}
                  </Typography>
                </TableCell>

                <TableCell>
                  <IconButton
                    id="basic-button"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={(event) => handleClick(event, row.id)}
                  >
                    <IconDotsVertical width={18} />
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
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

export default FormatTable;
