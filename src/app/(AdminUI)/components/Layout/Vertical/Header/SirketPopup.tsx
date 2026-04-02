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
  resetToNull,
  setBobimi,
  setDenetimTuru,
  setDenetlenenFirmaAdi,
  setDenetlenenId,
  setEnflasyonmu,
  setKonsolidemi,
  setRefreshToken,
  setRol,
  setTfrsmi,
  setToken,
  setYil,
} from "@/store/user/UserSlice";
import { AppState } from "@/store/store";
import { getRol } from "@/api/Sozlesme/DenetimKadrosuAtama";
import { updateSonSecilenAyarlari } from "@/api/Kullanici/KullaniciAyarlar";
import { clearStoredAuthTokens } from "@/utils/authStorage";
import { refreshAuthSession } from "@/utils/authSession";

const SirketPopup = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);

  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const [showDrawer2, setShowDrawer2] = useState(false);
  const [selectedId, setSelectedId] = useState(user.denetlenenId || 0);
  const [selectedAdi, setSelectedAdi] = useState(user.denetlenenFirmaAdi || "");
  const [selectedDenetimTuru, setSelectedDenetimTuru] = useState(
    user.denetimTuru || ""
  );
  const [selectedBobimi, setSelectedBobimi] = useState(user.bobimi || false);
  const [selectedTfrsmi, setSelectedTfrsmi] = useState(user.tfrsmi || false);
  const [selectedEnflasyonmu, setSelectedEnflasyonmu] = useState(
    user.enflasyonmu || false
  );
  const [selectedKonsolidemi, setSelectedKonsolidemi] = useState(
    user.konsolidemi || false
  );
  const [selectedYear, setSelectedYear] = useState(user.yil?.toString() || "");
  const [selectedYearNumber, setSelectedYearNumber] = useState(user.yil || 0);
  const [year, setYear] = useState(user.yil);
  const [company, setCompany] = useState(
    user.denetlenenFirmaAdi?.split(" ").slice(0, 2).join(" ")
  );

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

  const forceRelogin = () => {
    clearStoredAuthTokens();
    dispatch(resetToNull(""));
    router.push("/");
  };

  const handleButtonClick = async () => {
    dispatch(setDenetlenenId(selectedId));
    dispatch(setDenetlenenFirmaAdi(selectedAdi));
    dispatch(setYil(selectedYearNumber));
    dispatch(setDenetimTuru(selectedDenetimTuru));
    dispatch(setBobimi(selectedBobimi));
    dispatch(setTfrsmi(selectedTfrsmi));
    dispatch(setEnflasyonmu(selectedEnflasyonmu));
    dispatch(setKonsolidemi(selectedKonsolidemi));
    setYear(parseInt(selectedYear));
    setCompany(selectedAdi.split(" ").slice(0, 2).join(" "));

    localStorage.setItem("fas_denetlenenId", selectedId.toString());
    localStorage.setItem("fas_yil", selectedYear.toString());

    try {
      if (selectedId && selectedYearNumber && user.token && user.id) {
        await updateSonSecilenAyarlari(user.id, selectedId, selectedYearNumber);

        try {
          const refreshedSession = await refreshAuthSession({
            accessToken: user.token,
            refreshToken: user.refreshToken,
          });

          dispatch(setToken(refreshedSession.token));
          dispatch(setRefreshToken(refreshedSession.refreshToken));
        } catch (refreshError) {
          console.error(
            "SirketPopup - Token refresh hatasi, yeniden giris gerekiyor:",
            refreshError
          );
          forceRelogin();
          return;
        }

        try {
          const rolVerileri = await getRol(
            user.id || 0,
            selectedId,
            selectedYearNumber
          );
          if (rolVerileri) {
            dispatch(setRol(rolVerileri.rol));
          }
        } catch (roleError) {
          console.error("SirketPopup - Rol guncelleme hatasi:", roleError);
        }
      }
    } catch (error) {
      console.error("SirketPopup - Genel hata:", error);
      forceRelogin();
      return;
    }

    handleDrawerClose2();
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
              ? `${company} - ${year}`
              : "Sirket ve Yil Seciniz"
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
              Sirket ve Yil Degistir
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
              Sirket Seciniz
            </Typography>
            <CompanyBoxAutocomplete
              onSelectId={(nextSelectedId) => setSelectedId(nextSelectedId)}
              onSelectAdi={(nextSelectedAdi) => setSelectedAdi(nextSelectedAdi)}
              onSelectDenetimTuru={(nextSelectedDenetimTuru) =>
                setSelectedDenetimTuru(nextSelectedDenetimTuru)
              }
              onSelectBobimi={(nextSelectedBobimi) =>
                setSelectedBobimi(nextSelectedBobimi)
              }
              onSelectTfrsmi={(nextSelectedTfrsmi) =>
                setSelectedTfrsmi(nextSelectedTfrsmi)
              }
              onSelectEnflasyonmu={(nextSelectedEnflasyonmu) =>
                setSelectedEnflasyonmu(nextSelectedEnflasyonmu)
              }
              onSelectKonsolidemi={(nextSelectedKonsolidemi) =>
                setSelectedKonsolidemi(nextSelectedKonsolidemi)
              }
              currentId={selectedId}
            />
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Yil Seciniz
            </Typography>
            <YearBoxAutocomplete
              onSelect={(nextSelectedYear) => setSelectedYear(nextSelectedYear)}
              onSelectYear={(nextSelectedYear) =>
                setSelectedYearNumber(nextSelectedYear)
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
            Sirket Sec
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default SirketPopup;
