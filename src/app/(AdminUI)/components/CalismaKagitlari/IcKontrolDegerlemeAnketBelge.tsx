import React, { useEffect, useState } from "react";
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
  aciklama: string;
  banka: string;
  alacak: string;
  borc: string;
  tapu: string;
  avukat: string;
  diger: string;
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

const IcKontrolDegerlemeAnketBelge: React.FC<CalismaKagidiProps> = ({
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
  const [selectedBanka, setSelectedBanka] = useState("");
  const [selectedAlacak, setSelectedAlacak] = useState("");
  const [selectedBorc, setSelectedBorc] = useState("");
  const [selectedTapu, setSelectedTapu] = useState("");
  const [selectedAvukat, setSelectedAvukat] = useState("");
  const [selectedDiger, setSelectedDiger] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [isNew, setIsNew] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleCreate = async (
    aciklama: string,
    banka: string,
    alacak: string,
    borc: string,
    tapu: string,
    avukat: string,
    diger: string
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      aciklama: aciklama,
      banka: banka,
      alacak: alacak,
      borc: borc,
      tapu: tapu,
      avukat: avukat,
      diger: diger,
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
    banka: string,
    alacak: string,
    borc: string,
    tapu: string,
    avukat: string,
    diger: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.aciklama = aciklama;
      updatedCalismaKagidiVerisi.banka = banka;
      updatedCalismaKagidiVerisi.alacak = alacak;
      updatedCalismaKagidiVerisi.borc = borc;
      updatedCalismaKagidiVerisi.tapu = tapu;
      updatedCalismaKagidiVerisi.avukat = avukat;
      updatedCalismaKagidiVerisi.diger = diger;
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
          banka: veri.banka,
          alacak: veri.alacak,
          borc: veri.borc,
          tapu: veri.tapu,
          avukat: veri.avukat,
          diger: veri.diger,
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
    setSelectedBanka(veri.banka);
    setSelectedAlacak(veri.alacak);
    setSelectedBorc(veri.borc);
    setSelectedTapu(veri.tapu);
    setSelectedAvukat(veri.avukat);
    setSelectedDiger(veri.diger);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedAciklama("");
    setSelectedBanka("");
    setSelectedAlacak("");
    setSelectedBorc("");
    setSelectedTapu("");
    setSelectedAvukat("");
    setSelectedDiger("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedAciklama = async (value: string) => {
    setSelectedAciklama(value);
  };

  const handleSetSelectedBanka = async (value: string) => {
    setSelectedBanka(value);
  };

  const handleSetSelectedAlacak = async (value: string) => {
    setSelectedAlacak(value);
  };

  const handleSetSelectedBorc = async (value: string) => {
    setSelectedBorc(value);
  };

  const handleSetSelectedTapu = async (value: string) => {
    setSelectedTapu(value);
  };

  const handleSetSelectedAvukat = async (value: string) => {
    setSelectedAvukat(value);
  };

  const handleSetSelectedDiger = async (value: string) => {
    setSelectedDiger(value);
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
          banka={selectedBanka}
          alacak={selectedAlacak}
          borc={selectedBorc}
          tapu={selectedTapu}
          avukat={selectedAvukat}
          diger={selectedDiger}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedAciklama={handleSetSelectedAciklama}
          handleSetSelectedBanka={handleSetSelectedBanka}
          handleSetSelectedAlacak={handleSetSelectedAlacak}
          handleSetSelectedBorc={handleSetSelectedBorc}
          handleSetSelectedTapu={handleSetSelectedTapu}
          handleSetSelectedAvukat={handleSetSelectedAvukat}
          handleSetSelectedDiger={handleSetSelectedDiger}
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

export default IcKontrolDegerlemeAnketBelge;

interface PopUpProps {
  aciklama?: string;
  banka?: string;
  alacak?: string;
  borc?: string;
  tapu?: string;
  avukat?: string;
  diger?: string;

  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;

  handleSetSelectedAciklama: (a: string) => void;
  handleSetSelectedBanka: (a: string) => void;
  handleSetSelectedAlacak: (a: string) => void;
  handleSetSelectedBorc: (a: string) => void;
  handleSetSelectedTapu: (a: string) => void;
  handleSetSelectedAvukat: (a: string) => void;
  handleSetSelectedDiger: (a: string) => void;

  handleCreate: (
    aciklama: string,
    banka: string,
    alacak: string,
    borc: string,
    tapu: string,
    avukat: string,
    diger: string
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    aciklama: string,
    banka: string,
    alacak: string,
    borc: string,
    tapu: string,
    avukat: string,
    diger: string
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  aciklama,
  banka,
  alacak,
  borc,
  tapu,
  avukat,
  diger,

  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,

  handleSetSelectedAciklama,
  handleSetSelectedBanka,
  handleSetSelectedAlacak,
  handleSetSelectedBorc,
  handleSetSelectedTapu,
  handleSetSelectedAvukat,
  handleSetSelectedDiger,

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
                Banka
              </Typography>
              <CustomSelect
                labelId="banka"
                id="banka"
                size="small"
                value={banka}
                onChange={(e: any) => {
                  handleSetSelectedBanka(e.target.value);
                }}
                height={"36px"}
                sx={{ width: "100%" }}
              >
                <MenuItem value={"Evet"}>Evet</MenuItem>
                <MenuItem value={"Hayır"}>Hayır</MenuItem>
                <MenuItem value={"Yok"}>Yok</MenuItem>
                <MenuItem value={"Önemsiz"}>Önemsiz</MenuItem>
              </CustomSelect>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Alacak
              </Typography>
              <CustomSelect
                labelId="alacak"
                id="alacak"
                size="small"
                value={alacak}
                onChange={(e: any) => {
                  handleSetSelectedAlacak(e.target.value);
                }}
                height={"36px"}
                sx={{ width: "100%" }}
              >
                <MenuItem value={"Evet"}>Evet</MenuItem>
                <MenuItem value={"Hayır"}>Hayır</MenuItem>
                <MenuItem value={"Yok"}>Yok</MenuItem>
                <MenuItem value={"Önemsiz"}>Önemsiz</MenuItem>
              </CustomSelect>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Borç
              </Typography>
              <CustomSelect
                labelId="borc"
                id="borc"
                size="small"
                value={borc}
                onChange={(e: any) => {
                  handleSetSelectedBorc(e.target.value);
                }}
                height={"36px"}
                sx={{ width: "100%" }}
              >
                <MenuItem value={"Evet"}>Evet</MenuItem>
                <MenuItem value={"Hayır"}>Hayır</MenuItem>
                <MenuItem value={"Yok"}>Yok</MenuItem>
                <MenuItem value={"Önemsiz"}>Önemsiz</MenuItem>
              </CustomSelect>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Tapu
              </Typography>
              <CustomSelect
                labelId="tapu"
                id="tapu"
                size="small"
                value={tapu}
                onChange={(e: any) => {
                  handleSetSelectedTapu(e.target.value);
                }}
                height={"36px"}
                sx={{ width: "100%" }}
              >
                <MenuItem value={"Evet"}>Evet</MenuItem>
                <MenuItem value={"Hayır"}>Hayır</MenuItem>
                <MenuItem value={"Yok"}>Yok</MenuItem>
                <MenuItem value={"Önemsiz"}>Önemsiz</MenuItem>
              </CustomSelect>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Avukat
              </Typography>
              <CustomSelect
                labelId="avukat"
                id="avukat"
                size="small"
                value={avukat}
                onChange={(e: any) => {
                  handleSetSelectedAvukat(e.target.value);
                }}
                height={"36px"}
                sx={{ width: "100%" }}
              >
                <MenuItem value={"Evet"}>Evet</MenuItem>
                <MenuItem value={"Hayır"}>Hayır</MenuItem>
                <MenuItem value={"Yok"}>Yok</MenuItem>
                <MenuItem value={"Önemsiz"}>Önemsiz</MenuItem>
              </CustomSelect>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Diğer
              </Typography>
              <CustomSelect
                labelId="diger"
                id="diger"
                size="small"
                value={diger}
                onChange={(e: any) => {
                  handleSetSelectedDiger(e.target.value);
                }}
                height={"36px"}
                sx={{ width: "100%" }}
              >
                <MenuItem value={"Evet"}>Evet</MenuItem>
                <MenuItem value={"Hayır"}>Hayır</MenuItem>
                <MenuItem value={"Yok"}>Yok</MenuItem>
                <MenuItem value={"Önemsiz"}>Önemsiz</MenuItem>
              </CustomSelect>
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
                    banka || "",
                    alacak || "",
                    borc || "",
                    tapu || "",
                    avukat || "",
                    diger || ""
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
                    banka || "",
                    alacak || "",
                    borc || "",
                    tapu || "",
                    avukat || "",
                    diger || ""
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


