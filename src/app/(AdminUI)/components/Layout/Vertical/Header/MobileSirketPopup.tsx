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
  Button,
} from "@mui/material";
import { IconBuildingSkyscraper, IconX } from "@tabler/icons-react";
import CompanyBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/CompanyBoxAutoComplete";
import YearBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/YearBoxAutoComplete";
import { useDispatch, useSelector } from "@/store/hooks";
import {
  setDenetlenenFirmaAdi,
  setDenetlenenId,
  setYil,
  setBobimi,
  setTfrsmi,
  setDenetimTuru,
  setRol,
  setKonsolidemi,
  setEnflasyonmu,
  setToken,
  setRefreshToken,
} from "@/store/user/UserSlice";
import { AppState } from "@/store/store";
import { url } from "@/api/apiBase";

const MobileSirketPopup = () => {
  // drawer top
  const user = useSelector((state: AppState) => state.userReducer);
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

  // Redux state deï¿½iï¿½ tiï¿½inde local state'i gï¿½ncelle
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
          console.log(`MobileSirketPopup - Persisting selection for user ${user.id}: Company=${selectedId}, Year=${selectedYearNumber}`);
          try {
          
            console.log("MobileSirketPopup - Persistence update successful.");

            // ?? TOKEN REFRESH: DB gï¿½ncellendikten sonra yeni token al
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
                    localStorage.setItem("fas_token", refreshData.token);
                    localStorage.setItem("fas_refreshToken", refreshData.refreshToken);
                    dispatch(setToken(refreshData.token));
                    dispatch(setRefreshToken(refreshData.refreshToken));
                    console.log("? MobileSirketPopup - Token refresh successful.");
                  }
                } else {
                  console.warn("?? MobileSirketPopup - Token refresh baï¿½arï¿½sï¿½z.");
                }
              } catch (refreshErr) {
                console.warn("?? MobileSirketPopup - Token refresh hatasï¿½:", refreshErr);
              }
            }
          } catch (err) {
            console.error("MobileSirketPopup - Persistence update hatasï¿½:", err);
          }
        }

        // 2. Rol Bilgisi Gï¿½ncelleme
        try {
     
        } catch (err) {
          console.error("MobileSirketPopup - Rol gï¿½ncelleme hatasï¿½:", err);
        }
      }
    } catch (error) {
      console.error("MobileSirketPopup - Genel hata:", error);
    }

    handleDrawerClose2();

    // Sayfayï¿½ tamamen yenile - tï¿½m veriler gï¿½ncellenecek
    window.location.reload();
  };

  return (
    <>
      <IconButton
        aria-label="show 4 new mails"
        color="inherit"
        aria-controls="search-menu"
        aria-haspopup="true"
        onClick={() => setShowDrawer2(true)}
      >
        <IconBuildingSkyscraper size="20" />
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

export default MobileSirketPopup;

