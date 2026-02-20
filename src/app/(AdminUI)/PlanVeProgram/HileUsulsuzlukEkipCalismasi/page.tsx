"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography, useMediaQuery, IconButton, Menu, MenuItem, useTheme } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import ParentCard from "@/app/(AdminUI)/components/Layout/Shared/ParentCard/ParentCard";
import HileUsulsuzlukToplantiBilgileriBelge from "@/app/(AdminUI)/components/CalismaKagitlari/HileUsulsuzlukToplantiBilgileriBelge";
import BelgeKontrolCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/IslemlerCard";
import HileUsulsuzlukToplantidaGorusulenHususlarBelge from "@/app/(AdminUI)/components/CalismaKagitlari/HileUsulsuzlukToplantidaGorusulenHususlarBelge";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton"
import { IconDotsVertical } from "@tabler/icons-react";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    to: "/PlanVeProgram/HileUsulsuzlukEkipCalismasi",
    title:
      "Denetim Çalışması Öncesi Hile ve Usulsüzlük Üzerine Denetim Ekibi Görüşme",
  },
];

const Page = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tamamlanan1, setTamamlanan1] = useState(0);
  const [toplam1, setToplam1] = useState(0);

  const [tamamlanan2, setTamamlanan2] = useState(0);
  const [toplam2, setToplam2] = useState(0);

  const [isRefresh, setIsRefresh] = useState(false);

  const user = useSelector((state: AppState) => state.userReducer);
  const controller =
    "HileUsulsuzlukToplantiBilgileri-HileUsulsuzlukToplantidaGorusulenHususlar";
  const grupluMu = false;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Breadcrumb
        title="Denetim Çalışması Öncesi Hile ve Usulsüzlük Üzerine Denetim Ekibi Görüşme"
        items={BCrumb}
      >
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
                {/* Mobile view content if needed */}
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
                  justifyContent: "center",
                }}
                size={{
                  xs: 5.8,
                  md: 5.8,
                  lg: 5.8
                }}>
                <EkBelgeYukleButton
                  formKodu={controller}
                  fullWidth={false}           // sağda küçük buton
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
                  md: 5.8,
                  lg: 5.8
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
        </>
      </Breadcrumb>
      <PageContainer
        title="Denetim Çalışması Öncesi Hile ve Usulsüzlük Üzerine Denetim Ekibi Görüşme"
        description="this is Denetim Çalışması Öncesi Hile ve Usulsüzlük Üzerine Denetim Ekibi Görüşme"
      >
        <Box
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <ParentCard title="Toplantı Bilgileri">
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
                  justifyContent={"flex-end"}
                  size={{
                    xs: 12,
                    md: 12,
                    lg: 12
                  }}>
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

              <HileUsulsuzlukToplantiBilgileriBelge
                refresh={isRefresh}
                controller={"HileUsulsuzlukToplantiBilgileri"}
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
          <ParentCard title="Toplantıda Görüşülen Hususlar">
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
                  justifyContent={"flex-end"}
                  size={{
                    xs: 12,
                    md: 12,
                    lg: 12
                  }}>
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
              <HileUsulsuzlukToplantidaGorusulenHususlarBelge
                refresh={isRefresh}
                controller={"HileUsulsuzlukToplantidaGorusulenHususlar"}
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
        ></Grid>
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

