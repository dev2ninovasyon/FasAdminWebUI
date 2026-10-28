import React, { useEffect, useRef, useState, useCallback } from "react";
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
import { FloatingButtonCalismaKagitlari } from "./FloatingButtonCalismaKagitlari";

interface Veri {
  id: number;
  toplantiTarihi: string;
  toplantiSaati: string;
  toplantiYeri: string;
  toplantiAmaci: string;
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

const HileUsulsuzlukToplantiBilgileriBelge: React.FC<CalismaKagidiProps> = ({
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
  const [selectedToplantiTarihi, setSelectedToplantiTarihi] = useState("");
  const [selectedToplantiSaati, setSelectedToplantiSaati] = useState("");
  const [selectedToplantiYeri, setSelectedToplantiYeri] = useState("");
  const [selectedToplantiAmaci, setSelectedToplantiAmaci] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleCreate = async (
    toplantiTarihi: string,
    toplantiSaati: string,
    toplantiYeri: string,
    toplantiAmaci: string
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      toplantiTarihi: toplantiTarihi,
      toplantiSaati: toplantiSaati,
      toplantiYeri: toplantiYeri,
      toplantiAmaci: toplantiAmaci,
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
    toplantiTarihi: string,
    toplantiSaati: string,
    toplantiYeri: string,
    toplantiAmaci: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.toplantiTarihi = toplantiTarihi;
      updatedCalismaKagidiVerisi.toplantiSaati = toplantiSaati;
      updatedCalismaKagidiVerisi.toplantiYeri = toplantiYeri;
      updatedCalismaKagidiVerisi.toplantiAmaci = toplantiAmaci;

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

      const tamamlanan: any[] = [];
      const toplam: any[] = [];

      calismaKagidiVerileri.forEach((veri: any) => {
        const newRow: Veri = {
          id: veri.id,
          toplantiTarihi: veri.toplantiTarihi,
          toplantiSaati: veri.toplantiSaati,
          toplantiYeri: veri.toplantiYeri,
          toplantiAmaci: veri.toplantiAmaci,
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
    setSelectedToplantiTarihi(veri.toplantiTarihi);
    setSelectedToplantiSaati(veri.toplantiSaati);
    setSelectedToplantiYeri(veri.toplantiYeri);
    setSelectedToplantiAmaci(veri.toplantiAmaci);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedToplantiTarihi("");
    setSelectedToplantiSaati("");
    setSelectedToplantiYeri("");
    setSelectedToplantiAmaci("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedToplantiTarihi = async (toplantiTarihi: any) => {
    setSelectedToplantiTarihi(toplantiTarihi);
  };

  const handleSetSelectedToplantiSaati = async (toplantiSaati: any) => {
    setSelectedToplantiSaati(toplantiSaati);
  };

  const handleSetSelectedToplantiYeri = async (toplantiYeri: any) => {
    setSelectedToplantiYeri(toplantiYeri);
  };

  const handleSetSelectedToplantiAmaci = async (toplantiAmaci: any) => {
    setSelectedToplantiAmaci(toplantiAmaci);
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
                title={`${index + 1}. Toplantı Tarihi, Saati, Yeri ve Amacı`}
                standartMi={veri.standartMi}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          toplantiTarihi={selectedToplantiTarihi}
          toplantiSaati={selectedToplantiSaati}
          toplantiYeri={selectedToplantiYeri}
          toplantiAmaci={selectedToplantiAmaci}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedToplantiTarihi={handleSetSelectedToplantiTarihi}
          handleSetSelectedToplantiSaati={handleSetSelectedToplantiSaati}
          handleSetSelectedToplantiYeri={handleSetSelectedToplantiYeri}
          handleSetSelectedToplantiAmaci={handleSetSelectedToplantiAmaci}
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

export default HileUsulsuzlukToplantiBilgileriBelge;

interface PopUpProps {
  toplantiTarihi?: string;
  toplantiSaati?: string;
  toplantiYeri?: string;
  toplantiAmaci?: string;
  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedToplantiTarihi: (a: string) => void;
  handleSetSelectedToplantiSaati: (a: string) => void;
  handleSetSelectedToplantiYeri: (a: string) => void;
  handleSetSelectedToplantiAmaci: (a: string) => void;
  handleCreate: (
    toplantiTarihi: string,
    toplantiSaati: string,
    toplantiYeri: string,
    toplantiAmaci: string
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    toplantiTarihi: string,
    toplantiSaati: string,
    toplantiYeri: string,
    toplantiAmaci: string
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  toplantiTarihi,
  toplantiSaati,
  toplantiYeri,
  toplantiAmaci,
  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedToplantiTarihi,
  handleSetSelectedToplantiSaati,
  handleSetSelectedToplantiYeri,
  handleSetSelectedToplantiAmaci,
  handleCreate,
  handleDelete,
  handleUpdate,
}) => {
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };
  const formattedToplantiTarihi = toplantiTarihi
    ? toplantiTarihi.split("T")[0]
    : "";

  const textFieldRef = useRef<HTMLInputElement | null>(null);

  const [control, setControl] = useState<string>(toplantiAmaci || "Hayır");

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
                Toplantı Tarihi
              </Typography>
              <CustomTextField
                id="toplantiTarihi"
                type="date"
                variant="outlined"
                fullWidth
                value={formattedToplantiTarihi}
                onChange={(e: any) =>
                  handleSetSelectedToplantiTarihi(e.target.value)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Toplantı Saati
              </Typography>
              <CustomTextField
                id="toplantiSaati"
                type="time"
                variant="outlined"
                fullWidth
                value={toplantiSaati}
                onChange={(e: any) => {
                  handleSetSelectedToplantiSaati(e.target.value);
                }}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Toplantı Yeri
              </Typography>
              <CustomTextField
                id="toplantiYeri"
                multiline
                rows={2}
                variant="outlined"
                fullWidth
                value={toplantiYeri}
                onChange={(e: any) =>
                  handleSetSelectedToplantiYeri(e.target.value)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Toplantı Amacı
              </Typography>
              <CustomTextField
                id="toplantiAmacı"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={toplantiAmaci}
                onChange={(e: any) =>
                  handleSetSelectedToplantiAmaci(e.target.value)
                }
                inputRef={textFieldRef}
              />
            </Box>
          </DialogContent>
          <FloatingButtonCalismaKagitlari
            control={standartMi ? (control1 || control2 ? true : false) : true}
            text={toplantiAmaci}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            handleClick={handleControl1}
            handleSetSelectedText={handleSetSelectedToplantiAmaci}
          />
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(
                    toplantiTarihi || "",
                    toplantiSaati || "",
                    toplantiYeri || "",
                    toplantiAmaci || ""
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
                    toplantiTarihi || "",
                    toplantiSaati || "",
                    toplantiYeri || "",
                    toplantiAmaci || ""
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


