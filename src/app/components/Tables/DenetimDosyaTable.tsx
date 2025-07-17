import React, { use, useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  TablePagination,
} from "@mui/material";
import BlankCard from "@/app/components/Shared/BlankCard";
import {
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { getDosya } from "@/api/DenetimDosyaBelgeleri/DenetimDosyaIslemleri";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface RowData {
  id: number;
  belgeAdi: string;
  bds: string;
  formKodu: string;
  referansNo: string;
  arsivKlasorAdi: string;
}

const DenetimDosyaTable = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<RowData[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default to 10 rows per page

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDuzenle = () => {
    handleClose();
    router.push(`/DenetimDosyaBelgeleri/DosyaDuzenle/${selectedId}`);
  };
  /*
  const handleDelete = async () => {
    handleClose();
    if (selectedId === null) return;

    try {
      const result = await deleteDenetciById(user.token || "", selectedId);
      if (result) {
        fetchData();
      } else {
        console.error("Denetci silinemedi");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };
*/
  const fetchData = async () => {
    try {
      const denetciVerileri = await getDosya(user.token || "");
      const newRows: RowData[] = denetciVerileri.map((dosya: any) => ({
        id: dosya.id, // Assuming there's an 'id' field in the actual entity
        parentId: dosya.parentId,
        dosyaNevi: dosya.dosyaNevi,
        belgeAdi: dosya.belgeAdi,
        bds: dosya.bds,
        formKodu: dosya.formKodu,
        formUrl: dosya.formUrl,
        referansNo: dosya.referansNo,
        arsivKlasorAdi: dosya.arsivKlasorAdi,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    let isMounted = true; // Track if the component is mounted

    const fetchDataAsync = async () => {
      await fetchData();
    };

    fetchDataAsync();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, []);

  // Handle pagination change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <BlankCard>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography textAlign="left" variant="h6">
                  Belge Adı
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  İlgili BDS
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Form Kodu
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Referans No
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Arşiv Klasör Adı
                </Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row: RowData) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>
                    <Typography
                      textAlign="left"
                      variant="subtitle1"
                      color="textSecondary"
                    >
                      {row.belgeAdi}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      textAlign="center"
                      variant="subtitle1"
                      color="textSecondary"
                    >
                      {row.bds}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      textAlign="center"
                      variant="subtitle1"
                      color="textSecondary"
                    >
                      {row.formKodu}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      textAlign="center"
                      variant="subtitle1"
                      color="textSecondary"
                    >
                      {row.referansNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      textAlign="center"
                      variant="subtitle1"
                      color="textSecondary"
                    >
                      {row.arsivKlasorAdi}
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
                      <MenuItem onClick={handleDuzenle}>
                        <ListItemIcon>
                          <IconEdit width={18} />
                        </ListItemIcon>
                        Düzenle
                      </MenuItem>
                      <MenuItem>
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
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </BlankCard>
  );
};

export default DenetimDosyaTable;
