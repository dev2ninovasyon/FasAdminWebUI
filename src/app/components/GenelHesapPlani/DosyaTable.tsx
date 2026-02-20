import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TableHead,
  TableFooter,
  TablePagination,
  TextField,
  Box,
  Chip,
  useMediaQuery,
  Checkbox,
  Button,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import TablePaginationActions from "@mui/material/TablePaginationActions";
import { ConfirmPopUpComponent } from "@/app/components/PopUps/ConfirmPopUpComponent";
import {
  deleteDosyaBilgileri,
  getDosyaBilgileri,
} from "@/api/GenelHesapPlani/GenelHesapPlani";

interface Props {
  fileType: string;
  dosyaYuklendiMi: boolean;
  setDosyaYuklendiMi: (deger: boolean) => void;
}

interface DosyaType {
  id: number;
  adi: string;
  olusturulmaTarihi: string;
  durum: string;
}

const DosyaTable: React.FC<Props> = ({
  fileType,
  dosyaYuklendiMi,
  setDosyaYuklendiMi,
}) => {
  const [rows, setRows] = useState<DosyaType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const user = useSelector((state: AppState) => state.userReducer);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selected, setSelected] = useState<number[]>([]);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);

  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const handleCloseConfirmPopUp = () => {
    setIsConfirmPopUpOpen(false);
  };

  const fetchData = async () => {
    try {
      const dosyaBilgileri = await getDosyaBilgileri(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        fileType
      );
      const newRows = dosyaBilgileri.map((dosya: DosyaType) => ({
        id: dosya.id,
        adi: dosya.adi,
        olusturulmaTarihi: dosya.olusturulmaTarihi
          .split("T")[0]
          .split("-")
          .reverse()
          .join("."),
        durum: dosya.durum,
      }));
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluÅŸtu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fileType]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (dosyaYuklendiMi) {
      fetchData();
    } else {
      const intervalId = setInterval(fetchData, 2000);

      return () => clearInterval(intervalId);
    }
  }, [dosyaYuklendiMi]);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = rows.filter((row) =>
    row.adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = filteredRows.map((row) => row.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClickRow = (id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const deleteSelected = async () => {
    try {
      const result = await deleteDosyaBilgileri(
        user.token || "",
        selected || 0
      );
      if (result) {
        selected.length = 0;
        fetchData();
      } else {
        console.error("Dosya Bilgileri silinemedi");
      }
    } catch (error) {
      console.error("Bir hata oluÅŸtu:", error);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center">
        <Box padding={"16px"} width={"100%"}>
          <Typography variant="h5">YÃ¼klenmiÅŸ Dosya Bilgileri</Typography>
        </Box>

        <TextField
          placeholder="Arama"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ marginRight: "16px" }}
        />
      </Stack>
      <TableContainer
        sx={{
          mt: 0.5,
          maxHeight: "425px",
          minHeight: "425px",
        }}
      >
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < filteredRows.length
                  }
                  checked={
                    filteredRows.length > 0 &&
                    selected.length === filteredRows.length
                  }
                  onChange={handleSelectAllClick}
                  inputProps={{ "aria-label": "select all desserts" }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="h5">Dosya AdÄ±</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h5">
                  Tarih
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h5">
                  Durum
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredRows.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              : filteredRows
            ).map((row, index) => {
              const isItemSelected = isSelected(row.id);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  key={index}
                  hover
                  onClick={() => handleClickRow(row.id)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                  tabIndex={-1}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </TableCell>
                  <TableCell scope="row">
                    <Typography variant="h6" color="textSecondary">
                      {fileType == "E-DefterKebir" ||
                        fileType == "E-DefterYevmiye"
                        ? row.adi.split("-").slice(1).join("-")
                        : row.adi}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      textAlign={"center"}
                      variant="h6"
                      color="textSecondary"
                    >
                      {row.olusturulmaTarihi}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Chip
                      label={row.durum}
                      sx={{
                        backgroundColor:
                          row.durum === "TamamlandÄ±"
                            ? (theme) => theme.palette.success.light
                            : row.durum === "Ä°ÅŸleniyor"
                              ? (theme) => theme.palette.info.light
                              : row.durum === "SÄ±raya AlÄ±ndÄ±."
                                ? (theme) => theme.palette.warning.light
                                : (theme) => theme.palette.error.light,
                        color:
                          row.durum === "TamamlandÄ±"
                            ? (theme) => theme.palette.success.main
                            : row.durum === "Ä°ÅŸleniyor"
                              ? (theme) => theme.palette.info.main
                              : row.durum === "SÄ±raya AlÄ±ndÄ±."
                                ? (theme) => theme.palette.warning.main
                                : (theme) => theme.palette.error.main,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {selected.length !== 0 && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => {
            handleIsConfirm();
          }}
          sx={{
            position: smDown ? "relative" : "absolute",
            width: smDown ? "100%" : "auto",
            marginLeft: smDown ? "" : "10px",
            marginY: smDown ? "8px" : "12px",
          }}
        >
          {selected.length} KayÄ±t Sil
        </Button>
      )}
      <Table>
        <TableFooter
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            border: 0,
          }}
        >
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: "Hepsi", value: -1 }]}
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
              labelRowsPerPage="Sayfa baÅŸÄ±na satÄ±r sayÄ±sÄ±:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} arasÄ± / ${count !== -1 ? count : `daha fazla`
                } satÄ±r`
              }
              sx={{ mt: 0.5, mr: "2px", border: 0 }}
            />
          </TableRow>
        </TableFooter>
      </Table>
      {isConfirmPopUpOpen && (
        <ConfirmPopUpComponent
          isConfirmPopUp={isConfirmPopUpOpen}
          handleClose={handleCloseConfirmPopUp}
          handleDelete={deleteSelected}
        />
      )}
    </>
  );
};

export default DosyaTable;
