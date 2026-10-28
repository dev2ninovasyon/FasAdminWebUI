import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
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
  gonderilenMutabakat: number;
  alinanYanit: number;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const DogrulamaMektuplarinaAlinanYanitlarBelge: React.FC<
  CalismaKagidiProps
> = ({
  controller,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);

    const [selectedId, setSelectedId] = useState(0);
    const [selectedIslem, setSelectedIslem] = useState("");
    const [selectedTespit, setSelectedTespit] = useState("");
    const [selectedGonderilenMutabakat, setSelectedGonderilenMutabakat] =
      useState(0);
    const [selectedAlinanYanitlar, setSelectedAlinanYanitlar] = useState(0);
    const [selectedStandartMi, setSelectedStandartMi] = useState(true);

    const [veriler, setVeriler] = useState<Veri[]>([]);

    const [isNew, setIsNew] = useState(false);

    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

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
            islem: veri.islem,
            tespit: veri.tespit,
            gonderilenMutabakat: veri.gonderilenMutabakat,
            alinanYanit: veri.alinanYanit,
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

    const handleCreate = async (
      islem: string,
      tespit: string,
      gonderilenMutabakat: number,
      alinanYanit: number
    ) => {
      const createdCalismaKagidiVerisi = {
        denetlenenId: user.denetlenenId,
        denetciId: user.denetciId,
        yil: user.yil,
        islem: islem,
        tespit: tespit,
        gonderilenMutabakat: gonderilenMutabakat,
        alinanYanit: alinanYanit,
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
      gonderilenMutabakat: number,
      alinanYanit: number
    ) => {
      const updatedCalismaKagidiVerisi = veriler.find(
        (veri) => veri.id === selectedId
      );
      if (updatedCalismaKagidiVerisi) {
        updatedCalismaKagidiVerisi.islem = islem;
        updatedCalismaKagidiVerisi.tespit = tespit;
        updatedCalismaKagidiVerisi.gonderilenMutabakat = gonderilenMutabakat;
        updatedCalismaKagidiVerisi.alinanYanit = alinanYanit;

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



    const handleCardClick = (veri: any) => {
      setSelectedId(veri.id);
      setSelectedIslem(veri.islem);
      setSelectedTespit(veri.tespit);
      setSelectedGonderilenMutabakat(veri.gonderilenMutabakat);
      setSelectedAlinanYanitlar(veri.alinanYanit);
      setSelectedStandartMi(veri.standartMi);
      setIsPopUpOpen(true);
    };

    const handleNew = () => {
      setIsNew(true);
      setSelectedIslem("");
      setSelectedTespit("");
      setSelectedGonderilenMutabakat(0);
      setSelectedAlinanYanitlar(0);
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

    const handleSetSelectedGonderilenMutabakat = async (value: number) => {
      setSelectedGonderilenMutabakat(value);
    };

    const handleSetAlinanYanitlar = async (value: number) => {
      setSelectedAlinanYanitlar(value);
    };

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    useEffect(() => {
      if (isClickedVarsayilanaDon) {
        handleDeleteAll();
        setIsClickedVarsayilanaDon(false);
      }
    }, [isClickedVarsayilanaDon, handleDeleteAll, setIsClickedVarsayilanaDon]);

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
            gonderilenMutabakat={selectedGonderilenMutabakat}
            alinanYanit={selectedAlinanYanitlar}
            standartMi={selectedStandartMi}
            handleClose={handleClosePopUp}
            handleSetSelectedIslem={handleSetSelectedIslem}
            handleSetSelectedTespit={handleSetSelectedTespit}
            handleSetSelectedGonderilenMutabakat={
              handleSetSelectedGonderilenMutabakat
            }
            handleSetAlinanYanitlar={handleSetAlinanYanitlar}
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

export default DogrulamaMektuplarinaAlinanYanitlarBelge;

interface PopUpProps {
  islem?: string;
  tespit?: string;
  gonderilenMutabakat?: number;
  alinanYanit?: number;

  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;

  handleSetSelectedIslem: (a: string) => void;
  handleSetSelectedTespit: (a: string) => void;
  handleSetSelectedGonderilenMutabakat: (a: number) => void;
  handleSetAlinanYanitlar: (a: number) => void;

  handleCreate: (
    islem: string,
    tespit: string,
    gonderilenMutabakat: number,
    alinanYanit: number
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    islem: string,
    tespit: string,
    gonderilenMutabakat: number,
    alinanYanit: number
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  islem,
  tespit,
  gonderilenMutabakat,
  alinanYanit,

  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,

  handleSetSelectedIslem,
  handleSetSelectedTespit,
  handleSetSelectedGonderilenMutabakat,
  handleSetAlinanYanitlar,

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
                İşlem
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

            <Box px={3} pt={3} display="flex" gap={2}>
              <Box flex={1}>
                <Typography variant="h6" p={1}>
                  Gönderilen Mutabakat
                </Typography>
                <CustomTextField
                  id="gonderilenMutabakat"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={gonderilenMutabakat}
                  onChange={(e: any) =>
                    handleSetSelectedGonderilenMutabakat(
                      parseInt(e.target.value)
                    )
                  }
                />
              </Box>
              <Box flex={1}>
                <Typography variant="h6" p={1}>
                  Alınan Yanıt
                </Typography>
                <CustomTextField
                  id="alinanYanit"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={alinanYanit}
                  onChange={(e: any) =>
                    handleSetAlinanYanitlar(Number(e.target.value))
                  }
                />
              </Box>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Tespit
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
                    gonderilenMutabakat || 0,
                    alinanYanit || 0
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
                    gonderilenMutabakat || 0,
                    alinanYanit || 0
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


