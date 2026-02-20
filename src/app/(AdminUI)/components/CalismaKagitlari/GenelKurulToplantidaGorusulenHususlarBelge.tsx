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
  aciklamaIstenenHususlar: string;
  aciklamaTalepEdenler: string;
  aciklamalar: string;
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

const GenelKurulToplantidaGorusulenHususlarBelge: React.FC<
  CalismaKagidiProps
> = ({
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
    const [selectedAciklamaIstenenHususlar, setSelectedAciklamaIstenenHususlar] =
      useState("");
    const [selectedAciklamaTalepEdenler, setSelectedAciklamaTalepEdenler] =
      useState("");
    const [selectedAciklamalar, setSelectedAciklamalar] = useState("");
    const [selectedStandartMi, setSelectedStandartMi] = useState(true);

    const [veriler, setVeriler] = useState<Veri[]>([]);

    const [isNew, setIsNew] = useState(false);

    const [isPopUpOpen, setIsPopUpOpen] = useState(false);

    const handleCreate = async (
      aciklamaIstenenHususlar: string,
      aciklamaTalepEdenler: string,
      aciklamalar: string
    ) => {
      const createdCalismaKagidiVerisi = {
        denetlenenId: user.denetlenenId,
        denetciId: user.denetciId,
        yil: user.yil,
        aciklamaIstenenHususlar: aciklamaIstenenHususlar,
        aciklamaTalepEdenler: aciklamaTalepEdenler,
        aciklamalar: aciklamalar,
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
      aciklamaIstenenHususlar: string,
      aciklamaTalepEdenler: string,
      aciklamalar: string
    ) => {
      const updatedCalismaKagidiVerisi = veriler.find(
        (veri) => veri.id === selectedId
      );
      if (updatedCalismaKagidiVerisi) {
        updatedCalismaKagidiVerisi.aciklamaIstenenHususlar =
          aciklamaIstenenHususlar;
        updatedCalismaKagidiVerisi.aciklamaTalepEdenler = aciklamaTalepEdenler;
        updatedCalismaKagidiVerisi.aciklamalar = aciklamalar;

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
            aciklamaIstenenHususlar: veri.aciklamaIstenenHususlar,
            aciklamaTalepEdenler: veri.aciklamaTalepEdenler,
            aciklamalar: veri.aciklamalar,
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
      setSelectedAciklamaIstenenHususlar(veri.aciklamaIstenenHususlar);
      setSelectedAciklamaTalepEdenler(veri.aciklamaTalepEdenler);
      setSelectedAciklamalar(veri.aciklamalar);
      setSelectedStandartMi(veri.standartMi);
      setIsPopUpOpen(true);
    };

    const handleNew = () => {
      setIsNew(true);
      setSelectedAciklamaIstenenHususlar("");
      setSelectedAciklamaTalepEdenler("");
      setSelectedAciklamalar("");
      setIsPopUpOpen(true);
    };

    const handleClosePopUp = () => {
      setIsNew(false);
      setIsPopUpOpen(false);
    };

    const handleSetSelectedAciklamaIstenenHususlar = async (
      aciklamaIstenenHususlar: any
    ) => {
      setSelectedAciklamaIstenenHususlar(aciklamaIstenenHususlar);
    };

    const handleSetSelectedAciklamaTalepEdenler = async (
      aciklamaTalepEdenler: any
    ) => {
      setSelectedAciklamaTalepEdenler(aciklamaTalepEdenler);
    };

    const handleSetSelectedAciklamalar = async (aciklamalar: any) => {
      setSelectedAciklamalar(aciklamalar);
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
    }, [refresh, fetchData]);

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
                  title={`${index + 1}. ${veri.aciklamaIstenenHususlar} ${veri.aciklamaTalepEdenler
                    }`}
                  content={veri.aciklamalar}
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
            aciklamaIstenenHususlar={selectedAciklamaIstenenHususlar}
            aciklamaTalepEdenler={selectedAciklamaTalepEdenler}
            aciklamalar={selectedAciklamalar}
            standartMi={selectedStandartMi}
            handleClose={handleClosePopUp}
            handleSetSelectedAciklamaIstenenHususlar={
              handleSetSelectedAciklamaIstenenHususlar
            }
            handleSetSelectedAciklamaTalepEdenler={
              handleSetSelectedAciklamaTalepEdenler
            }
            handleSetSelectedAciklamalar={handleSetSelectedAciklamalar}
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

export default GenelKurulToplantidaGorusulenHususlarBelge;

interface PopUpProps {
  aciklamaIstenenHususlar?: string;
  aciklamaTalepEdenler?: string;
  aciklamalar?: string;
  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedAciklamaIstenenHususlar: (a: string) => void;
  handleSetSelectedAciklamaTalepEdenler: (a: string) => void;
  handleSetSelectedAciklamalar: (a: string) => void;
  handleCreate: (
    aciklamaIstenenHususlar: string,
    aciklamaTalepEdenler: string,
    aciklamalar: string
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    aciklamaIstenenHususlar: string,
    aciklamaTalepEdenler: string,
    aciklamalar: string
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  aciklamaIstenenHususlar,
  aciklamaTalepEdenler,
  aciklamalar,
  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedAciklamaIstenenHususlar,
  handleSetSelectedAciklamaTalepEdenler,
  handleSetSelectedAciklamalar,
  handleCreate,
  handleDelete,
  handleUpdate,
}) => {
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const textFieldRef = useRef<HTMLInputElement | null>(null);

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
                Açıklama İstenen Hususlar
              </Typography>
              <CustomTextField
                id="AciklamaIstenenHususlar"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={aciklamaIstenenHususlar}
                onChange={(e: any) =>
                  handleSetSelectedAciklamaIstenenHususlar(e.target.value)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Açıklama Talep Edenler
              </Typography>
              <CustomTextField
                id="aciklamaTalepEdenler"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={aciklamaTalepEdenler}
                onChange={(e: any) =>
                  handleSetSelectedAciklamaTalepEdenler(e.target.value)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Açıklamalar
              </Typography>
              <CustomTextField
                id="aciklamalar"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={aciklamalar}
                onChange={(e: any) =>
                  handleSetSelectedAciklamalar(e.target.value)
                }
                inputRef={textFieldRef}
              />
            </Box>
          </DialogContent>
          <FloatingButtonCalismaKagitlari
            control={standartMi ? (control1 || control2 ? true : false) : true}
            text={aciklamalar}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
            handleClick={handleControl1}
            handleSetSelectedText={handleSetSelectedAciklamalar}
          />
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(
                    aciklamaIstenenHususlar || "",
                    aciklamaTalepEdenler || "",
                    aciklamalar || ""
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
                    aciklamaIstenenHususlar || "",
                    aciklamaTalepEdenler || "",
                    aciklamalar || ""
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


