import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Checkbox,
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

interface Veri {
  id: number;
  dipnotNo: string;
  finansalTabloHesaplar: string;
  cari: boolean;
  onceki: boolean;
  gecmis: boolean;
  tamOlma: string;
  dogruluk: string;
  varOlma: string;
  degerleme: string;
  donemsellik: string;
  gecerlilik: string;
  sunumVeAciklama: string;
  onemsizRisk: boolean;
  ciddiRisk: boolean;
  referans: boolean;
  kontrollerinEtkinligininTestEdilmesi: boolean;
  analitikProsedurler: boolean;
  detayTestler: boolean;
  genelDenetimYaklasimi: boolean;
  standartMi: boolean;
}

interface CalismaKagidiProps {
  controller: string;
  isClickedVarsayilanaDon: boolean;
  setIsClickedVarsayilanaDon: (deger: boolean) => void;
  setTamamlanan: (deger: number) => void;
  setToplam: (deger: number) => void;
}

const FinansalTablolarDenetimRiskiBelirlemeBelge: React.FC<
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
    const [selectedDipnotNo, setSelectedDipnotNo] = useState("0");
    const [selectedFinansalTabloHesaplar, setSelectedFinansalTabloHesaplar] =
      useState("");
    const [selectedCari, setSelectedCari] = useState(false);
    const [selectedOnceki, setSelectedOnceki] = useState(false);
    const [selectedGecmis, setSelectedGecmis] = useState(false);
    const [selectedTamOlma, setSelectedTamOlma] = useState("0");
    const [selectedDogruluk, setSelectedDogruluk] = useState("0");
    const [selectedVarOlma, setSelectedVarOlma] = useState("0");
    const [selectedDegerleme, setSelectedDegerleme] = useState("0");
    const [selectedDonemsellik, setSelectedDonemsellik] = useState("0");
    const [selectedGecerlilik, setSelectedGecerlilik] = useState("0");
    const [selectedSunumVeAciklama, setSelectedSunumVeAciklama] = useState("0");
    const [selectedOnemsizRisk, setSelectedOnemsizRisk] = useState(false);
    const [selectedCiddiRisk, setSelectedCiddiRisk] = useState(false);
    const [selectedReferans, setSelectedReferans] = useState(false);
    const [
      selectedKontrollerinEtkinligininTestEdilmesi,
      setSelectedKontrollerinEtkinligininTestEdilmesi,
    ] = useState(false);
    const [selectedAnalitikProsedurler, setSelectedAnalitikProsedurler] =
      useState(false);
    const [selectedDetayTestler, setSelectedDetayTestler] = useState(false);
    const [selectedGenelDenetimYaklasimi, setSelectedGenelDenetimYaklasimi] =
      useState(false);
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
            dipnotNo: veri.dipnotNo,
            finansalTabloHesaplar: veri.finansalTabloHesaplar,
            cari: veri.cari,
            onceki: veri.onceki,
            gecmis: veri.gecmis,
            tamOlma: veri.tamOlma,
            dogruluk: veri.dogruluk,
            varOlma: veri.varOlma,
            degerleme: veri.degerleme,
            donemsellik: veri.donemsellik,
            gecerlilik: veri.gecerlilik,
            sunumVeAciklama: veri.sunumVeAciklama,
            onemsizRisk: veri.onemsizRisk,
            ciddiRisk: veri.ciddiRisk,
            referans: veri.referans,
            kontrollerinEtkinligininTestEdilmesi:
              veri.kontrollerinEtkinligininTestEdilmesi,
            analitikProsedurler: veri.analitikProsedurler,
            detayTestler: veri.detayTestler,
            genelDenetimYaklasimi: veri.genelDenetimYaklasimi,
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
      dipnotNo: string,
      finansalTabloHesaplar: string,
      cari: boolean,
      onceki: boolean,
      gecmis: boolean,
      tamOlma: string,
      dogruluk: string,
      varOlma: string,
      degerleme: string,
      donemsellik: string,
      gecerlilik: string,
      sunumVeAciklama: string,
      onemsizRisk: boolean,
      ciddiRisk: boolean,
      referans: boolean,
      kontrollerinEtkinligininTestEdilmesi: boolean,
      analitikProsedurler: boolean,
      detayTestler: boolean,
      genelDenetimYaklasimi: boolean
    ) => {
      const createdCalismaKagidiVerisi = {
        denetlenenId: user.denetlenenId,
        denetciId: user.denetciId,
        yil: user.yil,
        dipnotNo: dipnotNo,
        finansalTabloHesaplar: finansalTabloHesaplar,
        cari: cari,
        onceki: onceki,
        gecmis: gecmis,
        tamOlma: tamOlma,
        dogruluk: dogruluk,
        varOlma: varOlma,
        degerleme: degerleme,
        donemsellik: donemsellik,
        gecerlilik: gecerlilik,
        sunumVeAciklama: sunumVeAciklama,
        onemsizRisk: onemsizRisk,
        ciddiRisk: ciddiRisk,
        referans: referans,
        kontrollerinEtkinligininTestEdilmesi:
          kontrollerinEtkinligininTestEdilmesi,
        analitikProsedurler: analitikProsedurler,
        detayTestler: detayTestler,
        genelDenetimYaklasimi: genelDenetimYaklasimi,
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
      dipnotNo: string,
      finansalTabloHesaplar: string,
      cari: boolean,
      onceki: boolean,
      gecmis: boolean,
      tamOlma: string,
      dogruluk: string,
      varOlma: string,
      degerleme: string,
      donemsellik: string,
      gecerlilik: string,
      sunumVeAciklama: string,
      onemsizRisk: boolean,
      ciddiRisk: boolean,
      referans: boolean,
      kontrollerinEtkinligininTestEdilmesi: boolean,
      analitikProsedurler: boolean,
      detayTestler: boolean,
      genelDenetimYaklasimi: boolean
    ) => {
      const updatedCalismaKagidiVerisi = veriler.find(
        (veri) => veri.id === selectedId
      );
      if (updatedCalismaKagidiVerisi) {
        updatedCalismaKagidiVerisi.dipnotNo = dipnotNo;
        updatedCalismaKagidiVerisi.finansalTabloHesaplar = finansalTabloHesaplar;
        updatedCalismaKagidiVerisi.cari = cari;
        updatedCalismaKagidiVerisi.onceki = onceki;
        updatedCalismaKagidiVerisi.gecmis = gecmis;
        updatedCalismaKagidiVerisi.tamOlma = tamOlma;
        updatedCalismaKagidiVerisi.dogruluk = dogruluk;
        updatedCalismaKagidiVerisi.varOlma = varOlma;
        updatedCalismaKagidiVerisi.degerleme = degerleme;
        updatedCalismaKagidiVerisi.donemsellik = donemsellik;
        updatedCalismaKagidiVerisi.gecerlilik = gecerlilik;
        updatedCalismaKagidiVerisi.sunumVeAciklama = sunumVeAciklama;
        updatedCalismaKagidiVerisi.onemsizRisk = onemsizRisk;
        updatedCalismaKagidiVerisi.ciddiRisk = ciddiRisk;
        updatedCalismaKagidiVerisi.referans = referans;
        updatedCalismaKagidiVerisi.kontrollerinEtkinligininTestEdilmesi =
          kontrollerinEtkinligininTestEdilmesi;
        updatedCalismaKagidiVerisi.analitikProsedurler = analitikProsedurler;
        updatedCalismaKagidiVerisi.detayTestler = detayTestler;
        updatedCalismaKagidiVerisi.genelDenetimYaklasimi = genelDenetimYaklasimi;

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
      setSelectedDipnotNo(veri.dipnotNo);
      setSelectedFinansalTabloHesaplar(veri.finansalTabloHesaplar);
      setSelectedCari(veri.cari);
      setSelectedOnceki(veri.onceki);
      setSelectedGecmis(veri.gecmis);
      setSelectedTamOlma(veri.tamOlma);
      setSelectedDogruluk(veri.dogruluk);
      setSelectedVarOlma(veri.varOlma);
      setSelectedDegerleme(veri.degerleme);
      setSelectedDonemsellik(veri.donemsellik);
      setSelectedGecerlilik(veri.gecerlilik);
      setSelectedSunumVeAciklama(veri.sunumVeAciklama);
      setSelectedOnemsizRisk(veri.onemsizRisk);
      setSelectedCiddiRisk(veri.ciddiRisk);
      setSelectedReferans(veri.referans);
      setSelectedKontrollerinEtkinligininTestEdilmesi(
        veri.kontrollerinEtkinligininTestEdilmesi
      );
      setSelectedAnalitikProsedurler(veri.analitikProsedurler);
      setSelectedDetayTestler(veri.detayTestler);
      setSelectedGenelDenetimYaklasimi(veri.genelDenetimYaklasimi);
      setSelectedStandartMi(veri.standartMi);
      setIsPopUpOpen(true);
    };

    const handleNew = () => {
      setIsNew(true);
      setSelectedDipnotNo("");
      setSelectedFinansalTabloHesaplar("");
      setSelectedCari(false);
      setSelectedOnceki(false);
      setSelectedGecmis(false);
      setSelectedTamOlma("0");
      setSelectedDogruluk("0");
      setSelectedVarOlma("0");
      setSelectedDegerleme("0");
      setSelectedDonemsellik("0");
      setSelectedGecerlilik("0");
      setSelectedSunumVeAciklama("0");
      setSelectedOnemsizRisk(false);
      setSelectedCiddiRisk(false);
      setSelectedReferans(false);
      setSelectedKontrollerinEtkinligininTestEdilmesi(false);
      setSelectedAnalitikProsedurler(false);
      setSelectedDetayTestler(false);
      setSelectedGenelDenetimYaklasimi(false);
      setIsPopUpOpen(true);
    };

    const handleClosePopUp = () => {
      setIsNew(false);
      setIsPopUpOpen(false);
    };

    const handleSetSelectedDipnotNo = async (value: string) => {
      setSelectedDipnotNo(value);
    };

    const handleSetSelectedFinansalTabloHesaplar = async (value: string) => {
      setSelectedFinansalTabloHesaplar(value);
    };

    const handleSetSelectedCari = async (value: boolean) => {
      setSelectedCari(value);
    };

    const handleSetSelectedOnceki = async (value: boolean) => {
      setSelectedOnceki(value);
    };

    const handleSetSelectedGecmis = async (value: boolean) => {
      setSelectedGecmis(value);
    };

    const handleSetSelectedTamOlma = async (value: string) => {
      setSelectedTamOlma(value);
    };

    const handleSetSelectedDogruluk = async (value: string) => {
      setSelectedDogruluk(value);
    };

    const handleSetSelectedVarOlma = async (value: string) => {
      setSelectedVarOlma(value);
    };

    const handleSetSelectedDegerleme = async (value: string) => {
      setSelectedDegerleme(value);
    };

    const handleSetSelectedDonemsellik = async (value: string) => {
      setSelectedDonemsellik(value);
    };

    const handleSetSelectedGecerlilik = async (value: string) => {
      setSelectedGecerlilik(value);
    };

    const handleSetSelectedSunumVeAciklama = async (value: string) => {
      setSelectedSunumVeAciklama(value);
    };

    const handleSetSelectedOnemsizRisk = async (value: boolean) => {
      setSelectedOnemsizRisk(value);
    };

    const handleSetSelectedCiddiRisk = async (value: boolean) => {
      setSelectedCiddiRisk(value);
    };

    const handleSetSelectedReferans = async (value: boolean) => {
      setSelectedReferans(value);
    };

    const handleSetSelectedKontrollerinEtkinligininTestEdilmesi = async (
      value: boolean
    ) => {
      setSelectedKontrollerinEtkinligininTestEdilmesi(value);
    };

    const handleSetSelectedAnalitikProsedurler = async (value: boolean) => {
      setSelectedAnalitikProsedurler(value);
    };

    const handleSetSelectedDetayTestler = async (value: boolean) => {
      setSelectedDetayTestler(value);
    };

    const handleSetSelectedGenelDenetimYaklasimi = async (value: boolean) => {
      setSelectedGenelDenetimYaklasimi(value);
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
                  title={`${index + 1}. ${veri.finansalTabloHesaplar}`}
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
            dipnotNo={selectedDipnotNo}
            finansalTabloHesaplar={selectedFinansalTabloHesaplar}
            cari={selectedCari}
            onceki={selectedOnceki}
            gecmis={selectedGecmis}
            tamOlma={selectedTamOlma}
            dogruluk={selectedDogruluk}
            varOlma={selectedVarOlma}
            degerleme={selectedDegerleme}
            donemsellik={selectedDonemsellik}
            gecerlilik={selectedGecerlilik}
            sunumVeAciklama={selectedSunumVeAciklama}
            onemsizRisk={selectedOnemsizRisk}
            ciddiRisk={selectedCiddiRisk}
            referans={selectedReferans}
            kontrollerinEtkinligininTestEdilmesi={
              selectedKontrollerinEtkinligininTestEdilmesi
            }
            analitikProsedurler={selectedAnalitikProsedurler}
            detayTestler={selectedDetayTestler}
            genelDenetimYaklasimi={selectedGenelDenetimYaklasimi}
            standartMi={selectedStandartMi}
            handleClose={handleClosePopUp}
            handleSetSelectedDipnotNo={handleSetSelectedDipnotNo}
            handleSetSelectedFinansalTabloHesaplar={
              handleSetSelectedFinansalTabloHesaplar
            }
            handleSetSelectedCari={handleSetSelectedCari}
            handleSetSelectedOnceki={handleSetSelectedOnceki}
            handleSetSelectedGecmis={handleSetSelectedGecmis}
            handleSetSelectedTamOlma={handleSetSelectedTamOlma}
            handleSetSelectedDogruluk={handleSetSelectedDogruluk}
            handleSetSelectedVarOlma={handleSetSelectedVarOlma}
            handleSetSelectedDegerleme={handleSetSelectedDegerleme}
            handleSetSelectedDonemsellik={handleSetSelectedDonemsellik}
            handleSetSelectedGecerlilik={handleSetSelectedGecerlilik}
            handleSetSelectedSunumVeAciklama={handleSetSelectedSunumVeAciklama}
            handleSetSelectedOnemsizRisk={handleSetSelectedOnemsizRisk}
            handleSetSelectedCiddiRisk={handleSetSelectedCiddiRisk}
            handleSetSelectedReferans={handleSetSelectedReferans}
            handleSetSelectedKontrollerinEtkinligininTestEdilmesi={
              handleSetSelectedKontrollerinEtkinligininTestEdilmesi
            }
            handleSetSelectedAnalitikProsedurler={
              handleSetSelectedAnalitikProsedurler
            }
            handleSetSelectedDetayTestler={handleSetSelectedDetayTestler}
            handleSetSelectedGenelDenetimYaklasimi={
              handleSetSelectedGenelDenetimYaklasimi
            }
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

export default FinansalTablolarDenetimRiskiBelirlemeBelge;

interface PopUpProps {
  dipnotNo?: string;
  finansalTabloHesaplar?: string;
  cari?: boolean;
  onceki?: boolean;
  gecmis?: boolean;
  tamOlma?: string;
  dogruluk?: string;
  varOlma?: string;
  degerleme?: string;
  donemsellik?: string;
  gecerlilik?: string;
  sunumVeAciklama?: string;
  onemsizRisk?: boolean;
  ciddiRisk?: boolean;
  referans?: boolean;
  kontrollerinEtkinligininTestEdilmesi?: boolean;
  analitikProsedurler?: boolean;
  detayTestler?: boolean;
  genelDenetimYaklasimi?: boolean;

  standartMi?: boolean;

  isPopUpOpen: boolean;
  isNew: boolean;

  handleClose: () => void;

  handleSetSelectedDipnotNo: (a: string) => void;
  handleSetSelectedFinansalTabloHesaplar: (a: string) => void;
  handleSetSelectedCari: (a: boolean) => void;
  handleSetSelectedOnceki: (a: boolean) => void;
  handleSetSelectedGecmis: (a: boolean) => void;
  handleSetSelectedTamOlma: (a: string) => void;
  handleSetSelectedDogruluk: (a: string) => void;
  handleSetSelectedVarOlma: (a: string) => void;
  handleSetSelectedDegerleme: (a: string) => void;
  handleSetSelectedDonemsellik: (a: string) => void;
  handleSetSelectedGecerlilik: (a: string) => void;
  handleSetSelectedSunumVeAciklama: (a: string) => void;
  handleSetSelectedOnemsizRisk: (a: boolean) => void;
  handleSetSelectedCiddiRisk: (a: boolean) => void;
  handleSetSelectedReferans: (a: boolean) => void;
  handleSetSelectedKontrollerinEtkinligininTestEdilmesi: (a: boolean) => void;
  handleSetSelectedAnalitikProsedurler: (a: boolean) => void;
  handleSetSelectedDetayTestler: (a: boolean) => void;
  handleSetSelectedGenelDenetimYaklasimi: (a: boolean) => void;

  handleCreate: (
    dipnotNo: string,
    finansalTabloHesaplar: string,
    cari: boolean,
    onceki: boolean,
    gecmis: boolean,
    tamOlma: string,
    dogruluk: string,
    varOlma: string,
    degerleme: string,
    donemsellik: string,
    gecerlilik: string,
    sunumVeAciklama: string,
    onemsizRisk: boolean,
    ciddiRisk: boolean,
    referans: boolean,
    kontrollerinEtkinligininTestEdilmesi: boolean,
    analitikProsedurler: boolean,
    detayTestler: boolean,
    genelDenetimYaklasimi: boolean
  ) => void;
  handleDelete: () => void;
  handleUpdate: (
    dipnotNo: string,
    finansalTabloHesaplar: string,
    cari: boolean,
    onceki: boolean,
    gecmis: boolean,
    tamOlma: string,
    dogruluk: string,
    varOlma: string,
    degerleme: string,
    donemsellik: string,
    gecerlilik: string,
    sunumVeAciklama: string,
    onemsizRisk: boolean,
    ciddiRisk: boolean,
    referans: boolean,
    kontrollerinEtkinligininTestEdilmesi: boolean,
    analitikProsedurler: boolean,
    detayTestler: boolean,
    genelDenetimYaklasimi: boolean
  ) => void;
}

const PopUpComponent: React.FC<PopUpProps> = ({
  dipnotNo,
  finansalTabloHesaplar,
  cari,
  onceki,
  gecmis,
  tamOlma,
  dogruluk,
  varOlma,
  degerleme,
  donemsellik,
  gecerlilik,
  sunumVeAciklama,
  onemsizRisk,
  ciddiRisk,
  referans,
  kontrollerinEtkinligininTestEdilmesi,
  analitikProsedurler,
  detayTestler,
  genelDenetimYaklasimi,

  standartMi,
  isPopUpOpen,
  isNew,
  handleClose,

  handleSetSelectedDipnotNo,
  handleSetSelectedFinansalTabloHesaplar,
  handleSetSelectedCari,
  handleSetSelectedOnceki,
  handleSetSelectedGecmis,
  handleSetSelectedTamOlma,
  handleSetSelectedDogruluk,
  handleSetSelectedVarOlma,
  handleSetSelectedDegerleme,
  handleSetSelectedDonemsellik,
  handleSetSelectedGecerlilik,
  handleSetSelectedSunumVeAciklama,
  handleSetSelectedOnemsizRisk,
  handleSetSelectedCiddiRisk,
  handleSetSelectedReferans,
  handleSetSelectedKontrollerinEtkinligininTestEdilmesi,
  handleSetSelectedAnalitikProsedurler,
  handleSetSelectedDetayTestler,
  handleSetSelectedGenelDenetimYaklasimi,

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
                id="finansalTabloHesaplar"
                multiline
                rows={1}
                variant="outlined"
                fullWidth
                value={finansalTabloHesaplar}
                InputProps={{
                  style: { padding: 0 }, // Padding değerini sıfırla
                }}
                onChange={(e: any) =>
                  handleSetSelectedFinansalTabloHesaplar(e.target.value)
                }
              />
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Dönem
              </Typography>
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
                        <Typography variant="h6">Cari</Typography>
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
                          checked={cari}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedCari(e.target.checked);
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
                        <Typography variant="h6">Önceki</Typography>
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
                          checked={onceki}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedOnceki(e.target.checked);
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
                        <Typography variant="h6">Geçmiş</Typography>
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
                          checked={gecmis}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedGecmis(e.target.checked);
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Hesabın Özü İtibarıyla Tespit Edilen Riskler
              </Typography>
              <Box px={3} pt={3}>
                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 6
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
                        <Typography variant="h6">Tam Olma</Typography>
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
                        <CustomSelect
                          labelId="tamOlma"
                          id="tamOlma"
                          size="small"
                          value={tamOlma}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedTamOlma(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 6
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
                        <Typography variant="h6">Doğruluk</Typography>
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
                        <CustomSelect
                          labelId="dogruluk"
                          id="dogruluk"
                          size="small"
                          value={dogruluk}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedDogruluk(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 6
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
                        <Typography variant="h6">Var Olma</Typography>
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
                        <CustomSelect
                          labelId="varOlma"
                          id="varOlma"
                          size="small"
                          value={varOlma}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedVarOlma(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 6
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
                        <Typography variant="h6">Değerleme</Typography>
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
                        <CustomSelect
                          labelId="degerleme"
                          id="degerleme"
                          size="small"
                          value={degerleme}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedDegerleme(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 6
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
                        <Typography variant="h6">Dönemsellik</Typography>
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
                        <CustomSelect
                          labelId="donemsellik"
                          id="donemsellik"
                          size="small"
                          value={donemsellik}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedDonemsellik(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 6
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
                        <Typography variant="h6">Geçerlilik</Typography>
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
                        <CustomSelect
                          labelId="gecerlilik"
                          id="gecerlilik"
                          size="small"
                          value={gecerlilik}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedGecerlilik(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      lg: 6
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
                        <Typography variant="h6">Sunum ve Açıklama</Typography>
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
                        <CustomSelect
                          labelId="sunumVeAciklama"
                          id="sunumVeAciklama"
                          size="small"
                          value={sunumVeAciklama}
                          fullWidth
                          onChange={(e: any) => {
                            handleSetSelectedSunumVeAciklama(e.target.value);
                          }}
                          height="36px"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value={"0"}>Yok</MenuItem>
                          <MenuItem value={"1"}>Önemsiz</MenuItem>
                          <MenuItem value={"2"}>Orta</MenuItem>
                          <MenuItem value={"3"}>Yüksek</MenuItem>
                        </CustomSelect>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Hile ve Suistimal Riski
              </Typography>
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
                        <Typography variant="h6">Önemsiz Risk</Typography>
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
                          checked={onemsizRisk}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedOnemsizRisk(e.target.checked);
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
                        <Typography variant="h6">Ciddi Risk</Typography>
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
                          checked={ciddiRisk}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedCiddiRisk(e.target.checked);
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Box px={3} pt={3}>
              <Typography variant="h5" p={1}>
                Detaylı Test Prosedürleri
              </Typography>
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
                        <Typography variant="h6">Referans</Typography>
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
                          checked={referans}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedReferans(e.target.checked);
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
                        <Typography variant="h6">
                          Kontrollerin Etkinliğinin Test Edilmesi
                        </Typography>
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
                          checked={kontrollerinEtkinligininTestEdilmesi}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedKontrollerinEtkinligininTestEdilmesi(
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
                        justifyContent={"right"}
                        size={{
                          xs: 6,
                          sm: 6,
                          lg: 6
                        }}>
                        <Typography variant="h6">
                          Analitik Prosedürler
                        </Typography>
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
                          checked={analitikProsedurler}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedAnalitikProsedurler(
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
                        justifyContent={"left"}
                        size={{
                          xs: 6,
                          sm: 6,
                          lg: 6
                        }}>
                        <Typography variant="h6">Detay Testler</Typography>
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
                          checked={detayTestler}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedDetayTestler(e.target.checked);
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
                        <Typography variant="h6">
                          Genel Denetim Yaklaşımı
                        </Typography>
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
                          checked={genelDenetimYaklasimi}
                          color="primary"
                          onChange={(e: any) => {
                            handleSetSelectedGenelDenetimYaklasimi(
                              e.target.checked
                            );
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </DialogContent>
          {!isNew ? (
            <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
              <Button
                variant="outlined"
                color="success"
                onClick={() =>
                  handleUpdate(
                    dipnotNo || "",
                    finansalTabloHesaplar || "",
                    cari || false,
                    onceki || false,
                    gecmis || false,
                    tamOlma || "0",
                    dogruluk || "0",
                    varOlma || "0",
                    degerleme || "0",
                    donemsellik || "0",
                    gecerlilik || "0",
                    sunumVeAciklama || "0",
                    onemsizRisk || false,
                    ciddiRisk || false,
                    referans || false,
                    kontrollerinEtkinligininTestEdilmesi || false,
                    analitikProsedurler || false,
                    detayTestler || false,
                    genelDenetimYaklasimi || false
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
                    dipnotNo || "",
                    finansalTabloHesaplar || "",
                    cari || false,
                    onceki || false,
                    gecmis || false,
                    tamOlma || "0",
                    dogruluk || "0",
                    varOlma || "0",
                    degerleme || "0",
                    donemsellik || "0",
                    gecerlilik || "0",
                    sunumVeAciklama || "0",
                    onemsizRisk || false,
                    ciddiRisk || false,
                    referans || false,
                    kontrollerinEtkinligininTestEdilmesi || false,
                    analitikProsedurler || false,
                    detayTestler || false,
                    genelDenetimYaklasimi || false
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


