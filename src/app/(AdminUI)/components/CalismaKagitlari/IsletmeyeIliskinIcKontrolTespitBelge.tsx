import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
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
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";
import { FloatingButtonCalismaKagitlari } from "./FloatingButtonCalismaKagitlari";

interface Veri {
  id: number;
  konu: string;
  islem: string;
  tespit: string;
  durum: string;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const IsletmeyeIliskinIcKontrolTespitBelge: React.FC<CalismaKagidiProps> = ({
  controller,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedKonu, setSelectedKonu] = useState("");
  const [selectedIslem, setSelectedIslem] = useState("");
  const [selectedTespit, setSelectedTespit] = useState("");
  const [selectedDurum, setSelectedDurum] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleCreate = async (
    konu: string,
    islem: string,
    tespit: string,
    durum: string
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      konu: konu,
      islem: islem,
      tespit: tespit,
      durum: durum,
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
    konu: string,
    islem: string,
    tespit: string,
    durum: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.konu = konu;
      updatedCalismaKagidiVerisi.islem = islem;
      updatedCalismaKagidiVerisi.tespit = tespit;
      updatedCalismaKagidiVerisi.durum = durum;

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
      const rowsWithBaslikId: Veri[] = [];
      const rowsWithoutBaslikId: Veri[] = [];

      const tamamlanan: any[] = [];
      const toplam: any[] = [];

      calismaKagidiVerileri.forEach((veri: any) => {
        const newRow: Veri = {
          id: veri.id,
          konu: veri.konu,
          islem: veri.islem,
          tespit: veri.tespit,
          durum: veri.durum ? veri.durum : "Hayır",
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
    setSelectedKonu(veri.konu);
    setSelectedIslem(veri.islem);
    setSelectedTespit(veri.tespit);
    setSelectedDurum(veri.durum);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedKonu("");
    setSelectedIslem("");
    setSelectedTespit("");
    setSelectedDurum("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedKonu = async (konu: any) => {
    setSelectedKonu(konu);
  };

  const handleSetSelectedIslem = async (islem: any) => {
    setSelectedIslem(islem);
  };

  const handleSetSelectedTespit = async (tespit: any) => {
    setSelectedTespit(tespit);
  };

  const handleSetSelectedDurum = async (durum: any) => {
    setSelectedDurum(durum);
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
                title={`${index + 1}. ${veri.konu}`}
                content={veri.islem}
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
          konu={selectedKonu}
          islem={selectedIslem}
          tespit={selectedTespit}
          durum={selectedDurum}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedKonu={handleSetSelectedKonu}
          handleSetSelectedIslem={handleSetSelectedIslem}
          handleSetSelectedTespit={handleSetSelectedTespit}
          handleSetSelectedDurum={handleSetSelectedDurum}
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

export default IsletmeyeIliskinIcKontrolTespitBelge;

interface PopUpProps {
  konu?: string;
  islem?: string;
  tespit?: string;
  durum?: string;
  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedKonu: (a: string) => void;
  handleSetSelectedIslem: (a: string) => void;
  handleSetSelectedTespit: (a: string) => void;
  handleSetSelectedDurum: (a: string) => void;
  handleCreate: (
    konu: string,
    islem: string,
    tespit: string,
    durum: string
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    konu: string,
    islem: string,
    tespit: string,
    durum: string
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  konu,
  islem,
  tespit,
  durum,
  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedKonu,
  handleSetSelectedIslem,
  handleSetSelectedTespit,
  handleSetSelectedDurum,
  handleCreate,
  handleDelete,
  handleUpdate,
}) => {
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const textFieldRef = useRef<HTMLInputElement | null>(null);

  const [control, setControl] = useState<string>(durum || "Hayır");

  const [control1, setControl1] = useState(false);
  const [control2, setControl2] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const handleControl1 = () => {
    if (standartMi) {
      setControl1(true);
    }
  };

  useEffect(() => {
    if (!standartMi) {
      setControl2(true);
    }
  }, [standartMi]);

  useEffect(() => {
    if (isHovered && textFieldRef.current) {
      textFieldRef.current.focus();
    } else if (!isHovered && textFieldRef.current) {
      textFieldRef.current.blur();
    }
  }, [isHovered]);

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
                Konu
              </Typography>
              <CustomTextField
                id="konu"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={konu}
                onChange={(e: any) => handleSetSelectedKonu(e.target.value)}
              />
            </Box>
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
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Yanıt Belirt
              </Typography>
              <CustomSelect
                labelId="durum"
                id="durum"
                size="small"
                value={durum}
                onChange={(e: any) => {
                  handleSetSelectedDurum(e.target.value);
                  setControl(e.target.value);
                }}
                height={"36px"}
                sx={{ width: "100%" }}
              >
                <MenuItem value={"Evet"}>Evet</MenuItem>
                <MenuItem value={"Hayır"}>Hayır</MenuItem>
              </CustomSelect>
            </Box>
            {control == "Evet" && (
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
                  inputRef={textFieldRef}
                />
              </Box>
            )}
          </DialogContent>
          <FloatingButtonCalismaKagitlari
            control={standartMi ? (control1 || control2 ? true : false) : true}
            text={tespit}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            handleClick={handleControl1}
            handleSetSelectedText={handleSetSelectedDurum}
          />
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(
                    konu || "",
                    islem || "",
                    tespit || "",
                    durum || ""
                  )
                }
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>{" "}
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
                    konu || "",
                    islem || "",
                    tespit || "",
                    durum || ""
                  )
                }
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>{" "}
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


