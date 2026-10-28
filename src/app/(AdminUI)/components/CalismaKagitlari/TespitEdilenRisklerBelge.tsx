import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CalismaKagidiCard from "./Cards/CalismaKagidiCard";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import BelgeKontrolCard from "./Cards/BelgeKontrolCard";
import IslemlerCard from "./Cards/IslemlerCard";
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

interface Veri {
  id: number;
  islem: string;
  tespit: string;
  gerceklik: boolean;
  tamOlma: boolean;
  varOlma: boolean;
  dogrulukDonemsellik: boolean;
  degerleme: boolean;
  siniflama: boolean;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const TespitEdilenRisklerBelge: React.FC<CalismaKagidiProps> = ({
  controller,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedIslem, setSelectedIslem] = useState("0");
  const [selectedTespit, setSelectedTespit] = useState("");
  const [selectedGerceklik, setSelectedGerceklik] = useState(false);
  const [selectedTamOlma, setSelectedTamOlma] = useState(false);
  const [selectedVarOlma, setSelectedVarOlma] = useState(false);
  const [selectedDogrulukDonemsellik, setSelectedDogrulukDonemsellik] =
    useState(false);
  const [selectedDegerleme, setSelectedDegerleme] = useState(false);
  const [selectedSiniflama, setSelectedSiniflama] = useState(false);
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleCreate = async (
    islem: string,
    tespit: string,
    gerceklik: boolean,
    tamOlma: boolean,
    varOlma: boolean,
    dogrulukDonemsellik: boolean,
    degerleme: boolean,
    siniflama: boolean
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      islem: islem,
      tespit: tespit,
      gerceklik: gerceklik,
      tamOlma: tamOlma,
      varOlma: varOlma,
      dogrulukDonemsellik: dogrulukDonemsellik,
      degerleme: degerleme,
      siniflama: siniflama,
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
    islem: string,
    tespit: string,
    gerceklik: boolean,
    tamOlma: boolean,
    varOlma: boolean,
    dogrulukDonemsellik: boolean,
    degerleme: boolean,
    siniflama: boolean
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.islem = islem;
      updatedCalismaKagidiVerisi.tespit = tespit;
      updatedCalismaKagidiVerisi.gerceklik = gerceklik;
      updatedCalismaKagidiVerisi.tamOlma = tamOlma;
      updatedCalismaKagidiVerisi.varOlma = varOlma;
      updatedCalismaKagidiVerisi.dogrulukDonemsellik = dogrulukDonemsellik;
      updatedCalismaKagidiVerisi.degerleme = degerleme;
      updatedCalismaKagidiVerisi.siniflama = siniflama;
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
          islem: veri.islem,
          tespit: veri.tespit,
          gerceklik: veri.gerceklik,
          tamOlma: veri.tamOlma,
          varOlma: veri.varOlma,
          dogrulukDonemsellik: veri.dogrulukDonemsellik,
          degerleme: veri.degerleme,
          siniflama: veri.siniflama,
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
    setSelectedIslem(veri.islem);
    setSelectedTespit(veri.tespit);
    setSelectedGerceklik(veri.gerceklik);
    setSelectedTamOlma(veri.tamOlma);
    setSelectedVarOlma(veri.varOlma);
    setSelectedDogrulukDonemsellik(veri.dogrulukDonemsellik);
    setSelectedDegerleme(veri.degerleme);
    setSelectedSiniflama(veri.siniflama);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedIslem("");
    setSelectedTespit("");
    setSelectedGerceklik(false);
    setSelectedTamOlma(false);
    setSelectedVarOlma(false);
    setSelectedDogrulukDonemsellik(false);
    setSelectedDegerleme(false);
    setSelectedSiniflama(false);
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedIslem = async (value: string) => {
    setSelectedIslem(value);
  };

  const handleSetSelectedTespit = async (value: string) => {
    setSelectedTespit(value);
  };

  const handleSetSelectedGerceklik = async (value: boolean) => {
    setSelectedGerceklik(value);
  };

  const handleSetSelectedTamOlma = async (value: boolean) => {
    setSelectedTamOlma(value);
  };

  const handleSetSelectedVarOlma = async (value: boolean) => {
    setSelectedVarOlma(value);
  };

  const handleSetSelectedDogrulukDonemsellik = async (value: boolean) => {
    setSelectedDogrulukDonemsellik(value);
  };

  const handleSetSelectedDegerleme = async (value: boolean) => {
    setSelectedDegerleme(value);
  };

  const handleSetSelectedSiniflama = async (value: boolean) => {
    setSelectedSiniflama(value);
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
                title={`${index + 1}. ${veri.islem}`}
                content={veri.tespit}
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
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          islem={selectedIslem}
          tespit={selectedTespit}
          gerceklik={selectedGerceklik}
          tamOlma={selectedTamOlma}
          varOlma={selectedVarOlma}
          dogrulukDonemsellik={selectedDogrulukDonemsellik}
          degerleme={selectedDegerleme}
          siniflama={selectedSiniflama}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedIslem={handleSetSelectedIslem}
          handleSetSelectedTespit={handleSetSelectedTespit}
          handleSetSelectedGerceklik={handleSetSelectedGerceklik}
          handleSetSelectedTamOlma={handleSetSelectedTamOlma}
          handleSetSelectedVarOlma={handleSetSelectedVarOlma}
          handleSetSelectedDogrulukDonemsellik={
            handleSetSelectedDogrulukDonemsellik
          }
          handleSetSelectedDegerleme={handleSetSelectedDegerleme}
          handleSetSelectedSiniflama={handleSetSelectedSiniflama}
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

export default TespitEdilenRisklerBelge;

interface PopUpProps {
  islem?: string;
  tespit?: string;
  gerceklik?: boolean;
  tamOlma?: boolean;
  varOlma?: boolean;
  dogrulukDonemsellik?: boolean;
  degerleme?: boolean;
  siniflama?: boolean;

  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;

  handleSetSelectedIslem: (a: string) => void;
  handleSetSelectedTespit: (a: string) => void;
  handleSetSelectedGerceklik: (a: boolean) => void;
  handleSetSelectedTamOlma: (a: boolean) => void;
  handleSetSelectedVarOlma: (a: boolean) => void;
  handleSetSelectedDogrulukDonemsellik: (a: boolean) => void;
  handleSetSelectedDegerleme: (a: boolean) => void;
  handleSetSelectedSiniflama: (a: boolean) => void;
  handleCreate: (
    islem: string,
    tespit: string,
    gerceklik: boolean,
    tamOlma: boolean,
    varOlma: boolean,
    dogrulukDonemsellik: boolean,
    degerleme: boolean,
    siniflama: boolean
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    islem: string,
    tespit: string,
    gerceklik: boolean,
    tamOlma: boolean,
    varOlma: boolean,
    dogrulukDonemsellik: boolean,
    degerleme: boolean,
    siniflama: boolean
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  islem,
  tespit,
  gerceklik,
  tamOlma,
  varOlma,
  dogrulukDonemsellik,
  degerleme,
  siniflama,

  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,

  handleSetSelectedIslem,
  handleSetSelectedTespit,
  handleSetSelectedGerceklik,
  handleSetSelectedTamOlma,
  handleSetSelectedVarOlma,
  handleSetSelectedDogrulukDonemsellik,
  handleSetSelectedDegerleme,
  handleSetSelectedSiniflama,

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
                Tespit Edilen Risk
              </Typography>
              <CustomTextField
                id="islem"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={islem}
                onChange={(e: any) => handleSetSelectedIslem(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Etkilediği Hesap Grubu
              </Typography>
              <CustomTextField
                id="tespit"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={tespit}
                onChange={(e: any) => handleSetSelectedTespit(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
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
                      <Typography variant="h6">Gerçeklik</Typography>
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
                        checked={gerceklik}
                        color="primary"
                        onChange={(e: any) => {
                          handleSetSelectedGerceklik(e.target.checked);
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
                      <Typography variant="h6">Tam Olma</Typography>
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
                        checked={tamOlma}
                        color="primary"
                        onChange={(e: any) => {
                          handleSetSelectedTamOlma(e.target.checked);
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
                      <Typography variant="h6">Var Olma</Typography>
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
                        checked={varOlma}
                        color="primary"
                        onChange={(e: any) => {
                          handleSetSelectedVarOlma(e.target.checked);
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
                      justifyContent={"left"}
                      size={{
                        xs: 6,
                        sm: 6,
                        lg: 6
                      }}>
                      <Typography variant="h6">
                        Doğruluk / Dönemsellik
                      </Typography>
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
                        checked={dogrulukDonemsellik}
                        color="primary"
                        onChange={(e: any) => {
                          handleSetSelectedDogrulukDonemsellik(
                            e.target.checked
                          );
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
                      <Typography variant="h6">Değerleme</Typography>
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
                        checked={degerleme}
                        color="primary"
                        onChange={(e: any) => {
                          handleSetSelectedDegerleme(e.target.checked);
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
                      <Typography variant="h6">Sınıflama</Typography>
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
                        checked={siniflama}
                        color="primary"
                        onChange={(e: any) => {
                          handleSetSelectedSiniflama(e.target.checked);
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(
                    islem || "",
                    tespit || "",
                    gerceklik || false,
                    tamOlma || false,
                    varOlma || false,
                    dogrulukDonemsellik || false,
                    degerleme || false,
                    siniflama || false
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
                    islem || "",
                    tespit || "",
                    gerceklik || false,
                    tamOlma || false,
                    varOlma || false,
                    dogrulukDonemsellik || false,
                    degerleme || false,
                    siniflama || false
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


