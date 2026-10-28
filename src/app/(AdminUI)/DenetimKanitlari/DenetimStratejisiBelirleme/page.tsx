"use client";

import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography } from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import { CreateGroupPopUp } from "@/app/(AdminUI)/components/CalismaKagitlari/CreateGroupPopUp";
import { createCalismaKagidiVerisi } from "@/api/CalismaKagitlari/CalismaKagitlari";
import TekliCalismaKagidiBelge from "@/app/(AdminUI)/components/CalismaKagitlari/TekliCalismaKagidiBelge";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton"
const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/DigerKanitlar",
    title: "Diğer Kanıtlar",
  },
  {
    to: "/DenetimKanitlari/DigerKanitlar/DenetimStratejisiBelirleme",
    title: "Denetim Stratejisi Belirleme",
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
  const controller = "DenetimStratejisiBelirleme";
  const grupluMu = false;
  const alanAdi = "İşlem";

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
      <Breadcrumb title="Denetim Stratejisi Belirleme" items={BCrumb}>
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

            {grupluMu && (
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size={{
                  xs: 4,
                  md: grupluMu ? 3 : 4,
                  lg: grupluMu ? 3 : 4
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
        title="Denetim Stratejisi Belirleme"
        description="this is Denetim Stratejisi Belirleme"
      >
        <Box>
          <TekliCalismaKagidiBelge
            controller={controller}
            grupluMu={grupluMu}
            alanAdi={alanAdi}
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


