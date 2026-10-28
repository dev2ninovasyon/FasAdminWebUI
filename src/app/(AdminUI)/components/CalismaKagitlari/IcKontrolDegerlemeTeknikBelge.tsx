import React, { useEffect, useState } from "react";
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
  aciklama: string;
  deger1: string;
  deger2: string;
  deger3: string;
  deger4: string;
  deger5: string;
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

const IcKontrolDegerlemeTeknikBelge: React.FC<CalismaKagidiProps> = ({
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
  const [selectedAciklama, setSelectedAciklama] = useState("");
  const [selectedDeger1, setSelectedDeger1] = useState("");
  const [selectedDeger2, setSelectedDeger2] = useState("");
  const [selectedDeger3, setSelectedDeger3] = useState("");
  const [selectedDeger4, setSelectedDeger4] = useState("");
  const [selectedDeger5, setSelectedDeger5] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleCreate = async (
    aciklama: string,
    deger1: string,
    deger2: string,
    deger3: string,
    deger4: string,
    deger5: string
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      aciklama: aciklama,
      deger1: deger1,
      deger2: deger2,
      deger3: deger3,
      deger4: deger4,
      deger5: deger5,
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
    aciklama: string,
    deger1: string,
    deger2: string,
    deger3: string,
    deger4: string,
    deger5: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.aciklama = aciklama;
      updatedCalismaKagidiVerisi.deger1 = deger1;
      updatedCalismaKagidiVerisi.deger2 = deger2;
      updatedCalismaKagidiVerisi.deger3 = deger3;
      updatedCalismaKagidiVerisi.deger4 = deger4;
      updatedCalismaKagidiVerisi.deger5 = deger5;

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
          aciklama: veri.aciklama,
          deger1: veri.deger1,
          deger2: veri.deger2,
          deger3: veri.deger3,
          deger4: veri.deger4,
          deger5: veri.deger5,
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
    setSelectedAciklama(veri.aciklama);
    setSelectedDeger1(veri.deger1);
    setSelectedDeger2(veri.deger2);
    setSelectedDeger3(veri.deger3);
    setSelectedDeger4(veri.deger4);
    setSelectedDeger5(veri.deger5);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedAciklama("");
    setSelectedDeger1("");
    setSelectedDeger2("");
    setSelectedDeger3("");
    setSelectedDeger4("");
    setSelectedDeger5("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedAciklama = async (value: string) => {
    setSelectedAciklama(value);
  };

  const handleSetSelectedDeger1 = async (value: string) => {
    setSelectedDeger1(value);
  };

  const handleSetSelectedDeger2 = async (value: string) => {
    setSelectedDeger2(value);
  };

  const handleSetSelectedDeger3 = async (value: string) => {
    setSelectedDeger3(value);
  };

  const handleSetSelectedDeger4 = async (value: string) => {
    setSelectedDeger4(value);
  };

  const handleSetSelectedDeger5 = async (value: string) => {
    setSelectedDeger5(value);
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
                title={`${index + 1}. ${veri.aciklama}`}
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
          aciklama={selectedAciklama}
          deger1={selectedDeger1}
          deger2={selectedDeger2}
          deger3={selectedDeger3}
          deger4={selectedDeger4}
          deger5={selectedDeger5}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedAciklama={handleSetSelectedAciklama}
          handleSetSelectedDeger1={handleSetSelectedDeger1}
          handleSetSelectedDeger2={handleSetSelectedDeger2}
          handleSetSelectedDeger3={handleSetSelectedDeger3}
          handleSetSelectedDeger4={handleSetSelectedDeger4}
          handleSetSelectedDeger5={handleSetSelectedDeger5}
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

export default IcKontrolDegerlemeTeknikBelge;

interface PopUpProps {
  aciklama?: string;
  deger1?: string;
  deger2?: string;
  deger3?: string;
  deger4?: string;
  deger5?: string;

  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;

  handleSetSelectedAciklama: (a: string) => void;
  handleSetSelectedDeger1: (a: string) => void;
  handleSetSelectedDeger2: (a: string) => void;
  handleSetSelectedDeger3: (a: string) => void;
  handleSetSelectedDeger4: (a: string) => void;
  handleSetSelectedDeger5: (a: string) => void;

  handleCreate: (
    aciklama: string,
    deger1: string,
    deger2: string,
    deger3: string,
    deger4: string,
    deger5: string
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    aciklama: string,
    deger1: string,
    deger2: string,
    deger3: string,
    deger4: string,
    deger5: string
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  aciklama,
  deger1,
  deger2,
  deger3,
  deger4,
  deger5,

  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,

  handleSetSelectedAciklama,
  handleSetSelectedDeger1,
  handleSetSelectedDeger2,
  handleSetSelectedDeger3,
  handleSetSelectedDeger4,
  handleSetSelectedDeger5,

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
                Açıklama
              </Typography>
              <CustomTextField
                id="aciklama"
                multiline
                rows={1}
                variant="outlined"
                fullWidth
                value={aciklama}
                InputProps={{
                  style: { padding: 0 }, // Padding değerini sıfırla
                }}
                onChange={(e: any) => handleSetSelectedAciklama(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Teknik 1
              </Typography>
              <CustomTextField
                id="deger1"
                multiline
                rows={1}
                variant="outlined"
                fullWidth
                value={deger1}
                InputProps={{
                  style: { padding: 0 }, // Padding değerini sıfırla
                }}
                onChange={(e: any) => handleSetSelectedDeger1(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Teknik 2
              </Typography>
              <CustomTextField
                id="deger2"
                multiline
                rows={1}
                variant="outlined"
                fullWidth
                value={deger2}
                InputProps={{
                  style: { padding: 0 }, // Padding değerini sıfırla
                }}
                onChange={(e: any) => handleSetSelectedDeger2(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Teknik 3
              </Typography>
              <CustomTextField
                id="deger3"
                multiline
                rows={1}
                variant="outlined"
                fullWidth
                value={deger3}
                InputProps={{
                  style: { padding: 0 }, // Padding değerini sıfırla
                }}
                onChange={(e: any) => handleSetSelectedDeger3(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Teknik 4
              </Typography>
              <CustomTextField
                id="deger4"
                multiline
                rows={1}
                variant="outlined"
                fullWidth
                value={deger4}
                InputProps={{
                  style: { padding: 0 }, // Padding değerini sıfırla
                }}
                onChange={(e: any) => handleSetSelectedDeger4(e.target.value)}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Teknik 5
              </Typography>
              <CustomTextField
                id="deger5"
                multiline
                rows={1}
                variant="outlined"
                fullWidth
                value={deger5}
                InputProps={{
                  style: { padding: 0 }, // Padding değerini sıfırla
                }}
                onChange={(e: any) => handleSetSelectedDeger5(e.target.value)}
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
                    aciklama || "",
                    deger1 || "",
                    deger2 || "",
                    deger3 || "",
                    deger4 || "",
                    deger5 || ""
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
                    aciklama || "",
                    deger1 || "",
                    deger2 || "",
                    deger3 || "",
                    deger4 || "",
                    deger5 || ""
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


