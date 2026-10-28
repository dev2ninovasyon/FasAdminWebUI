import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CalismaKagidiCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/CalismaKagidiCard";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { ConfirmPopUpComponent } from "@/app/(AdminUI)/components/CalismaKagitlari/ConfirmPopUp";
import {
  createCalismaKagidiVerisi,
  deleteAllCalismaKagidiVerileriByDipnotNo,
  deleteCalismaKagidiVerisiById,
  getCalismaKagidiVerileriByDenetciDenetlenenYilDipnotNo,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { useTheme } from "@mui/material/styles";

interface Veri {
  id: number;
  dipnotNo: string;
  baslik: string;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
  dipnotNo: string;
  isReport?: boolean;
}

const UygulananDenetimTeknikleri: React.FC<CalismaKagidiProps> = ({
  controller,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
  dipnotNo,
  isReport,
}) => {
  const theme = useTheme();
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedDipnotNo, setSelectedDipnotNo] = useState("");
  const [selectedBaslik, setSelectedBaslik] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleCreate = async (dipnotNo: string, baslik: string) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      dipnotNo: dipnotNo,
      baslik: baslik,
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

  const handleUpdate = async (dipnotNo: string, baslik: string) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.dipnotNo = dipnotNo;
      updatedCalismaKagidiVerisi.baslik = baslik;

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
      const result = await deleteAllCalismaKagidiVerileriByDipnotNo(
        controller || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        selectedDipnotNo || ""
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
        await getCalismaKagidiVerileriByDenetciDenetlenenYilDipnotNo(
          controller || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          dipnotNo || ""
        );

      const rowsAll: any = [];
      const tamamlanan: any[] = [];
      const toplam: any[] = [];

      calismaKagidiVerileri.forEach((veri: any) => {
        const newRow: Veri = {
          id: veri.id,
          dipnotNo: veri.dipnotNo,
          baslik: veri.baslik,
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
    setSelectedDipnotNo(veri.dipnotNo);
    setSelectedBaslik(veri.baslik);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedDipnotNo(dipnotNo);
    setSelectedBaslik("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedDipnotNo = async (dipnotNo: any) => {
    setSelectedDipnotNo(dipnotNo);
  };

  const handleSetSelectedBaslik = async (baslik: any) => {
    setSelectedBaslik(baslik);
  };

  useEffect(() => {
    if (dipnotNo.length > 0) {
      fetchData();
    }
  }, [dipnotNo]);

  useEffect(() => {
    if (isClickedVarsayilanaDon) {
      handleDeleteAll();
      setIsClickedVarsayilanaDon(false);
    }
  }, [isClickedVarsayilanaDon]);

  return (
    <Box>
      <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
        Uygulanan Denetim Teknikleri
      </Typography>
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}>
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
                onClick={() => !isReport && handleCardClick(veri)}
                sx={{ cursor: isReport ? "default" : "pointer" }}
                size={{
                  xs: 12,
                  lg: 12
                }}>
                <CalismaKagidiCard
                  title={`${index + 1}. ${veri.baslik}`}
                  standartMi={veri.standartMi}
                />
              </Grid>
            ))}
          </Grid>
          {!isReport && (
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
                    Yeni Teknik Ekle
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          )}

        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          dipnotNo={selectedDipnotNo}
          baslik={selectedBaslik}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedDipnotNo={handleSetSelectedDipnotNo}
          handleSetSelectedBaslik={handleSetSelectedBaslik}
          handleCreate={handleCreate}
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
          isPopUpOpen={isPopUpOpen}
          isNew={isNew}
        />
      )}
    </Box>
  );
};

export default UygulananDenetimTeknikleri;

interface PopUpProps {
  dipnotNo?: string;
  baslik?: string;
  standartMi?: boolean;
  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedDipnotNo: (a: string) => void;
  handleSetSelectedBaslik: (a: string) => void;
  handleCreate: (dipnotNo: string, baslik: string) => void;
  handleDelete: () => void;
  handleUpdate: (dipnotNo: string, baslik: string) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  dipnotNo,
  baslik,
  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedDipnotNo,
  handleSetSelectedBaslik,
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
              <CustomTextField
                id="baslik"
                multiline
                rows={1}
                variant="outlined"
                fullWidth
                value={baslik}
                InputProps={{
                  style: { padding: 0 }, // Padding değerini sıfırla
                }}
                onChange={(e: any) => handleSetSelectedBaslik(e.target.value)}
              />
            </Box>
          </DialogContent>
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleUpdate(dipnotNo || "", baslik || "")}
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
                onClick={() => handleCreate(dipnotNo || "", baslik || "")}
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


