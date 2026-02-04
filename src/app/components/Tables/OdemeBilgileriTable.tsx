"use client";

import * as React from "react";
import {
  Typography,
  Box,
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
  Menu,
  MenuItem,
  ListItemIcon,
  useTheme,
  Grid,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { IconDotsVertical, IconEdit } from "@tabler/icons-react";
import {
  getDenetciKotaGecmisi,
  getDenetciOdemeBilgileri,
} from "@/api/DenetciIslemleri/DenetciIslemleri";
import { usePathname, useRouter } from "next/navigation";
import ParentCard from "@/app/components/Shared/ParentCard";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface KotaGecmisi {
  id: number;
  tarih: string;
  sirketKota: number;
  diskKota: number;
  enflasyonKota: number;
  ekKota: number;
  aciklama: string;
}

function createData(
  denetciFirmaAdi?: string,
  basTarihi?: string,
  bitTarihi?: string,
  satisTarihi?: string,
  sirketKota?: number,
  diskKota?: number,
  enflasyonKota?: number,
  ekKota?: number,
  bobi?: boolean,
  tfrs?: boolean,
  kumi?: boolean,
  konsolidasyon?: boolean,
  bddk?: boolean,
  enflasyon?: boolean,
  mevcutFirmaSayisi?: number,
  soloFirmaSayisi?: number,
  konsolideAnaFirmaSayisi?: number,
  konsolideYavruFirmaSayisi?: number,
  kotaGecmisi?: KotaGecmisi[]
) {
  return {
    denetciFirmaAdi,
    basTarihi,
    bitTarihi,
    satisTarihi,
    sirketKota,
    diskKota,
    enflasyonKota,
    ekKota,
    bobi,
    tfrs,
    kumi,
    konsolidasyon,
    bddk,
    enflasyon,
    mevcutFirmaSayisi,
    soloFirmaSayisi,
    konsolideAnaFirmaSayisi,
    konsolideYavruFirmaSayisi,
    kotaGecmisi: kotaGecmisi || [],
  };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isAnchorOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { row } = props;

  const [open, setOpen] = React.useState(false);

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("DenetciOdemeBilgileri") + 1;
  const pathId = segments[idIndex];

  const router = useRouter();

  const handleOdemeBilgileriDuzenle = () => {
    router.push(
      `/DenetciFirmaIslemleri/DenetciOdemeBilgileriDuzenle/${pathId}`
    );
  };

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
            {row.sirketKota}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography textAlign="center" color="textSecondary" fontWeight="400">
            {row.diskKota}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography textAlign="center" color="textSecondary" fontWeight="400">
            {row.enflasyonKota}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography textAlign="center" color="textSecondary" fontWeight="400">
            {row.ekKota}
          </Typography>
        </TableCell>
        <TableCell>
          <IconButton
            id="basic-button"
            aria-controls={isAnchorOpen ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={isAnchorOpen ? "true" : undefined}
            onClick={handleClick}
          >
            <IconDotsVertical width={18} />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={isAnchorOpen}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem onClick={() => handleOdemeBilgileriDuzenle()}>
              <ListItemIcon>
                <IconEdit width={18} />
              </ListItemIcon>
              Düzenle
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
                    `${theme.palette.mode === "dark"
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
                      <Typography textAlign="center" variant="h6">
                        Tarih
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography textAlign="center" variant="h6">
                        Önceki Şirket Kotası
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography textAlign="center" variant="h6">
                        Önceki Disk Kotası
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography textAlign="center" variant="h6">
                        Önceki Enflasyon Kotası
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography textAlign="center" variant="h6">
                        Önceki Ek Kota
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography textAlign="center" variant="h6">
                        Açıklama
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.kotaGecmisi.map((kota: any) => (
                    <TableRow key={kota.id}>
                      <TableCell>
                        <Typography
                          textAlign="center"
                          color="textSecondary"
                          fontWeight="400"
                        >
                          {kota.tarih}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          textAlign="center"
                          color="textSecondary"
                          fontWeight="400"
                        >
                          {kota.sirketKota}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          textAlign="center"
                          color="textSecondary"
                          fontWeight="400"
                        >
                          {kota.diskKota}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          textAlign="center"
                          color="textSecondary"
                          fontWeight="400"
                        >
                          {kota.enflasyonKota}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          textAlign="center"
                          color="textSecondary"
                          fontWeight="400"
                        >
                          {kota.ekKota}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          textAlign="center"
                          color="textSecondary"
                          fontWeight="400"
                        >
                          {kota.aciklama}
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

const OdemeBilgileriTable = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const theme = useTheme();

  const pathname = usePathname();
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("DenetciOdemeBilgileri") + 1;
  const pathId = segments[idIndex];

  const [rows, setRows] = React.useState<ReturnType<typeof createData>[]>([]);

  const fetchData = async () => {
    try {
      const denetciOdemeBilgileri = await getDenetciOdemeBilgileri(
        user.token || "",
        pathId
      );
      const denetciKotaGecmisi = await getDenetciKotaGecmisi(
        user.token || "",
        pathId
      );

      const row = createData(
        denetciOdemeBilgileri.denetci.firmaAdi,
        denetciOdemeBilgileri.baslangicTarihi
          .split("T")[0]
          .split("-")
          .reverse()
          .join("."),
        denetciOdemeBilgileri.bitisTarihi
          .split("T")[0]
          .split("-")
          .reverse()
          .join("."),
        denetciOdemeBilgileri.satisTarihi
          .split("T")[0]
          .split("-")
          .reverse()
          .join("."),
        denetciOdemeBilgileri.sirketKota,
        denetciOdemeBilgileri.diskKota,
        denetciOdemeBilgileri.enflasyonKota,
        denetciOdemeBilgileri.ekKota,
        denetciOdemeBilgileri.bobiModulu,
        denetciOdemeBilgileri.tfrsModulu,
        denetciOdemeBilgileri.kumiModulu,
        denetciOdemeBilgileri.konsolideModulu,
        denetciOdemeBilgileri.bddkModulu,
        denetciOdemeBilgileri.enflasyonModulu,
        denetciOdemeBilgileri.mevcutFirmaSayisi,
        denetciOdemeBilgileri.soloFirmaSayisi,
        denetciOdemeBilgileri.konsolideAnaFirmaSayisi,
        denetciOdemeBilgileri.konsolideYavruFirmaSayisi
      );

      row.kotaGecmisi = denetciKotaGecmisi.map((kota: any) => ({
        id: kota.id,
        tarih: kota.tarih.split("T")[0].split("-").reverse().join("."),
        sirketKota: kota.sirketKota,
        diskKota: kota.diskKota,
        enflasyonKota: kota.enflasyonKota,
        ekKota: kota.ekKota,
        aciklama: kota.aciklama,
      }));

      setRows([row]);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <ParentCard title={rows?.[0]?.denetciFirmaAdi ?? "Yükleniyor..."}>
      <>
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
                    Baş. Tarihi
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
                    Şirket Kotası
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography textAlign="center" variant="h6">
                    Disk Kotası
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography textAlign="center" variant="h6">
                    Enflasyon Kotası
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography textAlign="center" variant="h6">
                    Ek Kota
                  </Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <Row key={row.denetciFirmaAdi} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {rows.map((row) => (
          <Grid container rowSpacing={3} key={row.denetciFirmaAdi}>
            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
              <Typography variant="h6">Modüller: { }</Typography>
            </Grid>

            <Grid
              size={{ xs: 1.5, sm: 9 }}
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
                  backgroundColor: theme.palette.success.light,
                  color: theme.palette.success.main,
                }}
              />
              <Chip
                label={"Hesaplamalar"}
                sx={{
                  backgroundColor: theme.palette.success.light,
                  color: theme.palette.success.main,
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

            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
              <Typography variant="h6">Mevcut Firma Sayısı:</Typography>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 9 }}
              pl={1.5}
              display="flex"
              alignItems="center"
            >
              <Typography variant="h6">{row.mevcutFirmaSayisi}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
              <Typography variant="h6">Solo Firma Sayısı:</Typography>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 9 }}
              pl={1.5}
              display="flex"
              alignItems="center"
            >
              <Typography variant="h6">{row.soloFirmaSayisi}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
              <Typography variant="h6">Konsolide Ana Şirket Sayısı:</Typography>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 9 }}
              pl={1.5}
              display="flex"
              alignItems="center"
            >
              <Typography variant="h6">
                {row.konsolideAnaFirmaSayisi}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} display="flex" alignItems="center">
              <Typography variant="h6">
                Konsolide Yavru Şirket Firma Sayısı:
              </Typography>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 9 }}
              pl={1.5}
              display="flex"
              alignItems="center"
            >
              <Typography variant="h6">
                {row.konsolideYavruFirmaSayisi}
              </Typography>
            </Grid>
          </Grid>
        ))}
      </>
    </ParentCard>
  );
};
export default OdemeBilgileriTable;
