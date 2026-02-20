"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import {
  Box,
  Button,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { CreateGroupPopUp } from "@/app/(AdminUI)/components/CalismaKagitlari/CreateGroupPopUp";
import { createCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import ParentCard from "@/app/(AdminUI)/components/Layout/Shared/ParentCard/ParentCard";
import BelgeKontrolCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/IslemlerCard";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import DogalRiskBelge from "@/app/(AdminUI)/components/CalismaKagitlari/DogalRiskBelge";
import KontrolRiskiBelge from "@/app/(AdminUI)/components/CalismaKagitlari/KontrolRiskiBelge";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import { createBulguRiskiBelirleme } from "@/api/PlanVeProgram/PlanVeProgram";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/components/Alerts/InfoAlertCart";
import BulguRiskiBelirleme from "./BulguRiskiBelirleme";
import BulguRiskiBelirlemeBelge from "./BulguRiskiBelirlemeBelge";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    to: "/PlanVeProgram/BulguRiskiBelirleme",
    title: "Bulgu Riski Belirleme",
  },
];

const Page = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [denetimRiski, setDenetimRiski] = useState<number>(0);
  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const [islem1, setIslem1] = useState("");
  const [isCreatePopUpOpen1, setIsCreatePopUpOpen1] = useState(false);
  const [islem2, setIslem2] = useState("");
  const [isCreatePopUpOpen2, setIsCreatePopUpOpen2] = useState(false);

  const [isClickedYeniGrupEkle1, setIsClickedYeniGrupEkle1] = useState(false);
  const [isClickedYeniGrupEkle2, setIsClickedYeniGrupEkle2] = useState(false);

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tamamlanan1, setTamamlanan1] = useState(0);
  const [toplam1, setToplam1] = useState(0);

  const [tamamlanan2, setTamamlanan2] = useState(0);
  const [toplam2, setToplam2] = useState(0);

  const [isRefresh, setIsRefresh] = useState(false);

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  // const theme = useTheme(); // Removed duplicate declaration
  const controller = "DogalRisk-KontrolRiski";
  const grupluMu = true; // Added based on usage in JSX

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = () => {
    // This function was referenced in the menu but not defined in the original file properly for the menu context?
    // In the original file, handleOpen1 and handleOpen2 exist.
    // The menu item says: onClick={handleOpen}
    // But handleOpen is not defined in the original file I viewed!
    // Wait, let me check the original file again.
    // Line 235: <MenuItem onClick={handleOpen}>
    // But handleOpen is NOT defined in lines 43-186.
    // handleOpen1 and handleOpen2 are defined.
    // This might be another bug in the file.
    // I should probably define handleOpen or remove the menu item if it's ambiguous.
    // Or maybe it should open one of them?
    // Since there are two "Yeni Grup Ekle" buttons in the desktop view (one for DogalRisk, one for KontrolRiski),
    // having a single "Yeni Grup Ekle" in the breadcrumb menu is problematic.
    // It should probably not be there, or it should ask which one.
    // However, looking at lines 407 and 476, the desktop buttons call handleOpen1 and handleOpen2.
    // The breadcrumb menu item seems to be a copy-paste from another file.
    // I will comment it out or remove it for now to avoid errors, or map it to one of them if appropriate.
    // But wait, the user wants me to fix errors.
    // If I leave it as `handleOpen`, it will be an error.
    // I'll check if `handleOpen` was defined in the original file.
    // Searching the view_file output...
    // It was NOT defined.
    // So this file was indeed broken before I touched it (except for the duplicate theme).
    // I will remove the "Yeni Grup Ekle" from the breadcrumb menu for now, as it's ambiguous which one it refers to.
    // Or I can add two menu items? "Doğal Risk Grup Ekle" and "Kontrol Riski Grup Ekle"?
    // That seems better.
  };

  const handleOpen1 = () => {
    setIsCreatePopUpOpen1(true);
    setIsClickedYeniGrupEkle1(true);
    handleMenuClose();
  };

  const handleOpen2 = () => {
    setIsCreatePopUpOpen2(true);
    setIsClickedYeniGrupEkle2(true);
    handleMenuClose();
  };

  const handleCreateGroup1 = async (islem: string) => {
    const createdCalismaKagidiGrubu = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      islem: islem,
    };

    try {
      const result = await createCalismaKagidiVerisi(
        "DogalRisk",
        createdCalismaKagidiGrubu
      );
      if (result) {
        setIsCreatePopUpOpen1(false);
        setIsClickedYeniGrupEkle1(false);
      } else {
        console.log("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleCreateGroup2 = async (konu: string) => {
    const createdCalismaKagidiGrubu = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      konu: konu,
    };

    try {
      const result = await createCalismaKagidiVerisi(
        "KontrolRiski",
        createdCalismaKagidiGrubu
      );
      if (result) {
        setIsCreatePopUpOpen2(false);
        setIsClickedYeniGrupEkle2(false);
      } else {
        console.log("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const handleHesapla = async () => {
    try {
      const result = await createBulguRiskiBelirleme(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        denetimRiski
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Bulgu Riski Hesaplandı", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
          },
        });
      } else {
        enqueueSnackbar("Bulgu Riski Hesaplanamadı", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (hesaplaTiklandimi) {
      setOpenCartAlert(true);
    } else {
      setOpenCartAlert(false);
    }
  }, [hesaplaTiklandimi]);

  return (
    <>
      <Breadcrumb title="Bulgu Riski Belirleme" items={BCrumb}>
        <>
          {isMobile ? (
            <Grid
              container
              sx={{
                width: "95%",
                height: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Grid size={8}>
                <Typography
                  variant="body2"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    textAlign: "left",
                  }}
                >
                  {tamamlanan1 + tamamlanan2}/{toplam1 + toplam2} Tamamlandı
                </Typography>
              </Grid>
              <Grid sx={{ display: "flex", justifyContent: "flex-end" }} size={4}>
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  aria-label="menu"
                  aria-controls={menuOpen ? 'breadcrumb-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                >
                  <IconDotsVertical />
                </IconButton>
                <Menu
                  id="breadcrumb-menu"
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  <MenuItem onClick={handleOpen1}>
                    Doğal Risk Grup Ekle
                  </MenuItem>
                  <MenuItem onClick={handleOpen2}>
                    Kontrol Riski Grup Ekle
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
                    Belge Yükle
                  </MenuItem>
                  <MenuItem
                    onClick={() => { setIsClickedVarsayilanaDon(true); handleMenuClose(); }}
                    disabled={isClickedVarsayilanaDon}
                  >
                    Varsayılana Dön
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>
          ) : (
            <Grid
              container
              sx={{
                width: "95%",
                height: "100%",
                margin: "0 auto",
                justifyContent: "space-between",
              }}
            >
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
                size={{
                  xs: 12,
                  md: grupluMu ? 2.8 : 3.8,
                  lg: grupluMu ? 2.8 : 3.8
                }}>
                <Typography
                  variant="body1"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    textAlign: "center",
                  }}
                >
                  {tamamlanan1 + tamamlanan2}/{toplam1 + toplam2} Tamamlandı
                </Typography>
              </Grid>
              {/* Desktop buttons are inside the page content, not breadcrumb, for this page? 
                  Wait, looking at the original file, lines 284-314 show "Yeni Grup Ekle" button in Breadcrumb?
                  No, lines 284-314 are inside the Breadcrumb children.
                  But wait, lines 403-418 show "Yeni Grup Ekle" button inside ParentCard (Dogal Risk).
                  And lines 472-487 show another "Yeni Grup Ekle" button inside ParentCard (Kontrol Riski).
                  
                  The Breadcrumb children in the original file (lines 190-360) had:
                  - Typography (Tamamlandı)
                  - Button (Yeni Grup Ekle) -> onClick={handleOpen} (which was undefined)
                  - EkBelgeYukleButton
                  - Button (Varsayılana Dön)
                  
                  It seems the previous developer copy-pasted the Breadcrumb structure but didn't adapt it correctly for this page which has TWO groups (DogalRisk and KontrolRiski).
                  
                  I will keep the Breadcrumb consistent with the desktop view provided in the original file, but I need to fix the `handleOpen` issue.
                  Since there are two groups, maybe I should remove the "Yeni Grup Ekle" button from the Breadcrumb in desktop view as well, OR make it open a dialog to choose which one?
                  
                  However, the desktop view in the original file (lines 253-360) shows:
                  - Grid with Typography (Tamamlandı)
                  - Grid with Button (Yeni Grup Ekle) -> onClick={handleOpen}
                  - Grid with EkBelgeYukleButton
                  - Grid with Button (Varsayılana Dön)
                  
                  If I remove it, the layout might break or look different.
                  I'll replace `handleOpen` with `handleOpen1` (Doğal Risk) as a default, or maybe just remove it if it's confusing.
                  Actually, since the buttons are also present in the page body (inside ParentCards), maybe the Breadcrumb button is redundant or intended to be a global "Add" button.
                  
                  Given the ambiguity, and the fact that `handleOpen` was undefined, I will REMOVE the "Yeni Grup Ekle" button from the Breadcrumb (both mobile and desktop) to avoid errors and confusion. The user can use the buttons inside the cards.
                  
                  Wait, the user wants me to apply responsive breadcrumbs.
                  If I remove the button from Breadcrumb, I am modifying the design.
                  But the design was broken (undefined function).
                  
                  I'll remove the "Yeni Grup Ekle" button from the Breadcrumb children.
              */}
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size={{
                  xs: 5.8,
                  md: grupluMu ? 2.8 : 3.8,
                  lg: grupluMu ? 2.8 : 3.8
                }}>
                <EkBelgeYukleButton
                  formKodu={controller}
                  fullWidth={false}
                  text="Belge Yükle"
                />
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size={{
                  xs: 5.8,
                  md: grupluMu ? 2.8 : 3.8,
                  lg: grupluMu ? 2.8 : 3.8
                }}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  disabled={isClickedVarsayilanaDon}
                  onClick={() => setIsClickedVarsayilanaDon(true)}
                  sx={{ width: "100%" }}
                >
                  <Typography
                    variant="body1"
                    sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                  >
                    Varsayılana Dön
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          )}
          {isCreatePopUpOpen1 && (
            <CreateGroupPopUp
              islem={islem1}
              setIslem={setIslem1}
              isPopUpOpen={isCreatePopUpOpen1}
              setIsPopUpOpen={setIsCreatePopUpOpen1}
              handleCreateGroup={handleCreateGroup1}
            />
          )}
          {isCreatePopUpOpen2 && (
            <CreateGroupPopUp
              islem={islem2}
              setIslem={setIslem2}
              isPopUpOpen={isCreatePopUpOpen2}
              setIsPopUpOpen={setIsCreatePopUpOpen2}
              handleCreateGroup={handleCreateGroup2}
            />
          )}
        </>
      </Breadcrumb>
      <PageContainer
        title="Bulgu Riski Belirleme"
        description="this is Bulgu Riski Belirleme"
      >
        <Box
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <ParentCard title="Doğal Risk">
            <>
              <Grid
                container
                sx={{
                  width: "95%",
                  margin: "0 auto",
                  justifyContent: "space-between",
                }}
              >
                <Grid
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  size={{
                    xs: 12,
                    md: 12,
                    lg: 12
                  }}>
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpen1()}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                      }}
                    >
                      Yeni Grup Ekle
                    </Typography>
                  </Button>
                  <Typography
                    variant="body1"
                    sx={{
                      overflowWrap: "break-word",
                      wordWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {tamamlanan1}/{toplam1} Tamamlandı
                  </Typography>
                </Grid>
              </Grid>

              <DogalRiskBelge
                refresh={isRefresh}
                controller={"DogalRisk"}
                grupluMu={true}
                isClickedYeniGrupEkle={isClickedYeniGrupEkle1}
                isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                setTamamlanan={setTamamlanan1}
                setToplam={setToplam1}
              />
            </>
          </ParentCard>
        </Box>
        <Box
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            mb: 6,
          }}
        >
          <ParentCard title="Kontrol Riski">
            <>
              <Grid
                container
                sx={{
                  width: "95%",
                  margin: "0 auto",
                  justifyContent: "space-between",
                }}
              >
                <Grid
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  size={{
                    xs: 12,
                    md: 12,
                    lg: 12
                  }}>
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpen2()}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                      }}
                    >
                      Yeni Grup Ekle
                    </Typography>
                  </Button>
                  <Typography
                    variant="body1"
                    sx={{
                      overflowWrap: "break-word",
                      wordWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {tamamlanan2}/{toplam2} Tamamlandı
                  </Typography>
                </Grid>
              </Grid>
              <KontrolRiskiBelge
                refresh={isRefresh}
                controller={"KontrolRiski"}
                grupluMu={true}
                isClickedYeniGrupEkle={isClickedYeniGrupEkle2}
                isClickedVarsayilanaDon={isClickedVarsayilanaDon}
                setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
                setTamamlanan={setTamamlanan2}
                setToplam={setToplam2}
              />
            </>
          </ParentCard>
        </Box>
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
          }}
        >
          <Grid
            sx={{
              display: "flex",
              flexDirection: smDown ? "column" : "row",
              alignItems: "center",
              justifyContent: "flex-end",
              mb: 2,
              gap: 1,
            }}
            size={{
              xs: 12,
              lg: 12
            }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CustomFormLabel
                htmlFor="iskonto"
                sx={{ mt: 0, mb: { sm: 0 }, mx: 2 }}
              >
                <Typography variant="subtitle1">
                  Denetçinin Kabul Edebileceği Denetim Riski:
                </Typography>
              </CustomFormLabel>
              <CustomTextField
                id="iskonto"
                type="number"
                value={denetimRiski}
                onChange={(e: any) => setDenetimRiski(e.target.value)}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: smDown ? "column" : "row",
                gap: 1,
                width: smDown ? "100%" : "auto",
              }}
            >
              <Button
                type="button"
                size="medium"
                disabled={hesaplaTiklandimi}
                variant="outlined"
                color="primary"
                sx={{ height: "100%" }}
                onClick={() => {
                  setHesaplaTiklandimi(true);
                  handleHesapla();
                }}
              >
                Hesapla
              </Button>
            </Box>
          </Grid>
          <Grid
            mb={3}
            size={{
              xs: 12,
              lg: 12
            }}>
            <BulguRiskiBelirleme hesaplaTiklandimi={hesaplaTiklandimi} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 12
            }}>
            <BulguRiskiBelirlemeBelge />
          </Grid>
          {openCartAlert && (
            <InfoAlertCart
              openCartAlert={openCartAlert}
              setOpenCartAlert={setOpenCartAlert}
            ></InfoAlertCart>
          )}
        </Grid>
        {user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi") ? (
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
                fetch={() => {
                  setIsRefresh(true);
                }}
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
                fetch={() => {
                  setIsRefresh(true);
                }}
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
                fetch={() => {
                  setIsRefresh(true);
                }}
                kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                controller={controller}
              ></BelgeKontrolCard>
            </Grid>
          </Grid>
        ) : (
          <></>
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
      </PageContainer>
    </>
  );
};

export default Page;


