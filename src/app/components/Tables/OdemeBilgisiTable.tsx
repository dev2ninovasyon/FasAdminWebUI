"use client";

import * as React from "react";
import {
  Typography,
  Box,
  Avatar,
  Chip,
  Paper,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react";

function createData(
  denetciAdi?: string,
  basTarihi?: string,
  bitTarihi?: string,
  satisTarihi?: string,
  tutar?: number,
  maxSirket?: number,
  ekKota?: number,
  diskKotasi?: number,
  bobi?: boolean,
  tfrs?: boolean,
  kumi?: boolean,
  calısmaKagidi?: boolean,
  hesaplamalar?: boolean,
  konsolidasyon?: boolean,
  bddk?: boolean,
  enflasyon?: boolean,
  mevcutFirmaSayisi?: number,
  solofirmaSayisi?: number,
  konsolideAnaSirketSayisi?: number,
  konsolideYavruSirketSayisi?: number
) {
  return {
    denetciAdi,
    basTarihi,
    bitTarihi,
    satisTarihi,
    tutar,
    maxSirket,
    ekKota,
    diskKotasi,
    bobi,
    tfrs,
    kumi,
    calısmaKagidi,
    hesaplamalar,
    konsolidasyon,
    bddk,
    enflasyon,
    mevcutFirmaSayisi,
    solofirmaSayisi,
    konsolideAnaSirketSayisi,
    konsolideYavruSirketSayisi,
    history: [
      { date: "2021-02-05", customerId: "5", price: 5, amount: 3 },
      { date: "2021-02-02", customerId: "5", price: 5, amount: 1 },
    ],
  };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open2 = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography textAlign="center" color="textSecondary" variant="h6">
            {row.basTarihi}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography textAlign="center" color="textSecondary" variant="h6">
            {row.bitTarihi}
          </Typography>
        </TableCell>
        {/*
        <TableCell>
        <Chip
            size="small"
            label={row.inventory ? "In Stock" : "Out of Stock"}
            color={row.inventory ? "success" : "error"}
            sx={{ borderRadius: "6px" }}
        />
        </TableCell>
        */}
        <TableCell>
          <Typography
            textAlign="center"
            color="textSecondary"
            variant="h6"
            fontWeight="400"
          >
            {row.satisTarihi}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography textAlign="center" color="textSecondary" fontWeight="400">
            {row.tutar}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography textAlign="center" color="textSecondary" fontWeight="400">
            {row.maxSirket}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography textAlign="center" color="textSecondary" fontWeight="400">
            {row.ekKota}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography textAlign="center" color="textSecondary" fontWeight="400">
            {row.diskKotasi}
          </Typography>
        </TableCell>
        <TableCell>
          <IconButton
            id="basic-button"
            aria-controls={open2 ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open2 ? "true" : undefined}
            onClick={handleClick}
          >
            <IconDotsVertical width={18} />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open2}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem>
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
      <TableRow>
        <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography
                gutterBottom
                variant="h5"
                sx={{
                  mt: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? theme.palette.primary.light
                      : theme.palette.grey.A200,
                  p: "5px 15px",
                  color: (theme) =>
                    `${
                      theme.palette.mode === "dark"
                        ? theme.palette.primary.dark
                        : "rgba(0, 0, 0, 0.87)"
                    }`,
                }}
              >
                Geçmiş Kota Bilgileri
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6">Tarih</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">Önceki Kota</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">Önceki Disk Kotası</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6">Açıklama</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow: any) => (
                    <TableRow key={historyRow.date}>
                      <TableCell>
                        <Typography color="textSecondary" fontWeight="400">
                          {historyRow.date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="textSecondary" fontWeight="400">
                          {historyRow.customerId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography color="textSecondary" fontWeight="400">
                          {historyRow.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600">
                          {Math.round(
                            historyRow.amount * historyRow.price * 100
                          ) / 100}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const rows = [
  createData(
    "Adalya Uluslararası Bağımsız Denetim",
    "29-04-2024",
    "29-04-2024",
    "29-04-2024",
    2000,
    20,
    10,
    20,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    22,
    11,
    5,
    6
  ),
];

const OdemeBilgisiTable = () => {
  return (
    <div>
      <Box mb={3}>
        <Typography variant="h5">
          {rows.map((row) => row.denetciAdi)}
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ marginBottom: 3 }}>
        <Table
          aria-label="collapsible table"
          sx={{
            whiteSpace: {
              xs: "nowrap",
              sm: "unset",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Baş.Tarihi
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Bit. Tarihi
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Satış Tarihi
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Tutar
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Max. Şirket Sayısı
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Ek Kota
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Disk Kotası
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Row key={row.denetciAdi} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.map((row) => (
        <Grid container rowSpacing={3} key={row.denetciAdi}>
          <Grid item xs={12} sm={3} display="flex" alignItems="center">
            <Typography variant="h6">Modüller: {}</Typography>
          </Grid>

          <Grid
            item
            xs={1.5}
            sm={9}
            display="flex"
            alignItems="center"
            justifyContent={"space-between"}
          >
            <Chip
              label={"Bobi"}
              sx={{
                backgroundColor: row.bobi
                  ? (theme) => theme.palette.success.light
                  : (theme) => theme.palette.error.light,
                color: row.bobi
                  ? (theme) => theme.palette.success.main
                  : (theme) => theme.palette.error.main,
              }}
            />
            <Chip
              label={"Tfrs"}
              sx={{
                backgroundColor: row.tfrs
                  ? (theme) => theme.palette.success.light
                  : (theme) => theme.palette.error.light,
                color: row.tfrs
                  ? (theme) => theme.palette.success.main
                  : (theme) => theme.palette.error.main,
              }}
            />
            <Chip
              label={"Kümi"}
              sx={{
                backgroundColor: row.kumi
                  ? (theme) => theme.palette.success.light
                  : (theme) => theme.palette.error.light,
                color: row.kumi
                  ? (theme) => theme.palette.success.main
                  : (theme) => theme.palette.error.main,
              }}
            />
            <Chip
              label={"Çalışma Kağıdı"}
              sx={{
                backgroundColor: row.calısmaKagidi
                  ? (theme) => theme.palette.success.light
                  : (theme) => theme.palette.error.light,
                color: row.calısmaKagidi
                  ? (theme) => theme.palette.success.main
                  : (theme) => theme.palette.error.main,
              }}
            />
            <Chip
              label={"Hesaplamalar"}
              sx={{
                backgroundColor: row.hesaplamalar
                  ? (theme) => theme.palette.success.light
                  : (theme) => theme.palette.error.light,
                color: row.hesaplamalar
                  ? (theme) => theme.palette.success.main
                  : (theme) => theme.palette.error.main,
              }}
            />
            <Chip
              label={"Bddk Analizi"}
              sx={{
                backgroundColor: row.bddk
                  ? (theme) => theme.palette.success.light
                  : (theme) => theme.palette.error.light,
                color: row.bddk
                  ? (theme) => theme.palette.success.main
                  : (theme) => theme.palette.error.main,
              }}
            />
            <Chip
              label={"Konsolidasyon"}
              sx={{
                backgroundColor: row.konsolidasyon
                  ? (theme) => theme.palette.success.light
                  : (theme) => theme.palette.error.light,
                color: row.konsolidasyon
                  ? (theme) => theme.palette.success.main
                  : (theme) => theme.palette.error.main,
              }}
            />
            <Chip
              label={"Enflasyon"}
              sx={{
                backgroundColor: row.enflasyon
                  ? (theme) => theme.palette.success.light
                  : (theme) => theme.palette.error.light,
                color: row.enflasyon
                  ? (theme) => theme.palette.success.main
                  : (theme) => theme.palette.error.main,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} display="flex" alignItems="center">
            <Typography variant="h6">Mevcut Firma Sayısı:</Typography>
          </Grid>
          <Grid item xs={12} sm={9} pl={1.5} display="flex" alignItems="center">
            <Typography variant="h6">{row.mevcutFirmaSayisi}</Typography>
          </Grid>
          <Grid item xs={12} sm={3} display="flex" alignItems="center">
            <Typography variant="h6">Solo Firma Sayısı:</Typography>
          </Grid>
          <Grid item xs={12} sm={9} pl={1.5} display="flex" alignItems="center">
            <Typography variant="h6">{row.solofirmaSayisi}</Typography>
          </Grid>
          <Grid item xs={12} sm={3} display="flex" alignItems="center">
            <Typography variant="h6">Konsolide Ana Şirket Sayısı:</Typography>
          </Grid>
          <Grid item xs={12} sm={9} pl={1.5} display="flex" alignItems="center">
            <Typography variant="h6">{row.konsolideAnaSirketSayisi}</Typography>
          </Grid>
          <Grid item xs={12} sm={3} display="flex" alignItems="center">
            <Typography variant="h6">
              Konsolide Yavru Şirket Firma Sayısı:
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9} pl={1.5} display="flex" alignItems="center">
            <Typography variant="h6">
              {row.konsolideYavruSirketSayisi}
            </Typography>
          </Grid>
        </Grid>
      ))}
    </div>
  );
};
export default OdemeBilgisiTable;
