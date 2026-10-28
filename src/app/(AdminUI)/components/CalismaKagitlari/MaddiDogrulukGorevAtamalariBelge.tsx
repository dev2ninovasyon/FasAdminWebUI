import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import CalismaKagidiTarihCard from "./Cards/CalismaKagidiTarihCard";
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
  updateAllCalismaKagidiVerisi,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import { ConfirmPopUpComponent } from "./ConfirmPopUp";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import PersonelBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";

interface Veri {
  id: number;
  maddiDogrulukId: number;
  maddiDogruluk: string;
  gorevliId: number;
  calismaSuresi: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const MaddiDogrulukGorevAtamalariBelge: React.FC<CalismaKagidiProps> = ({
  controller,
  isClickedVarsayilanaDon,
  setIsClickedVarsayilanaDon,
  setTamamlanan,
  setToplam,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const [selectedId, setSelectedId] = useState(0);
  const [selectedMaddiDogrulukId, setSelectedMaddiDogrulukId] = useState(0);
  const [selectedMaddiDogruluk, setSelectedMaddiDogruluk] = useState("");
  const [selectedGorevliId, setSelectedGorevliId] = useState(0);
  const [selectedCalismaSuresi, setSelectedCalismaSuresi] = useState("");
  const [selectedBaslangicTarihi, setSelectedBaslangicTarihi] = useState("");
  const [selectedBitisTarihi, setSelectedBitisTarihi] = useState("");
  const [selectedStandartMi, setSelectedStandartMi] = useState(true);

  const [veriler, setVeriler] = useState<Veri[]>([]);

  const [isNew, setIsNew] = useState(false);
  const [isAll, setIsAll] = useState(false);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const handleCreate = async (
    maddiDogrulukId: number,
    maddiDogruluk: string,
    gorevliId: number,
    calismaSuresi: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => {
    const createdCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      maddiDogrulukId: maddiDogrulukId,
      maddiDogruluk: maddiDogruluk,
      gorevliId: gorevliId,
      calismaSuresi: calismaSuresi,
      bitisTarihi: bitisTarihi,
      baslangicTarihi: baslangicTarihi,
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
    maddiDogrulukId: number,
    maddiDogruluk: string,
    gorevliId: number,
    calismaSuresi: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => {
    const updatedCalismaKagidiVerisi = veriler.find(
      (veri) => veri.id === selectedId
    );

    if (updatedCalismaKagidiVerisi) {
      updatedCalismaKagidiVerisi.maddiDogrulukId = maddiDogrulukId;
      updatedCalismaKagidiVerisi.maddiDogruluk = maddiDogruluk;
      updatedCalismaKagidiVerisi.gorevliId = gorevliId;
      updatedCalismaKagidiVerisi.calismaSuresi = calismaSuresi;
      updatedCalismaKagidiVerisi.baslangicTarihi = baslangicTarihi;
      updatedCalismaKagidiVerisi.bitisTarihi = bitisTarihi;
      if (gorevliId != 0) {
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
    }
  };

  const handleUpdateAll = async (
    maddiDogrulukId: number,
    maddiDogruluk: string,
    gorevliId: number,
    calismaSuresi: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => {
    const updatedAllCalismaKagidiVerisi = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      maddiDogrulukId: maddiDogrulukId,
      maddiDogruluk: maddiDogruluk,
      gorevliId: gorevliId,
      calismaSuresi: calismaSuresi,
      bitisTarihi: bitisTarihi,
      baslangicTarihi: baslangicTarihi,
    };
    try {
      const result = await updateAllCalismaKagidiVerisi(
        controller || "",
        updatedAllCalismaKagidiVerisi
      );
      if (result) {
        fetchData();
        handleClosePopUp();
        setIsAll(false);
      } else {
        console.log("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
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
          maddiDogrulukId: veri.maddiDogrulukId,
          maddiDogruluk: veri.maddiDogruluk,
          gorevliId: veri.gorevliId,
          calismaSuresi: veri.calismaSuresi,
          baslangicTarihi: veri.baslangicTarihi,
          bitisTarihi: veri.bitisTarihi,
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
    setSelectedMaddiDogrulukId(veri.maddiDogrulukId);
    setSelectedMaddiDogruluk(veri.maddiDogruluk);
    setSelectedGorevliId(veri.gorevliId);
    setSelectedCalismaSuresi(
      veri.calismaSuresi && veri.calismaSuresi !== ""
        ? veri.calismaSuresi
        : "00:30"
    );
    setSelectedBaslangicTarihi(
      veri.baslangicTarihi && veri.baslangicTarihi !== ""
        ? veri.baslangicTarihi
        : `${user.yil}-03-01`
    );
    setSelectedBitisTarihi(
      veri.bitisTarihi && veri.bitisTarihi !== ""
        ? veri.bitisTarihi
        : `${user.yil}-03-01`
    );
    setSelectedStandartMi(veri.standartMi);
    setIsPopUpOpen(true);
  };

  const handleNew = () => {
    setIsNew(true);
    setSelectedMaddiDogrulukId(0);
    setSelectedMaddiDogruluk("");
    setSelectedGorevliId(0);
    setSelectedCalismaSuresi("00:30");
    setSelectedBaslangicTarihi(`${user.yil}-03-01`);
    setSelectedBitisTarihi(`${user.yil}-03-01`);
    setIsPopUpOpen(true);
  };

  const handleAll = () => {
    setIsAll(true);
    setSelectedMaddiDogrulukId(0);
    setSelectedMaddiDogruluk("");
    setSelectedGorevliId(selectedGorevliId);
    setSelectedCalismaSuresi("00:30");
    setSelectedBaslangicTarihi(`${user.yil}-03-01`);
    setSelectedBitisTarihi(`${user.yil}-03-01`);
    setIsPopUpOpen(true);
  };

  const handleClosePopUp = () => {
    setIsNew(false);
    setIsAll(false);
    setIsPopUpOpen(false);
  };

  const handleSetSelectedMaddiDogrulukId = async (value: number) => {
    setSelectedMaddiDogrulukId(value);
  };

  const handleSetSelectedMaddiDogruluk = async (value: string) => {
    setSelectedMaddiDogruluk(value);
  };

  const handleSetSelectedGorevliId = async (value: number) => {
    setSelectedGorevliId(value);
  };

  const handleSetSelectedCalismaSuresi = async (value: string) => {
    setSelectedCalismaSuresi(value);
  };

  const handleSetSelectedBaslangicTarihi = async (value: string) => {
    setSelectedBaslangicTarihi(value);
  };

  const handleSetSelectedBitisTarihi = async (value: string) => {
    setSelectedBitisTarihi(value);
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
          <Grid
            my={2}
            size={{
              xs: 12,
              lg: 1.5
            }}>
            <Button
              size="medium"
              variant="outlined"
              color="primary"
              onClick={() => handleAll()}
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
                Tümünü Tamamla
              </Typography>
            </Button>
          </Grid>
          {veriler.map((veri, index) => (
            <Grid
              key={index}
              mt="20px"
              onClick={() => handleCardClick(veri)}
              size={{
                xs: 12,
                lg: 12
              }}>
              <CalismaKagidiTarihCard
                title={`${index + 1}. ${veri.maddiDogruluk}`}
                startDate={veri.baslangicTarihi}
                endDate={veri.bitisTarihi}
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
          maddiDogrulukId={selectedMaddiDogrulukId}
          maddiDogruluk={selectedMaddiDogruluk}
          gorevliId={selectedGorevliId}
          calismaSuresi={selectedCalismaSuresi}
          baslangicTarihi={selectedBaslangicTarihi}
          bitisTarihi={selectedBitisTarihi}
          standartMi={selectedStandartMi}
          handleClose={handleClosePopUp}
          handleSetSelectedMaddiDogrulukId={handleSetSelectedMaddiDogrulukId}
          handleSetSelectedMaddiDogruluk={handleSetSelectedMaddiDogruluk}
          handleSetSelectedGorevliId={handleSetSelectedGorevliId}
          handleSetSelectedCalismaSuresi={handleSetSelectedCalismaSuresi}
          handleSetSelectedBaslangicTarihi={handleSetSelectedBaslangicTarihi}
          handleSetSelectedBitisTarihi={handleSetSelectedBitisTarihi}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
          handleUpdateAll={handleUpdateAll}
          handleDelete={handleDelete}
          isPopUpOpen={isPopUpOpen}
          isNew={isNew}
          isAll={isAll}
        />
      )}
    </>
  );
};

export default MaddiDogrulukGorevAtamalariBelge;

interface PopUpProps {
  maddiDogrulukId?: number;
  maddiDogruluk?: string;
  gorevliId?: number;
  calismaSuresi?: string;
  baslangicTarihi?: string;
  bitisTarihi?: string;

  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;
  isAll: boolean;

  handleClose: () => void;

  handleSetSelectedMaddiDogrulukId: (a: number) => void;
  handleSetSelectedMaddiDogruluk: (a: string) => void;
  handleSetSelectedGorevliId: (a: number) => void;
  handleSetSelectedCalismaSuresi: (a: string) => void;
  handleSetSelectedBaslangicTarihi: (a: string) => void;
  handleSetSelectedBitisTarihi: (a: string) => void;

  handleCreate: (
    maddiDogrulukId: number,
    maddiDogruluk: string,
    gorevliId: number,
    calismaSuresi: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => void;
  handleUpdate: (
    maddiDogrulukId: number,
    maddiDogruluk: string,
    gorevliId: number,
    calismaSuresi: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => void;
  handleUpdateAll: (
    maddiDogrulukId: number,
    maddiDogruluk: string,
    gorevliId: number,
    calismaSuresi: string,
    baslangicTarihi: string,
    bitisTarihi: string
  ) => void;
  handleDelete: () => void;
}

interface Belgeler {
  id: number;
  parentId: number;
  name: string;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  maddiDogrulukId,
  maddiDogruluk,
  gorevliId,
  calismaSuresi,
  baslangicTarihi,
  bitisTarihi,

  standartMi,
  isPopUpOpen,
  isNew,
  isAll,

  handleClose,

  handleSetSelectedMaddiDogrulukId,
  handleSetSelectedMaddiDogruluk,
  handleSetSelectedGorevliId,
  handleSetSelectedCalismaSuresi,
  handleSetSelectedBaslangicTarihi,
  handleSetSelectedBitisTarihi,

  handleCreate,
  handleUpdate,
  handleUpdateAll,
  handleDelete,
}) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };

  const formattedBaslangicTarihi = baslangicTarihi
    ? baslangicTarihi.split("T")[0]
    : "";
  const formattedBitisTarihi = bitisTarihi ? bitisTarihi.split("T")[0] : "";

  const [belgeler, setBelgeler] = useState<Belgeler[]>([]);

  const fetchData = async () => {
    try {
      const data = await getMaddiDogrulama(user.denetimTuru || "",
        user.denetlenenId || 0,
        user.yil || 0
      );
      setBelgeler(data || []); // Store fetched data in state
    } catch (error) {
      console.log("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            {!isAll && (
              <Box px={3} pt={3}>
                <Typography variant="h5" p={1}>
                  Maddi Doğruluk
                </Typography>
                <CustomSelect
                  labelId="maddiDogruluk"
                  id="maddiDogruluk"
                  size="small"
                  value={
                    belgeler.some((belge) => belge.id === maddiDogrulukId)
                      ? maddiDogrulukId
                      : 0
                  }
                  fullWidth
                  onChange={(e: any) => {
                    handleSetSelectedMaddiDogruluk(
                      belgeler.find(
                        (belge: Belgeler) => belge.id == e.target.value
                      )?.name || ""
                    );
                    handleSetSelectedMaddiDogrulukId(e.target.value);
                  }}
                  height="36px"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value={0}>Seçiniz</MenuItem>
                  {belgeler.map((belge) => (
                    <MenuItem key={belge.id} value={belge.id}>
                      {belge.name}
                    </MenuItem>
                  ))}
                </CustomSelect>
              </Box>
            )}
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Görevlendirilen Denetçi
              </Typography>
              <PersonelBoxAutocomplete
                initialValue={gorevliId ? gorevliId.toString() : ""}
                tip={"Hazırlayan"}
                onSelectId={(selectedId) =>
                  handleSetSelectedGorevliId(selectedId)
                }
                onSelectAdi={(selectedAdi) =>
                  console.log("Görevlendirilen Denetçi Adı:", selectedAdi)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Çalışma Süresi
              </Typography>
              <CustomTextField
                id="calismaSuresi"
                type="time"
                variant="outlined"
                fullWidth
                value={calismaSuresi}
                onChange={(e: any) => {
                  handleSetSelectedCalismaSuresi(e.target.value);
                }}
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Başlangıç Tarihi
              </Typography>
              <CustomTextField
                id="baslangicTarihi"
                type="date"
                variant="outlined"
                fullWidth
                value={formattedBaslangicTarihi}
                onChange={(e: any) =>
                  handleSetSelectedBaslangicTarihi(e.target.value)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Bitiş Tarihi
              </Typography>
              <CustomTextField
                id="bitisTarihi"
                type="date"
                variant="outlined"
                fullWidth
                value={formattedBitisTarihi}
                onChange={(e: any) =>
                  handleSetSelectedBitisTarihi(e.target.value)
                }
              />
            </Box>
          </DialogContent>
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => {
                  if (isAll) {
                    handleUpdateAll(
                      maddiDogrulukId || 0,
                      maddiDogruluk || "",
                      gorevliId || 0,
                      calismaSuresi || "",
                      baslangicTarihi || "",
                      bitisTarihi || ""
                    );
                  } else {
                    handleUpdate(
                      maddiDogrulukId || 0,
                      maddiDogruluk || "",
                      gorevliId || 0,
                      calismaSuresi || "",
                      baslangicTarihi || "",
                      bitisTarihi || ""
                    );
                  }
                }}
                sx={{ width: "20%" }}
              >
                Kaydet
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  if (isAll) {
                    handleClose();
                  } else {
                    handleIsConfirm();
                  }
                }}
                sx={{ width: "20%" }}
              >
                {isAll ? "Kapat" : "Sil"}
              </Button>
            </DialogActions>
          ) : (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleCreate(
                    maddiDogrulukId || 0,
                    maddiDogruluk || "",
                    gorevliId || 0,
                    calismaSuresi || "",
                    baslangicTarihi || "",
                    bitisTarihi || ""
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


