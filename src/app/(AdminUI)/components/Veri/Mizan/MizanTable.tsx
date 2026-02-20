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
  useMediaQuery,
  Checkbox,
  Button,
  Chip,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import TablePaginationActions from "@/app/components/Shared/TablePaginationActions";
import { ConfirmPopUpComponent } from "@/app/(AdminUI)/components/CalismaKagitlari/ConfirmPopUp";
import {
  deleteMizanBilgisiMultiple,
  getMizanBilgileri,
} from "@/api/Veri/Mizan";

interface Props {
  type: string;
}

interface DosyaType {
  id: number;
  tip: string;
  durum: string;
  baslamaZamani: string;
  bitisZamani: string;
  gecenSure: string;
}

const MizanTable: React.FC<Props> = ({ type }) => {
  const [rows, setRows] = useState<DosyaType[]>([]);

  const user = useSelector((state: AppState) => state.userReducer);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const [selected, setSelected] = useState<number[]>([]);

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };

    // Türkçe karakterleri değiştir
    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    // Tüm boşluk, tab, satır başı/sonu karakterlerini sil
    normalized = normalized.replace(/\s+/g, "");

    // Küçük harfe çevir
    return normalized.toLowerCase();
  }

  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);

  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const handleCloseConfirmPopUp = () => {
    setIsConfirmPopUpOpen(false);
  };

  const fetchData = async () => {
    try {
      const mizanBilgileri = await getMizanBilgileri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        type
      );

      const newRows = mizanBilgileri.map((mizan: DosyaType) => {
        const baslama = new Date(mizan.baslamaZamani);
        const bitis = new Date(
          mizan.bitisZamani ? mizan.bitisZamani : new Date()
        );

        const gecenSureMs = bitis.getTime() - baslama.getTime();

        // Toplam geçen süreyi dakika ve saniye olarak hesapla
        const minutes = Math.floor(gecenSureMs / (1000 * 60)); // Toplam dakika
        const seconds = Math.floor((gecenSureMs % (1000 * 60)) / 1000); // Kalan saniye

        const gecenSure = `${minutes} dakika, ${seconds} saniye`;

        return {
          id: mizan.id,
          tip: mizan.tip,
          durum: mizan.durum,
          baslamaZamani: mizan.baslamaZamani.split("T")[1].split(".")[0],
          bitisZamani: mizan.bitisZamani
            ? mizan.bitisZamani.split("T")[1].split(".")[0]
            : "Devam Ediyor",
          gecenSure: gecenSure,
        };
      });
      setRows(newRows);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    normalizeString(row.tip).includes(normalizeString(searchTerm))
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
      const result = await deleteMizanBilgisiMultiple(selected || 0
      );
      if (result) {
        selected.length = 0;
        fetchData();
      } else {
        console.log("Dosya Bilgileri silinemedi");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center">
        <TextField
          placeholder="Arama"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ margin: "16px" }}
        />
      </Stack>
      <TableContainer
        sx={{
          mt: 0.5,
          paddingX: "16px",
          minHeight: "320px",
          maxHeight: "320px",
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
                <Typography textAlign={"left"} variant="h6">
                  Mizan Türü
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h6">
                  Durum
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h6">
                  Başlangıç
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h6">
                  Bitiş
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign={"center"} variant="h6">
                  Süre
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
                    <Typography
                      textAlign={"left"}
                      variant="h6"
                      color="textSecondary"
                    >
                      {row.tip}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Chip
                      label={row.durum}
                      sx={{
                        backgroundColor:
                          row.durum === "Tamamlandı"
                            ? (theme) => theme.palette.success.light
                            : row.durum === "Oluşturuluyor"
                            ? (theme) => theme.palette.info.light
                            : (theme) => theme.palette.error.light,
                        color:
                          row.durum === "Tamamlandı"
                            ? (theme) => theme.palette.success.main
                            : row.durum === "Oluşturuluyor"
                            ? (theme) => theme.palette.info.main
                            : (theme) => theme.palette.error.main,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography
                      textAlign={"center"}
                      variant="h6"
                      color="textSecondary"
                    >
                      {row.baslamaZamani}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography
                      textAlign={"center"}
                      variant="h6"
                      color="textSecondary"
                    >
                      {row.bitisZamani}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography
                      textAlign={"center"}
                      variant="h6"
                      color="textSecondary"
                    >
                      {row.gecenSure}
                    </Typography>
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
            marginLeft: smDown ? "" : "16px",
            marginY: smDown ? "8px" : "12px",
            bottom: 0,
          }}
        >
          {selected.length} Kayıt Sil
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
              labelRowsPerPage="Sayfa başına satır sayısı:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} arası / ${
                  count !== -1 ? count : `daha fazla`
                } satır`
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

export default MizanTable;


