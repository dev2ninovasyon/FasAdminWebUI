import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import CalismaKagidiCard from "./Cards/CalismaKagidiCard";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import {
  createCalismaKagidiVerisi,
  deleteAllCalismaKagidiVerileri,
  deleteCalismaKagidiVerisiById,
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { ConfirmPopUpComponent } from "./ConfirmPopUp";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";

interface Veri {
  id: number;
  soru: string;
  aciklama: string;
  tur: string;
  iyi: boolean;
  orta: boolean;
  kotu: boolean;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  refresh: boolean;
  controller: string;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const IcKontrolDegerlemeUnsur: React.FC<CalismaKagidiProps> = ({
  refresh,
  controller,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedSoru, setSelectedSoru] = useState("");
  const [selectedAciklama, setSelectedAciklama] = useState("");
  const [selectedTur, setSelectedTur] = useState("");
  const [selectedIyi, setSelectedIyi] = useState(false);
  const [selectedOrta, setSelectedOrta] = useState(false);
  const [selectedKotu, setSelectedKotu] = useState(false);
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleCreate = async (
    soru: string,
    aciklama: string,
    tur: string,
    iyi: boolean,
    orta: boolean,
    kotu: boolean
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      soru: soru,
      aciklama: aciklama,
      tur: tur,
      iyi: iyi,
      orta: orta,
      kotu: kotu,
    };
    try {
      const result = await createCalismaKagidiVerisi(
        controller || "",
        createdCalismaKagidiVerisi
      );
      if (result) {
        fetchData();
        handleClosePopUp();
        setIsNew(false);
      } else {
        console.log("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleUpdate = async (
    soru: string,
    aciklama: string,
    tur: string,
    iyi: boolean,
    orta: boolean,
    kotu: boolean
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.soru = soru;
      updatedCalismaKagidiVerisi.aciklama = aciklama;
      updatedCalismaKagidiVerisi.tur = tur;
      updatedCalismaKagidiVerisi.iyi = iyi;
      updatedCalismaKagidiVerisi.orta = orta;
      updatedCalismaKagidiVerisi.kotu = kotu;

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
  };

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

  const handleDeleteAll = async () => {
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
  };

  const fetchData = async () => {
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
          soru: veri.soru,
          aciklama: veri.aciklama,
          tur: veri.tur,
          iyi: veri.iyi,
          orta: veri.orta,
          kotu: veri.kotu,
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
  };

  const handleCardClick = (veri: any) => {
    setSelectedId(veri.id);
    setSelectedSoru(veri.soru);
    setSelectedAciklama(veri.aciklama);
    setSelectedTur(veri.tur);
    setSelectedIyi(veri.iyi);
    setSelectedOrta(veri.orta);
    setSelectedKotu(veri.kotu);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedSoru("");
    setSelectedAciklama("");
    setSelectedTur("");
    setSelectedIyi(false);
    setSelectedOrta(false);
    setSelectedKotu(false);
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedSoru = async (value: string) => {
    setSelectedSoru(value);
  };

  const handleSetSelectedAciklama = async (value: string) => {
    setSelectedAciklama(value);
  };

  const handleSetSelectedTur = async (value: string) => {
    setSelectedTur(value);
  };

  const handleSetSelectedIyi = async (value: boolean) => {
    setSelectedIyi(value);
  };

  const handleSetSelectedOrta = async (value: boolean) => {
    setSelectedOrta(value);
  };

  const handleSetSelectedKotu = async (value: boolean) => {
    setSelectedKotu(value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleDeleteAll();
      setIsClickedVarsayilanaDon(false);
    }
  }, [isClickedVarsayilanaDon]);

  useEffect(() => {
    if (refresh) {
      fetchData();
    }
  }, [refresh]);

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
          {veriler.map((veri, index) => (
            <Grid
              key={index}
              mt="20px"
              onClick={() => handleCardClick(veri)}
              size={{
                xs: 12,
                lg: 12
              }}>
              <CalismaKagidiCard
                title={`${index + 1}. ${veri.soru}`}
                standartMi={veri.standartMi}
              />
            </Grid>
          ))}
        </Grid>
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "end",
          }}
        >
          <Grid
            my={2}
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
            size={{
              xs: 12,
              lg: 1.5
            }}>
            <Button
              size="medium"
              variant="outlined"
              color="primary"
              onClick={() => handleNew()}
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
                Yeni İşlem Ekle
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          soru={selectedSoru}
          aciklama={selectedAciklama}
          tur={selectedTur}
          iyi={selectedIyi}
          orta={selectedOrta}
          kotu={selectedKotu}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedSoru={handleSetSelectedSoru}
          handleSetSelectedAciklama={handleSetSelectedAciklama}
          handleSetSelectedTur={handleSetSelectedTur}
          handleSetSelectedIyi={handleSetSelectedIyi}
          handleSetSelectedOrta={handleSetSelectedOrta}
          handleSetSelectedKotu={handleSetSelectedKotu}
          handleCreate={handleCreate}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
          isPopUpOpen={isPopUpOpen}
          isNew={isNew}
        />
      )}
    </>
  );
};

export default IcKontrolDegerlemeUnsur;

interface PopUpProps {
  soru?: string;
  aciklama?: string;
  tur?: string;
  iyi?: boolean;
  orta?: boolean;
  kotu?: boolean;

  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;

  handleSetSelectedSoru: (a: string) => void;
  handleSetSelectedAciklama: (a: string) => void;
  handleSetSelectedTur: (a: string) => void;
  handleSetSelectedIyi: (a: boolean) => void;
  handleSetSelectedOrta: (a: boolean) => void;
  handleSetSelectedKotu: (a: boolean) => void;

  handleCreate: (
    soru: string,
    aciklama: string,
    tur: string,
    iyi: boolean,
    orta: boolean,
    kotu: boolean
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    soru: string,
    aciklama: string,
    tur: string,
    iyi: boolean,
    orta: boolean,
    kotu: boolean
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  soru,
  aciklama,
  tur,
  iyi,
  orta,
  kotu,

  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,

  handleSetSelectedSoru,
  handleSetSelectedAciklama,
  handleSetSelectedTur,
  handleSetSelectedIyi,
  handleSetSelectedOrta,
  handleSetSelectedKotu,

  handleCreate,
  handleDelete,
  handleUpdate,
}) => {
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

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
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Soru
              </Typography>
              <CustomTextField
                id="soru"
                multiline
                rows={1}
                variant="outlined"
                fullWidth
                value={soru}
                InputProps={{
                  style: { padding: 0 }, // Padding değerini sıfırla
                }}
                onChange={(e: any) => handleSetSelectedSoru(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Tür
              </Typography>
              <CustomSelect
                labelId="tamOlma"
                id="tamOlma"
                size="small"
                value={tur}
                fullWidth
                onChange={(e: any) => {
                  handleSetSelectedTur(e.target.value);
                }}
                height="36px"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value={"Oylama"}>Oylama</MenuItem>
                <MenuItem value={"Yazı"}>Yazı</MenuItem>
              </CustomSelect>
            </Box>
            {tur == "Oylama" && (
              <Box px={4} pt={4}>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                      lg: 4
                    }}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={{
                          xs: 6,
                          sm: 6,
                          lg: 6
                        }}>
                        <Typography variant="h6">İyi</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={{
                          xs: 6,
                          sm: 6,
                          lg: 6
                        }}>
                        <Checkbox
                          checked={iyi}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedIyi(e.target.checked);
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                      lg: 4
                    }}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        size={{
                          xs: 6,
                          sm: 6,
                          lg: 6
                        }}>
                        <Typography variant="h6">Orta</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        size={{
                          xs: 6,
                          sm: 6,
                          lg: 6
                        }}>
                        <Checkbox
                          checked={orta}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedOrta(e.target.checked);
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                      lg: 4
                    }}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"right"}
                        size={{
                          xs: 6,
                          sm: 6,
                          lg: 6
                        }}>
                        <Typography variant="h6">Kotu</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"right"}
                        size={{
                          xs: 6,
                          sm: 6,
                          lg: 6
                        }}>
                        <Checkbox
                          checked={kotu}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedKotu(e.target.checked);
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}
            {tur == "Yazı" && (
              <Box px={3} pt={3}>
                <Typography variant="h5" p={1}>
                  Açıklama
                </Typography>
                <CustomTextField
                  id="aciklama"
                  multiline
                  rows={8}
                  variant="outlined"
                  fullWidth
                  value={aciklama}
                  InputProps={{
                    style: { padding: 0 }, // Padding değerini sıfırla
                  }}
                  onChange={(e: any) =>
                    handleSetSelectedAciklama(e.target.value)
                  }
                />
              </Box>
            )}
          </DialogContent>
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(
                    soru || "0",
                    aciklama || "0",
                    tur || "0",
                    iyi || false,
                    orta || false,
                    kotu || false
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
                  handleCreate(
                    soru || "0",
                    aciklama || "0",
                    tur || "0",
                    iyi || false,
                    orta || false,
                    kotu || false
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
                Sil
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


