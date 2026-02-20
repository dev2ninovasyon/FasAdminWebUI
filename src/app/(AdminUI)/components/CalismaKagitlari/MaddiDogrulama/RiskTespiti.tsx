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
import CalismaKagidiCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/CalismaKagidiCard";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import {
  getCalismaKagidiVerileriByDenetciDenetlenenYil,
  updateCalismaKagidiVerisi,
} from "@/api/CalismaKagitlari/CalismaKagitlari";
import dynamic from "next/dynamic";
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";
import { useTheme } from "@mui/material/styles";

const YorumEditor = dynamic(
  () => import("@/app/(AdminUI)/components/Editor/YorumEditor"),
  { ssr: false }
);

const YorumBolumu = ({
  belgeAdi,
  denetlenenId,
  yil,
}: {
  belgeAdi: string;
  denetlenenId: number;
  yil: number;
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <Divider sx={{ mb: 1 }} />
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Yorum
      </Typography>
      <Box
        sx={{
          border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0'}`,
          borderRadius: 0,
          p: 1,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#fafafa",
        }}
      >
        <YorumEditor denetlenenId={denetlenenId} yil={yil} belgeAdi={belgeAdi} />
      </Box>
    </Box>
  );
};


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
  dipnotAdi: string;
  setDip: (str: string) => void;
  isReport?: boolean;
}

const RiskTespiti: React.FC<CalismaKagidiProps> = ({
  controller,
  dipnotAdi,
  setDip,
  isReport,
}) => {
  const theme = useTheme();
  const user = useSelector((state: AppState) => state.userReducer);

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

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  function normalizeString(str: string): string {
    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    };

    // Türkçe karakterleri değiştir
    let normalized = str.replace(
      /[çğıöşüÇĞÖŞÜıİ]/g,
      (match) => turkishChars[match] || match
    );

    // Tüm boşluk, tab, satır başı/sonu karakterlerini sil
    normalized = normalized.replace(/\s+/g, "");

    // Küçük harfe çevir
    return normalized.toLowerCase();
  }

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
          console.error("Çalışma Kağıdı Verisi düzenleme başarısız");
        }
      } catch (error) {
        console.error("Bir hata oluştu:", error);
      }
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
        if (
          normalizeString(newRow.finansalTabloHesaplar) ==
          normalizeString(dipnotAdi)
        ) {
          rowsAll.push(newRow);
          setDip(newRow.finansalTabloHesaplar);
        }
      });
      setVeriler(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

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

  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
        Risk Tespiti
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
                my="20px"
                onClick={() => !isReport && handleCardClick(veri)}
                sx={{ cursor: isReport ? "default" : "pointer" }}
              >
                <CalismaKagidiCard
                  title={`${veri.finansalTabloHesaplar} Risk Tespiti`}
                  standartMi={veri.standartMi}
                />
              </Grid>
            ))}
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
          handleSetSelectedTamOlma={handleSetSelectedTamOlma}
          handleSetSelectedDogruluk={handleSetSelectedDogruluk}
          handleSetSelectedVarOlma={handleSetSelectedVarOlma}
          handleSetSelectedDegerleme={handleSetSelectedDegerleme}
          handleSetSelectedDonemsellik={handleSetSelectedDonemsellik}
          handleSetSelectedGecerlilik={handleSetSelectedGecerlilik}
          handleSetSelectedSunumVeAciklama={handleSetSelectedSunumVeAciklama}
          handleUpdate={handleUpdate}
          isPopUpOpen={isPopUpOpen}
        />
      )}
    </Box>
  );
};

export default RiskTespiti;

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

  handleClose: () => void;
  handleSetSelectedTamOlma: (a: string) => void;
  handleSetSelectedDogruluk: (a: string) => void;
  handleSetSelectedVarOlma: (a: string) => void;
  handleSetSelectedDegerleme: (a: string) => void;
  handleSetSelectedDonemsellik: (a: string) => void;
  handleSetSelectedGecerlilik: (a: string) => void;
  handleSetSelectedSunumVeAciklama: (a: string) => void;
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
  handleClose,
  handleSetSelectedTamOlma,
  handleSetSelectedDogruluk,
  handleSetSelectedVarOlma,
  handleSetSelectedDegerleme,
  handleSetSelectedDonemsellik,
  handleSetSelectedGecerlilik,
  handleSetSelectedSunumVeAciklama,
  handleUpdate,
}) => {
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
                {finansalTabloHesaplar} Tespit Edilen Riskler
              </Typography>
              <Box px={1} pt={3}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
                        <Typography variant="h6">Tam Olma</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
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
                  <Grid size={12}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
                        <Typography variant="h6">Doğruluk</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
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
                  <Grid size={12}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
                        <Typography variant="h6">Var Olma</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
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
                  <Grid size={12}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
                        <Typography variant="h6">Değerleme</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
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
                  <Grid size={12}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
                        <Typography variant="h6">Dönemsellik</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
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
                  <Grid size={12}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
                        <Typography variant="h6">Geçerlilik</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
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
                  <Grid size={12}>
                    <Grid container>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
                        <Typography variant="h6">Sunum ve Açıklama</Typography>
                      </Grid>
                      <Grid
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"left"}
                        size={6}
                      >
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
              <Box mt={3}>
                <Divider />
                <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
                  <Button variant="outlined" color="error" onClick={handleClose}>
                    Vazgeç
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
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
                  >
                    Güncelle
                  </Button>
                </Stack>
              </Box>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};


