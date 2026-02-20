"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import { CreateGroupPopUp } from "@/app/(AdminUI)/components/CalismaKagitlari/CreateGroupPopUp";
import { createCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import HileUsulsuzlukBelirlemeBelge from "@/app/(AdminUI)/components/CalismaKagitlari/HileUsulsuzlukBelirlemeBelge";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/HileVeUsulsuzluk",
    title: "Hile Ve Usulsüzlük",
  },
  {
    to: "/DenetimKanitlari/HileVeUsulsuzluk/HileProsedurleri",
    title: "Hile Prosedürleri",
  },
  {
    to: "/DenetimKanitlari/HileVeUsulsuzluk/HileProsedurleri/HileUsulsuzlukBelirleme",
    title: "Hile Usulsüzlük ve Risk Faktörleri Belirleme",
  },
];

const Page = () => {
  const [islem, setIslem] = useState("");
  const [isCreatePopUpOpen, setIsCreatePopUpOpen] = useState(false);

  const [isClickedYeniGrupEkle, setIsClickedYeniGrupEkle] = useState(false);
  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const user = useSelector((state: AppState) => state.userReducer);
  const controller = "HileUsulsuzlukBelirleme";
  const grupluMu = false;

  const handleOpen = () => {
    setIsCreatePopUpOpen(true);
    setIsClickedYeniGrupEkle(true);
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
        console.log("Çalışma Kağıdı Verisi ekleme başarısız");
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  return (
    <>
      <Breadcrumb
        title="Hile Usulsüzlük ve Risk Faktörleri Belirleme"
        items={BCrumb}
      >
        <>
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
                {tamamlanan}/{toplam} Tamamlandı
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
                xs: 3.8,
                md: grupluMu ? 2.8 : 3.8,
                lg: grupluMu ? 2.8 : 3.8
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
                xs: 3.8,
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
        title="Hile Usulsüzlük ve Risk Faktörleri Belirleme"
        description="this is Hile Usulsüzlük ve Risk Faktörleri Belirleme"
      >
        <Box>
          <HileUsulsuzlukBelirlemeBelge
            controller={controller}
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


