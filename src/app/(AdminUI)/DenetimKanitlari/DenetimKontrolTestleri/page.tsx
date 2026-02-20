"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import { CreateGroupPopUp } from "@/app/(AdminUI)/components/CalismaKagitlari/CreateGroupPopUp";
import { createCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import CalismaKagidiBelge from "@/app/(AdminUI)/components/CalismaKagitlari/CalismaKagidiBelge";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton"
const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim KanÄ±tlarÄ±",
  },
  {
    to: "/DenetimKanitlari/DigerKanitlar",
    title: "DiÄŸer KanÄ±tlar",
  },
  {
    to: "/DenetimKanitlari/DigerKanitlar/DenetimKontrolTestleri",
    title: "Denetim Kontrol Testleri",
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
  const controller = "DenetimKontrolTestleri";
  const grupluMu = false;
  const alanAdi1 = "Ä°ÅŸlem";
  const alanAdi2 = "Tespit";

  const handleOpen = () => {
    setIsCreatePopUpOpen(true);
    setIsClickedYeniGrupEkle(true);
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
        console.log("Ã‡alÄ±ÅŸma KaÄŸÄ±dÄ± Verisi ekleme baÅŸarÄ±sÄ±z");
      }
    } catch (error) {
      console.log("Bir hata oluÅŸtu:", error);
    }
  };
  return (
    <>
      <Breadcrumb title="Denetim Kontrol Testleri" items={BCrumb}>
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
                {tamamlanan}/{toplam} TamamlandÄ±
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
                fullWidth={false}           // saÄŸda kÃ¼Ã§Ã¼k buton
                text="Belge YÃ¼kle"
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
                  VarsayÄ±lana DÃ¶n
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
        title="Denetim Kontrol Testleri"
        description="this is Denetim Kontrol Testleri"
      >
        <Box>
          <CalismaKagidiBelge
            controller={controller}
            grupluMu={grupluMu}
            alanAdi1={alanAdi1}
            alanAdi2={alanAdi2}
            isClickedYeniGrupEkle={isClickedYeniGrupEkle}
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


