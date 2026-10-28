"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import { CreateGroupPopUp } from "@/app/(AdminUI)/components/CalismaKagitlari/CreateGroupPopUp";
import { createCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import CalismaKagidiBelge from "@/app/(AdminUI)/components/CalismaKagitlari/CalismaKagidiBelge";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import PersonelBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import NoUsersAlert from "@/app/(AdminUI)/components/Alerts/NoUsersAlert";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/PlanVeProgram/MeslekiEtik",
    title: "Mesleki Etik",
  },
];

const Page = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [islem, setIslem] = useState("");
  const [isCreatePopUpOpen, setIsCreatePopUpOpen] = useState(false);

  const [isClickedYeniGrupEkle, setIsClickedYeniGrupEkle] = useState(false);
  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const user = useSelector((state: AppState) => state.userReducer);
  const controller = "MeslekiEtik";
  const grupluMu = true;
  const alanAdi1 = "ï¿½ï¿½lem";
  const alanAdi2 = "Tespit";

  const [personelId, setPersonelId] = useState(user.id);
  const [personelAdi, setPersonelAdi] = useState(user.kullaniciAdi);
  const [showNoUsersAlert, setShowNoUsersAlert] = useState(false);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };



  const handleOpen = () => {
    setIsCreatePopUpOpen(true);
    setIsClickedYeniGrupEkle(true);
    handleMenuClose();
  };

  const handleCreateGroup = async (islem: string) => {
    const createdCalismaKagidiGrubu = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      islem: islem,
      tespit: "",
    };

    try {
      const result = await createCalismaKagidiVerisi(
        controller || "",
        createdCalismaKagidiGrubu
      );
      if (result) {
        setIsCreatePopUpOpen(false);
        setIsClickedYeniGrupEkle(false);
      } else {
        console.log("ï¿½alï¿½ï¿½ma Kaï¿½ï¿½dï¿½ Verisi ekleme baï¿½arï¿½sï¿½z");
      }
    } catch (error) {
      console.log("Bir hata oluï¿½tu:", error);
    }
  };

  return (
    <>
      <Breadcrumb title="Mesleki Etik" items={BCrumb}>
        <>
          {isMobile ? (
            // Mobile layout - compact with dropdown menu
            (<Grid
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
                  {tamamlanan}/{toplam} Tamamlandï¿½
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
                  {grupluMu && (
                    <MenuItem onClick={handleOpen}>
                      Yeni Grup Ekle
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleMenuClose}>
                    Belge Yï¿½kle
                  </MenuItem>
                  <MenuItem
                    onClick={() => { setIsClickedVarsayilanaDon(true); handleMenuClose(); }}
                    disabled={isClickedVarsayilanaDon}
                  >
                    Varsayï¿½lana Dï¿½n
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>)
          ) : (
            // Desktop layout - original button grid
            (<Grid
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
                  {tamamlanan}/{toplam} Tamamlandï¿½
                </Typography>
              </Grid>
              {grupluMu && (
                <Grid
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  size={{
                    xs: 3.8,
                    md: grupluMu ? 2.8 : 3.8,
                    lg: grupluMu ? 2.8 : 3.8
                  }}>
                  <Button
                    size="medium"
                    variant="outlined"
                    color="primary"
                    onClick={() => handleOpen()}
                    sx={{ width: "100%" }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        overflowWrap: "break-word",
                        wordWrap: "break-word",
                      }}
                    >
                      Yeni Grup Ekle
                    </Typography>{" "}
                  </Button>
                </Grid>
              )}
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
                  text="Belge Yï¿½kle"
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
                    Varsayï¿½lana Dï¿½n
                  </Typography>
                </Button>
              </Grid>
            </Grid>)
          )}
          {isCreatePopUpOpen && (
            <CreateGroupPopUp
              islem={islem}
              setIslem={setIslem}
              isPopUpOpen={isCreatePopUpOpen}
              setIsPopUpOpen={setIsCreatePopUpOpen}
              handleCreateGroup={handleCreateGroup}
            />
          )}
        </>
      </Breadcrumb>
      <PageContainer title="Mesleki Etik" description="this is Mesleki Etik">
        <Grid container>
          <Grid size={12}>
            <PersonelBoxAutocomplete
              initialValue={user.kullaniciAdi}
              tip={"Hepsi"}
              onSelectAdi={(selectedPersonelAdi) =>
                setPersonelAdi(selectedPersonelAdi)
              }
              onSelectId={(selectedPersonelId) =>
                setPersonelId(selectedPersonelId)
              }
              onEmptyUsers={() => setShowNoUsersAlert(true)}
            />
          </Grid>
        </Grid>
        <Box>
          <CalismaKagidiBelge
            controller={controller}
            grupluMu={grupluMu}
            alanAdi1={alanAdi1}
            alanAdi2={alanAdi2}
            kullaniciId={personelId}
            isClickedYeniGrupEkle={isClickedYeniGrupEkle}
            isClickedVarsayilanaDon={isClickedVarsayilanaDon}
            setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
            setTamamlanan={setTamamlanan}
            setToplam={setToplam}
          />
        </Box>
      </PageContainer>
      <NoUsersAlert
        open={showNoUsersAlert}
        onClose={() => setShowNoUsersAlert(false)}
      />
    </>
  );
};

export default Page;


