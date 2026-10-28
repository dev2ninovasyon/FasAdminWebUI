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
import BelgeKontrolCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/IslemlerCard";
import { useSelector } from "@/store/hooks";
import {
  createCalismaKagidiVerisi,
  deleteAllCalismaKagidiVerileri,
  deleteCalismaKagidiVerisiById,
  updateCalismaKagidiVerisi,
} from "@/api/MaddiDogrulama/MaddiDogrulama";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { ConfirmPopUpComponent } from "@/app/(AdminUI)/components/CalismaKagitlari/ConfirmPopUp";
import { getUygulananDenetimProsedurleri } from "@/api/MaddiDogrulama/MaddiDogrulama";
import Autocomplete from "@mui/material/Autocomplete";
import dynamic from "next/dynamic";
import { FloatingButtonCalismaKagitlari } from "@/app/(AdminUI)/components/CalismaKagitlari/FloatingButtonCalismaKagitlari";
import { useTheme } from "@mui/material/styles";

const MaddiDogrulamaKonuEditor = dynamic(
  () => import("@/app/(AdminUI)/components/Editor/MaddiDogrulamaKonuEditor"),
  { ssr: false }
);

const MaddiDogrulamaAciklamaEditor = dynamic(
  () =>
    import("@/app/(AdminUI)/components/Editor/MaddiDogrulamaAciklamaEditor"),
  { ssr: false }
);

interface Veri {
  id: number;
  kategori: string;
  konu: string;
  aciklama: string;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayilanaDon: boolean;
  alanAdi1: string;
  alanAdi2: string;
  alanAdi3: string;

  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
  dipnotAdi: string; // Ek olarak dipnotAdi prop'u eklendi
  setDip: (str: string) => void;
  isReport?: boolean;
}

const UygulananDenetimProsedurleri: React.FC<CalismaKagidiProps> = ({
  controller,
  alanAdi1,
  alanAdi2,
  alanAdi3,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
  dipnotAdi,
  setDip,
  isReport,
}) => {
  const theme = useTheme();
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [selectedKonu, setSelectedKonu] = useState("");
  const [selectedAciklama, setSelectedAciklama] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  //const router = useRouter();

  const handleCreate = async (
    kategori: string,
    konu: string,
    aciklama: string
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      kategori: kategori,
      konu: konu,
      aciklama: aciklama,
    };
    try {
      const result = await createCalismaKagidiVerisi(createdCalismaKagidiVerisi
      );
      if (result) {
        fetchData();
        handleClosePopUp();
        setIsNew(false);
      } else {
        console.error("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleUpdate = async (
    kategori: string,
    konu: string,
    aciklama: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );
    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.kategori = kategori;
      updatedCalismaKagidiVerisi.konu = konu;
      updatedCalismaKagidiVerisi.aciklama = aciklama;

      try {
        const result = await updateCalismaKagidiVerisi(selectedId,
          updatedCalismaKagidiVerisi
        );
        if (result) {
          fetchData();
          handleClosePopUp();
        } else {
          console.error("Çalışma Kağıdı Verisi düzenleme başarısız");
        }
      } catch (error) {
        console.error("Bir hata oluştu:", error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteCalismaKagidiVerisiById(selectedId
      );
      if (result) {
        fetchData();
        handleClosePopUp();
      } else {
        console.error("Çalışma Kağıdı Verisi silme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllCalismaKagidiVerileri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        dipnotAdi || "",
        user.tfrsmi || false
      );
      if (result) {
        fetchData();
      } else {
        console.error("Çalışma Kağıdı Verileri silme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const calismaKagidiVerileri = await getUygulananDenetimProsedurleri(user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0,
        dipnotAdi || "",
        user.tfrsmi || false
      );

      const rowsAll: any = [];
      const tamamlanan: any[] = [];
      const toplam: any[] = [];

      calismaKagidiVerileri.forEach((veri: any) => {
        setDip(veri.dipnotAdi);
        const newRow: Veri = {
          id: veri.id,
          kategori: veri.kategori,
          konu: veri.konu,
          aciklama: veri.aciklama,
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
      console.error("Bir hata oluştu:", error);
    }
  };

  const handleCardClick = (veri: any) => {
    setSelectedId(veri.id);
    setSelectedKategori(veri.kategori);
    setSelectedKonu(veri.konu);
    setSelectedAciklama(veri.aciklama);
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedKategori("");
    setSelectedKonu("");
    setSelectedAciklama("");
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedKategori = async (kategori: any) => {
    setSelectedKategori(kategori);
  };

  const handleSetSelectedKonu = async (konu: any) => {
    setSelectedKonu(konu);
  };

  const handleSetSelectedAciklama = async (aciklama: any) => {
    setSelectedAciklama(aciklama);
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
    <Box>
      <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
        Uygulanan Denetim Prosedürleri
      </Typography>
      <Grid container>
        <Grid size={12}>
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
                size={12}
                mt="20px"
                onClick={() => !isReport && handleCardClick(veri)}
                sx={{ cursor: isReport ? "default" : "pointer" }}
              >
                <CalismaKagidiCard
                  title={`${index + 1}. ${veri.kategori || "Kategori seçiniz"}`}
                  content={veri.konu
                    .replaceAll("<p>", "")
                    .replaceAll("</p>", "")}
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
                size={{ xs: 12, lg: 1.5 }}
                my={2}
                sx={{
                  display: "flex",
                  justifyContent: "end",
                }}
              >
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
          )}

        </Grid>
      </Grid>
      {isPopUpOpen && (
        <PopUpComponent
          kategori={selectedKategori}
          konu={selectedKonu}
          aciklama={selectedAciklama}
          standartMi={selectedStandartMi}
          alanAdi1={alanAdi1}
          alanAdi2={alanAdi2}
          alanAdi3={alanAdi3}
          handleClose={handleClosePopUp}
          handleSetSelectedKategori={handleSetSelectedKategori}
          handleSetSelectedKonu={handleSetSelectedKonu}
          handleSetSelectedAciklama={handleSetSelectedAciklama}
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

export default UygulananDenetimProsedurleri;

interface PopUpProps {
  kategori?: string;
  konu?: string;
  aciklama?: string;
  standartMi?: boolean;
  alanAdi1?: string;
  alanAdi2?: string;
  alanAdi3?: string;
  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;
  handleSetSelectedKategori: (a: string) => void;
  handleSetSelectedKonu: (a: string) => void;
  handleSetSelectedAciklama: (a: string) => void;
  handleCreate: (kategori: string, konu: string, aciklama: string) => void;
  handleDelete: () => void;
  handleUpdate: (kategori: string, konu: string, aciklama: string) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  kategori,
  konu,
  aciklama,
  standartMi,
  alanAdi1,
  alanAdi2,
  alanAdi3,
  isPopUpOpen,
  isNew,
  handleClose,
  handleSetSelectedKategori,
  handleSetSelectedKonu,
  handleSetSelectedAciklama,
  handleCreate,
  handleDelete,
  handleUpdate,
}) => {
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

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
                {alanAdi1}
              </Typography>
              <KategoriBoxAutocomplete
                onSelect={(selectedKategori) =>
                  handleSetSelectedKategori(selectedKategori)
                }
                initialValue={kategori || ""}
              ></KategoriBoxAutocomplete>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                {alanAdi2}
              </Typography>
              <MaddiDogrulamaKonuEditor
                konu={konu}
                handleSetSelectedKonu={handleSetSelectedKonu}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                {alanAdi3}
              </Typography>
              <MaddiDogrulamaAciklamaEditor
                control1={control1}
                control2={control2}
                isHovered={isHovered}
                aciklama={aciklama}
                handleSetSelectedAciklama={handleSetSelectedAciklama}
              />
            </Box>
          </DialogContent>
          <FloatingButtonCalismaKagitlari
            control={standartMi ? (control1 || control2 ? true : false) : true}
            text={aciklama}
            isHovered={isHovered}
            isLexical={true}
            setIsHovered={setIsHovered}
            handleClick={handleControl1}
            handleSetSelectedText={handleSetSelectedAciklama}
          />
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(kategori || "", konu || "", aciklama || "")
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
                  handleCreate(kategori || "", konu || "", aciklama || "")
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

interface Kategory {
  label: string;
}

const kategoriler = [
  {
    label: "Finansal Tablolara İlişkin Tespit ve Açıklamalar",
  },
  {
    label: "Hesaplara İlişkin Tespit ve Açıklamalar",
  },
  {
    label: "Uygulanan Denetim Prosedürleri",
  },
];
interface KategoriBoxProps {
  onSelect: (selectedKategori: string) => void;
  initialValue: string;
}

const KategoriBoxAutocomplete: React.FC<KategoriBoxProps> = ({
  onSelect,
  initialValue,
}) => {
  const [initial, setInitial] = useState<Kategory | null>(null);

  useEffect(() => {
    const matchedOption = kategoriler.find((row) => row.label === initialValue);
    setInitial(matchedOption || null);
  }, [initialValue]);

  return (
    <Autocomplete
      id="kategori-box"
      options={kategoriler}
      noOptionsText="Bulunamadı"
      fullWidth
      value={initial}
      onChange={(event, value) => {
        onSelect(value?.label || "");
      }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder={"Kategori Seçiniz"}
          aria-label="Kategori Seçiniz"
        />
      )}
    />
  );
};


