import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import CalismaKagidiTekTarihCard from "./Cards/CalismaKagidiTekTarihCard";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import BelgeKontrolCard from "./Cards/BelgeKontrolCard";
import IslemlerCard from "./Cards/IslemlerCard";
import { useSelector } from "@/store/hooks";
import {
  deleteAllCalismaKagidiVerileri,
  deleteCalismaKagidiVerisiById,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateAllCalismaKagidiVerisi,
  updateCalismaKagidiVerisi,
  updateOtomatikCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { ConfirmPopUpComponent } from "./ConfirmPopUp";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import PersonelBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import { getDenetimDosyaByFormKodu } from "@/api/DenetimDosya/DenetimDosya";
import { FloatingButtonDenetimProgrami } from "./FloatingButtonDenetimProgrami";

interface Veri {
  id: number;
  denetimProgram: string;
  gorevliId: number;
  calismaSuresi: string;
  calismaTakvimi: string;
  ilgiliFormKodlari: string;
  standartMi: boolean;
}

interface Veri2 {
  id: number;
  denetciId: number;
  denetlenenId: number;
  yil: number;
  kullaniciId: number;
  unvanId: number;
  kullaniciAdi: string;
  unvanAdi: string;
  asilYedek: boolean;
  calismaSaati: number;
  saatBasiUcreti: number;
  denetimUcreti: number;
  aktifPasif: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const DenetimProgramiBelge: React.FC<CalismaKagidiProps> = ({
  controller,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [selectedId, setSelectedId] = useState(0);
  const [selectedDenetimProgram, setSelectedDenetimProgram] = useState("");
  const [selectedGorevliId, setSelectedGorevliId] = useState(0);
  const [selectedCalismaSuresi, setSelectedCalismaSuresi] = useState("");
  const [selectedCalismaTakvimi, setSelectedCalismaTakvimi] = useState("");
  const [selectedIlgiliFormKodlari, setSelectedIlgiliFormKodlari] =
    useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [rows, setRows] = useState<Veri2[]>([]);

  const [isAll, setIsAll] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const [warn, setWarn] = useState<boolean>(false);

  const [floatingButtonTiklandimi, setFloatingButtonTiklandimi] =
    useState(false);

  const fetchData = useCallback(async () => {
    try {
      const calismaKagidiVerileri =
        await getCalismaKagidiVerileriByDenetciDenetlenenYil(
          controller || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0
        );

      const rowsAll: any = [];

      const tamamlanan: any[] = [];
      const toplam: any[] = [];

      calismaKagidiVerileri.forEach((veri: any) => {
        const newRow: Veri = {
          id: veri.id,
          denetimProgram: veri.denetimProgram,
          gorevliId: veri.gorevliId,
          calismaSuresi: veri.calismaSuresi,
          calismaTakvimi: veri.calismaTakvimi,
          ilgiliFormKodlari: veri.ilgiliFormKodlari,
          standartMi: veri.standartmi,
        };
        rowsAll.push(newRow);

        if (newRow.standartMi) {
          toplam.push(newRow);
        } else {
          tamamlanan.push(newRow);
          toplam.push(newRow);
        }
      });
      setVeriler(rowsAll);

      setToplam(toplam.length);
      setTamamlanan(tamamlanan.length);
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  }, [controller, user.token, user.denetciId, user.denetlenenId, user.yil, setToplam, setTamamlanan]);

  const fetchData2 = useCallback(async () => {

  }, [user.token, user.denetlenenId, user.yil]);

  const handleUpdate = async (
    denetimProgram: string,
    gorevliId: number,
    calismaSuresi: string,
    calismaTakvimi: string,
    ilgiliFormKodlari: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );

    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.denetimProgram = denetimProgram;
      updatedCalismaKagidiVerisi.gorevliId = gorevliId;
      updatedCalismaKagidiVerisi.calismaSuresi = calismaSuresi;
      updatedCalismaKagidiVerisi.calismaTakvimi = calismaTakvimi;
      updatedCalismaKagidiVerisi.ilgiliFormKodlari = ilgiliFormKodlari;
      if (gorevliId != 0) {
        try {
          const result = await updateCalismaKagidiVerisi(
            controller || "",
            selectedId,
            updatedCalismaKagidiVerisi
          );
          if (result) {
            fetchData();
            handleClosePopUp();
          } else {
            console.log("Çalışma Kağıdı Verisi düzenleme başarısız");
          }
        } catch (error) {
          console.log("Bir hata oluştu:", error);
        }
      }
    }
  };

  const handleUpdateAll = async (
    denetimProgram: string,
    gorevliId: number,
    calismaSuresi: string,
    calismaTakvimi: string,
    ilgiliFormKodlari: string
  ) => {
    const updatedAllCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      denetimProgram: denetimProgram,
      gorevliId: gorevliId,
      ilgiliFormKodlari: ilgiliFormKodlari,
      calismaSuresi: calismaSuresi,
      calismaTakvimi: calismaTakvimi,
    };
    try {
      const result = await updateAllCalismaKagidiVerisi(
        controller || "",
        updatedAllCalismaKagidiVerisi
      );
      if (result) {
        fetchData();
        handleClosePopUp();
        setIsAll(false);
      } else {
        console.log("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleUpdateOtomatik = useCallback(async () => {
    try {
      const result = await updateOtomatikCalismaKagidiVerisi(
        controller || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (result) {
        setWarn(true);
        setFloatingButtonTiklandimi(false);
      } else {
        console.log("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  }, [controller, user.token, user.denetciId, user.denetlenenId, user.yil]);

  const handleDelete = async () => {
    try {
      const result = await deleteCalismaKagidiVerisiById(
        controller || "",
        selectedId
      );
      if (result) {
        fetchData();
        handleClosePopUp();
      } else {
        console.log("Çalışma Kağıdı Verisi silme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleDeleteAll = useCallback(async () => {
    try {
      const result = await deleteAllCalismaKagidiVerileri(
        controller || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (result) {
        fetchData();
      } else {
        console.log("Çalışma Kağıdı Verileri silme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  }, [controller, user.token, user.denetciId, user.denetlenenId, user.yil, fetchData]);



  const handleDagitilanSaat = (kullaniciId: number) => {
    let toplamDakika = 0;

    const kullaniciVerileri = veriler.filter(
      (veri) => veri.gorevliId === kullaniciId && veri.calismaSuresi
    );

    kullaniciVerileri.forEach((veri) => {
      const [saatStr, dakikaStr] = veri.calismaSuresi.split(":");
      const saat = parseInt(saatStr, 10);
      const dakika = parseInt(dakikaStr, 10);
      toplamDakika += saat * 60 + dakika;
    });

    const toplamSaat = Math.floor(toplamDakika / 60);
    const kalanDakika = toplamDakika % 60;

    return `${toplamSaat.toString().padStart(2, "0")}:${kalanDakika
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCardClick = (veri: any) => {
    setSelectedId(veri.id);
    setSelectedDenetimProgram(veri.denetimProgram);
    setSelectedGorevliId(veri.gorevliId);
    setSelectedCalismaSuresi(
      veri.calismaSuresi && veri.calismaSuresi !== ""
        ? veri.calismaSuresi
        : "01:00"
    );
    setSelectedCalismaTakvimi(
      veri.calismaTakvimi && veri.calismaTakvimi !== ""
        ? veri.calismaTakvimi
        : `${user.yil}-03-01`
    );
    setSelectedIlgiliFormKodlari(veri.ilgiliFormKodlari);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleAll = () => {
    setIsAll(true);
    setSelectedDenetimProgram("");
    setSelectedGorevliId(selectedGorevliId);
    setSelectedCalismaSuresi("01:00");
    setSelectedCalismaTakvimi(`${user.yil}-03-01`);
    setSelectedIlgiliFormKodlari("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsAll(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedDenetimProgram = async (value: string) => {
    setSelectedDenetimProgram(value);
  };

  const handleSetSelectedGorevliId = async (value: number) => {
    setSelectedGorevliId(value);
  };

  const handleSetSelectedCalismaSuresi = async (value: string) => {
    setSelectedCalismaSuresi(value);
  };

  const handleSetSelectedCalismaTakvimi = async (value: string) => {
    setSelectedCalismaTakvimi(value);
  };

  const handleSetSelectedIlgiliFormKodlari = async (value: string) => {
    setSelectedIlgiliFormKodlari(value);
  };

  useEffect(() => {
    fetchData();
    fetchData2();
  }, [fetchData, fetchData2]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleDeleteAll();
      setIsClickedVarsayilanaDon(false);
    }
  }, [isClickedVarsayilanaDon, handleDeleteAll, setIsClickedVarsayilanaDon]);

  useEffect(() => {
    if (floatingButtonTiklandimi) {
      handleUpdateOtomatik();
    } else {
      fetchData();
      fetchData2();
    }
  }, [floatingButtonTiklandimi, handleUpdateOtomatik, fetchData, fetchData2]);

  return (
    <>
      <Grid container>
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "center",
          }}
        >
          {rows.length > 0 ? (
            <Grid
              mt="20px"
              size={{
                xs: 12,
                lg: 12
              }}>
              <Paper
                elevation={2}
                sx={{
                  p: 1,
                  mb: 2,
                  borderRadius: 1,
                  backgroundColor: "warning.light",
                }}
              >
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{
                            width: "20%",
                            backgroundColor: "warning.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Personel</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "20%",
                            backgroundColor: "warning.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Ünvan</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "20%",
                            backgroundColor: "warning.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Asil / Yedek</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "20%",
                            backgroundColor: "warning.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Sözleşme Saati</Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: "20%",
                            backgroundColor: "warning.light",
                            borderBottom: 0,
                          }}
                        >
                          <Typography variant="h6">Dağıtılan Saat</Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell align="center" sx={{ border: "none" }}>
                            {row.kullaniciAdi}
                          </TableCell>
                          <TableCell align="center" sx={{ border: "none" }}>
                            {row.unvanAdi}
                          </TableCell>
                          <TableCell align="center" sx={{ border: "none" }}>
                            {row.asilYedek ? "Asil" : "Yedek"}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              border: "none",
                              backgroundColor:
                                row.calismaSaati.toString() <
                                  handleDagitilanSaat(row.kullaniciId)
                                  ? customizer.activeMode == "dark"
                                    ? theme.palette.error.light
                                    : theme.palette.error.main
                                  : "inherit",
                            }}
                          >
                            {row.calismaSaati}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              border: "none",
                              backgroundColor:
                                row.calismaSaati.toString() <
                                  handleDagitilanSaat(row.kullaniciId)
                                  ? customizer.activeMode == "dark"
                                    ? theme.palette.error.light
                                    : theme.palette.error.main
                                  : "inherit",
                            }}
                          >
                            {handleDagitilanSaat(row.kullaniciId)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          ) : (
            <></>
          )}
          <Grid
            my={2}
            size={{
              xs: 12,
              lg: 1.5
            }}>
            <Button
              size="medium"
              variant="outlined"
              color="primary"
              onClick={() => handleAll()}
              sx={{
                width: "100%",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                }}
              >
                Tümünü Tamamla
              </Typography>
            </Button>
          </Grid>
          {veriler.map((veri, index) => (
            <Grid
              key={index}
              mt="20px"
              onClick={() => handleCardClick(veri)}
              size={{
                xs: 12,
                lg: 12
              }}>
              <CalismaKagidiTekTarihCard
                title={`${index + 1}. ${veri.denetimProgram}`}
                date={veri.calismaTakvimi}
                standartMi={veri.standartMi}
              />
            </Grid>
          ))}
        </Grid>
        {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi")) && (
            <Grid
              container
              sx={{
                width: "95%",
                margin: "0 auto",
                justifyContent: "space-between",
              }}
            >
              <Grid
                mt={3}
                size={{
                  xs: 12,
                  md: 3.9,
                  lg: 3.9
                }}>
                <BelgeKontrolCard
                  fetch={fetchData}
                  hazirlayan="Denetçi - Yardımcı Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid
                mt={3}
                size={{
                  xs: 12,
                  md: 3.9,
                  lg: 3.9
                }}>
                <BelgeKontrolCard
                  fetch={fetchData}
                  onaylayan="Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
              <Grid
                mt={3}
                size={{
                  xs: 12,
                  md: 3.9,
                  lg: 3.9
                }}>
                <BelgeKontrolCard
                  fetch={fetchData}
                  kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
            </Grid>
          )}
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Grid
            mt={5}
            size={{
              xs: 12,
              lg: 12
            }}>
            <IslemlerCard controller={controller} />
          </Grid>
        </Grid>
        <FloatingButtonDenetimProgrami
          warn={warn}
          handleClick={() => setFloatingButtonTiklandimi(true)}
        />
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          denetimProgram={selectedDenetimProgram}
          gorevliId={selectedGorevliId}
          calismaSuresi={selectedCalismaSuresi}
          calismaTakvimi={selectedCalismaTakvimi}
          ilgiliFormKodlari={selectedIlgiliFormKodlari}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedDenetimProgram={handleSetSelectedDenetimProgram}
          handleSetSelectedGorevliId={handleSetSelectedGorevliId}
          handleSetSelectedCalismaSuresi={handleSetSelectedCalismaSuresi}
          handleSetSelectedCalismaTakvimi={handleSetSelectedCalismaTakvimi}
          handleSetSelectedIlgiliFormKodlari={
            handleSetSelectedIlgiliFormKodlari
          }
          handleUpdate={handleUpdate}
          handleUpdateAll={handleUpdateAll}
          handleDelete={handleDelete}
          isPopUpOpen={isPopUpOpen}
          isAll={isAll}
        />
      )}
    </>
  );
};

export default DenetimProgramiBelge;

interface PopUpProps {
  denetimProgram?: string;
  gorevliId?: number;
  calismaSuresi?: string;
  calismaTakvimi?: string;
  ilgiliFormKodlari?: string;

  standartMi?: boolean;

  isPopUpOpen: boolean;
  isAll: boolean;

  handleClose: () => void;

  handleSetSelectedDenetimProgram: (a: string) => void;
  handleSetSelectedGorevliId: (a: number) => void;
  handleSetSelectedCalismaSuresi: (a: string) => void;
  handleSetSelectedCalismaTakvimi: (a: string) => void;
  handleSetSelectedIlgiliFormKodlari: (a: string) => void;

  handleUpdate: (
    denetimProgram: string,
    gorevliId: number,
    calismaSuresi: string,
    calismaTakvimi: string,
    ilgiliFormKodlari: string
  ) => void;
  handleUpdateAll: (
    denetimProgram: string,
    gorevliId: number,
    calismaSuresi: string,
    calismaTakvimi: string,
    ilgiliFormKodlari: string
  ) => void;
  handleDelete: () => void;
}

interface Belgeler {
  id: number;
  belgeAdi: string;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  denetimProgram,
  gorevliId,
  calismaSuresi,
  calismaTakvimi,
  ilgiliFormKodlari,

  standartMi,
  isPopUpOpen,
  isAll,
  handleClose,

  handleSetSelectedDenetimProgram,
  handleSetSelectedGorevliId,
  handleSetSelectedCalismaSuresi,
  handleSetSelectedCalismaTakvimi,
  handleSetSelectedIlgiliFormKodlari,

  handleUpdate,
  handleUpdateAll,
  handleDelete,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const formattedCalismaTakvimi = calismaTakvimi
    ? calismaTakvimi.split("T")[0]
    : "";

  const [belgeler, setBelgeler] = useState<Belgeler[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const data = await getDenetimDosyaByFormKodu(user.denetimTuru || "",
        ilgiliFormKodlari || ""
      );
      setBelgeler(data || []); // Store fetched data in state
    } catch (error) {
      console.log("An error occurred:", error);
    }
  }, [user.token, user.denetimTuru, ilgiliFormKodlari]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Dialog fullWidth maxWidth={"md"} open={isPopUpOpen} onClose={handleClose}>
      {isPopUpOpen && (
        <>
          <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Typography variant="h4" py={1} px={3}>
                Düzenle
              </Typography>
              <IconButton size="small" onClick={handleClose}>
                <IconX size="18" />
              </IconButton>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            {!isAll && (
              <Box px={3} pt={3}>
                <Typography variant="h5" p={1}>
                  Denetim Programı
                </Typography>
                <CustomTextField
                  id="denetimProgram"
                  multiline
                  rows={4}
                  variant="outlined"
                  fullWidth
                  value={denetimProgram}
                  onChange={(e: any) =>
                    handleSetSelectedDenetimProgram(e.target.value)
                  }
                />
              </Box>
            )}
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Görevlendirilen Denetçi
              </Typography>
              <PersonelBoxAutocomplete
                initialValue={gorevliId ? gorevliId.toString() : ""}
                tip={"Hazırlayan"}
                onSelectId={(selectedId) =>
                  handleSetSelectedGorevliId(selectedId)
                }
                onSelectAdi={(selectedAdi) =>
                  console.log("Görevlendirilen Denetçi Adı:", selectedAdi)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Çalışma Süresi
              </Typography>
              <CustomTextField
                id="calismaSuresi"
                type="time"
                variant="outlined"
                fullWidth
                value={calismaSuresi}
                onChange={(e: any) => {
                  handleSetSelectedCalismaSuresi(e.target.value);
                }}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Çalışma Takvimi
              </Typography>
              <CustomTextField
                id="calismaTakvimi"
                type="date"
                variant="outlined"
                fullWidth
                value={formattedCalismaTakvimi}
                onChange={(e: any) =>
                  handleSetSelectedCalismaTakvimi(e.target.value)
                }
              />
            </Box>
            {!isAll && (
              <Box px={3} pt={3}>
                <Typography variant="h5" p={1}>
                  İlgili Çalışma Kağıtları
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {belgeler?.map((belge: any) => (
                    <Typography key={belge.id} variant="body1" p={1}>
                      {belge.belgeAdi}
                      {belge.referansNo}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          {!isAll ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(
                    denetimProgram || "",
                    gorevliId || 0,
                    calismaSuresi || "",
                    calismaTakvimi || "",
                    ilgiliFormKodlari || ""
                  )
                }
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleIsConfirm()}
                sx={{ width: "20%" }}
              >
                Sil
              </Button>
            </DialogActions>
          ) : (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdateAll(
                    denetimProgram || "",
                    gorevliId || 0,
                    calismaSuresi || "",
                    calismaTakvimi || "",
                    ilgiliFormKodlari || ""
                  )
                }
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleClose}
                sx={{ width: "20%" }}
              >
                Kapat
              </Button>
            </DialogActions>
          )}
          {isConfirmPopUpOpen && (
            <ConfirmPopUpComponent
              isConfirmPopUp={isConfirmPopUpOpen}
              handleClose={handleClose}
              handleDelete={handleDelete}
            />
          )}
        </>
      )}
    </Dialog>
  );
};


