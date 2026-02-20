import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconButton,
  Dialog,
  DialogContent,
  Stack,
  Divider,
  Box,
  Typography,
  Chip,
  Button,
  useTheme,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import CompanyBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/CompanyBoxAutoComplete";
import YearBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/YearBoxAutoComplete";
import { useDispatch, useSelector } from "@/store/hooks";
import {
  setBobimi,
  setDenetimTuru,
  setDenetlenenFirmaAdi,
  setDenetlenenId,
  setEnflasyonmu,
  setKonsolidemi,
  setRol,
  setTfrsmi,
  setYil,
  setToken,
  setRefreshToken,
} from "@/store/user/UserSlice";
import { AppState } from "@/store/store";
import { getRol } from "@/api/Sozlesme/DenetimKadrosuAtama";
import { updateSonSecilenAyarlari } from "@/api/Kullanici/KullaniciAyarlar";
import { apiFetch, url } from "@/api/apiBase";

const SirketPopup = () => {
  // drawer top
  const user = useSelector((state: AppState) => state.userReducer);

  const customizer = useSelector((state: AppState) => state.customizer);

  const theme = useTheme();
  const router = useRouter();

  const [showDrawer2, setShowDrawer2] = useState(false);
  const [selectedId, setSelectedId] = useState(user.denetlenenId || 0);
  const [selectedAdi, setSelectedAdi] = useState(user.denetlenenFirmaAdi || "");
  const [selectedDenetimTuru, setSelectedDenetimTuru] = useState(user.denetimTuru || "");
  const [selectedBobimi, setSelectedBobimi] = useState(user.bobimi || false);
  const [selectedTfrsmi, setSelectedTfrsmi] = useState(user.tfrsmi || false);
  const [selectedEnflasyonmu, setSelectedEnflasyonmu] = useState(user.enflasyonmu || false);
  const [selectedKonsolidemi, setSelectedKonsolidemi] = useState(user.konsolidemi || false);
  const [selectedYear, setSelectedYear] = useState(user.yil?.toString() || "");
  const [selectedYearNumber, setSelectedYearNumber] = useState(user.yil || 0);

  const [year, setYear] = useState(user.yil);

  const [company, setCompany] = useState(
    user.denetlenenFirmaAdi?.split(" ").slice(0, 2).join(" ")
  );

  const dispatch = useDispatch();

  // Redux state deï¿½iï¿½tiï¿½inde local state'i gï¿½ncelle
  useEffect(() => {
    if (user.yil) {
      setYear(user.yil);
    }
    if (user.denetlenenFirmaAdi) {
      setCompany(user.denetlenenFirmaAdi.split(" ").slice(0, 2).join(" "));
    }
  }, [user.yil, user.denetlenenFirmaAdi]);

  const handleDrawerClose2 = () => {
    setShowDrawer2(false);
  };

  const handleButtonClick = async () => {
    await dispatch(setDenetlenenId(selectedId));
    await dispatch(setDenetlenenFirmaAdi(selectedAdi));
    await dispatch(setYil(selectedYearNumber));
    await dispatch(setDenetimTuru(selectedDenetimTuru));
    await dispatch(setBobimi(selectedBobimi));
    await dispatch(setTfrsmi(selectedTfrsmi));
    await dispatch(setEnflasyonmu(selectedEnflasyonmu));
    await dispatch(setKonsolidemi(selectedKonsolidemi));
    await setYear(parseInt(selectedYear));
    await setCompany(selectedAdi.split(" ").slice(0, 2).join(" "));
    localStorage.setItem("fas_denetlenenId", selectedId.toString());
    localStorage.setItem("fas_yil", selectedYear.toString());
    try {
      if (selectedId && selectedYearNumber) {
        // Redux ve LocalStorage gï¿½ncellemeleri zaten yapï¿½ldï¿½.

        // 1. ï¿½nce DB Persist (Son Seï¿½ilen Ayarlar) - BU ï¿½NEMLï¿½: 
        // Backend'deki session/ayarlar gï¿½ncellenmeli ki refresh token yeni ï¿½irketle gelsin.
        if (user.token && user.id && user.id !== 0) {
          console.log(`SirketPopup - Persisting selection for user ${user.id}: Company=${selectedId}, Year=${selectedYearNumber}`);
          try {
            await updateSonSecilenAyarlari(user.id, selectedId, selectedYearNumber);
            console.log("SirketPopup - Persistence update successful.");

            // ?? TOKEN REFRESH: DB gï¿½ncellendikten sonra yeni token al
            // Yeni token, gï¿½ncel denetlenenId ve yil claim'lerini iï¿½erecek
            const refreshToken = localStorage.getItem("fas_refreshToken");
            if (refreshToken) {
              try {
                const refreshResponse = await fetch(`${url.endsWith('/') ? url.slice(0, -1) : url}/Auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ RefreshToken: refreshToken }),
                });

                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  if (refreshData?.token) {
                    // Yeni token'larï¿½ kaydet
                    localStorage.setItem("fas_token", refreshData.token);
                    localStorage.setItem("fas_refreshToken", refreshData.refreshToken);
                    dispatch(setToken(refreshData.token));
                    dispatch(setRefreshToken(refreshData.refreshToken));
                    console.log("? SirketPopup - Token refresh successful, yeni claim'ler alï¿½ndï¿½.");
                  }
                } else {
                  console.warn("?? SirketPopup - Token refresh baï¿½arï¿½sï¿½z, eski token kullanï¿½lacak.");
                }
              } catch (refreshErr) {
                console.warn("?? SirketPopup - Token refresh hatasï¿½:", refreshErr);
              }
            }
          } catch (err) {
            console.error("SirketPopup - Persistence update hatasï¿½:", err);
          }
        }

        // 2. Rol Bilgisi Gï¿½ncelleme
        try {
          const rolVerileri = await getRol(user.id || 0, selectedId, selectedYearNumber);
          if (rolVerileri) {
            dispatch(setRol(rolVerileri.rol));
            console.log("SirketPopup - Rol gï¿½ncellendi.");
          }
        } catch (err) {
          console.error("SirketPopup - Rol gï¿½ncelleme hatasï¿½:", err);
        }
      }
    } catch (error) {
      console.error("SirketPopup - Genel hata:", error);
    }

    handleDrawerClose2();

    // Sayfayï¿½ tamamen yenile - tï¿½m veriler gï¿½ncellenecek
    // localStorage'daki yeni deï¿½erlerle (id ve yï¿½l) aï¿½ï¿½lacak
    window.location.reload();
  };

  return (
    <>
      <IconButton
        aria-label="show 4 new mails"
        color="inherit"
        aria-controls="search-menu"
        aria-haspopup="true"
        aria-hidden="false"
        onClick={() => setShowDrawer2(true)}
        size="medium"
      >
        <Chip
          variant="outlined"
          label={
            user.denetlenenFirmaAdi && user.yil
              ? company + " - " + year
              : "ï¿½irket ve Yï¿½l Seï¿½iniz"
          }
          size="medium"
          sx={{
            borderColor:
              customizer.activeMode === "dark"
                ? theme.palette.primary.dark
                : theme.palette.primary.main,
            color:
              customizer.activeMode === "dark"
                ? theme.palette.primary.dark
                : theme.palette.primary.main,
          }}
        />
      </IconButton>
      <Dialog
        open={showDrawer2}
        onClose={() => setShowDrawer2(false)}
        fullWidth
        maxWidth={"sm"}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { position: "fixed", top: 30, m: 0 } }}
      >
        <DialogContent className="testdialog">
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Typography variant="h5" p={1}>
              ï¿½irket ve Yï¿½l Deï¿½iï¿½tir
            </Typography>
            <IconButton size="small" onClick={handleDrawerClose2}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <Box p={3} sx={{ height: "310px" }}>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              ï¿½irket Seï¿½iniz
            </Typography>
            <CompanyBoxAutocomplete
              onSelectId={(selectedId) => setSelectedId(selectedId)}
              onSelectAdi={(selectedAdi) => setSelectedAdi(selectedAdi)}
              onSelectDenetimTuru={(selectedDenetimTuru) =>
                setSelectedDenetimTuru(selectedDenetimTuru)
              }
              onSelectBobimi={(selectedBobimi) =>
                setSelectedBobimi(selectedBobimi)
              }
              onSelectTfrsmi={(selectedTfrsmi) =>
                setSelectedTfrsmi(selectedTfrsmi)
              }
              onSelectEnflasyonmu={(selectedEnflasyonmu) =>
                setSelectedEnflasyonmu(selectedEnflasyonmu)
              }
              onSelectKonsolidemi={(selectedKonsolidemi) =>
                setSelectedKonsolidemi(selectedKonsolidemi)
              }
              currentId={selectedId}
            />
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Yï¿½l Seï¿½iniz
            </Typography>
            <YearBoxAutocomplete
              onSelect={(selectedYear) => setSelectedYear(selectedYear)}
              onSelectYear={(selectedYear) =>
                setSelectedYearNumber(selectedYear)
              }
              selectedDenetlenenId={selectedId}
              currentYear={selectedYearNumber}
            />
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={handleButtonClick}
          >
            ï¿½irket Seï¿½
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default SirketPopup;

