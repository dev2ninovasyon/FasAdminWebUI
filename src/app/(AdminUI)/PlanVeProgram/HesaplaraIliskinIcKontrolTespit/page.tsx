"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, MenuItem, Typography, IconButton, Menu, useTheme, useMediaQuery } from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import { CreateGroupPopUp } from "@/app/(AdminUI)/components/CalismaKagitlari/CreateGroupPopUp";
import { createCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import HesaplaraIliskinIcKontrolTespitBelge from "@/app/(AdminUI)/components/CalismaKagitlari/HesaplaraIliskinIcKontrolTespitBelge";
import CustomSelect from "@/app/components/Forms/ThemeElements/CustomSelect";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton"
const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    to: "/PlanVeProgram/HesaplaraIliskinIcKontrolTespit",
    title: "Hesaplara ï¿½liï¿½kin ï¿½ï¿½ Kontrol Tespit",
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
  const controller = "HesaplaraIliskinIcKontrolTespit";
  const grupluMu = false;

  const [konu, setKonu] = useState("Nakit ve Nakit Benzerleri");
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

  const handleCreateGroup = async (konu: string) => {
    const createdCalismaKagidiGrubu = {
      denetlenenId: user.denetlenenId,
      denetciId: user.denetciId,
      yil: user.yil,
      konu: konu,
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
      <Breadcrumb title="Hesaplara ï¿½liï¿½kin ï¿½ï¿½ Kontrol Tespit" items={BCrumb}>
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
      <PageContainer
        title="Hesaplara ï¿½liï¿½kin ï¿½ï¿½ Kontrol Tespit"
        description="this is Hesaplara ï¿½liï¿½kin ï¿½ï¿½ Kontrol Tespit"
      >
        <Grid container>
          <Grid mb={3} size={12}>
            <CustomSelect
              labelId="durum"
              id="durum"
              size="small"
              value={konu}
              onChange={(e: any) => {
                setKonu(e.target.value);
              }}
              height={"36px"}
              sx={{ width: "100%" }}
            >
              <MenuItem value={"Nakit ve Nakit Benzerleri"}>
                Nakit ve Nakit Benzerleri
              </MenuItem>
              <MenuItem value={"Alacaklar"}>Alacaklar</MenuItem>
              <MenuItem value={"Stoklar"}>Stoklar</MenuItem>
              <MenuItem value={"Diï¿½er Varlï¿½klar"}>Diï¿½er Varlï¿½klar</MenuItem>
              <MenuItem value={"Duran Varlï¿½klar"}>Duran Varlï¿½klar</MenuItem>
              <MenuItem value={"Finansal Borï¿½lar"}>Finansal Borï¿½lar</MenuItem>
              <MenuItem value={"Borï¿½lar"}>Borï¿½lar</MenuItem>
              <MenuItem value={"Diï¿½er Yï¿½kï¿½mlï¿½lï¿½kler"}>
                Diï¿½er Yï¿½kï¿½mlï¿½lï¿½kler
              </MenuItem>
              <MenuItem value={"Borï¿½ Karï¿½ï¿½lï¿½klarï¿½"}>Borï¿½ Karï¿½ï¿½lï¿½klarï¿½</MenuItem>
              <MenuItem value={"Kï¿½dem ve ï¿½zin Karï¿½ï¿½lï¿½klarï¿½"}>
                Kï¿½dem ve ï¿½zin Karï¿½ï¿½lï¿½klarï¿½
              </MenuItem>
              <MenuItem value={"Sermaye"}>Sermaye</MenuItem>
              <MenuItem value={"Hasï¿½lat"}>Hasï¿½lat</MenuItem>
              <MenuItem value={"Maliyet"}>Maliyet</MenuItem>
              <MenuItem value={"Diï¿½er Gelirler"}>Diï¿½er Gelirler</MenuItem>
              <MenuItem value={"Diï¿½er Giderler"}>Diï¿½er Giderler</MenuItem>
            </CustomSelect>
          </Grid>
        </Grid>
        <Box>
          <HesaplaraIliskinIcKontrolTespitBelge
            controller={controller}
            konu={konu}
            isClickedVarsayilanaDon={isClickedVarsayilanaDon}
            setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
            setTamamlanan={setTamamlanan}
            setToplam={setToplam}
          />
        </Box>
      </PageContainer>
    </>
  );
};

export default Page;


