"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";
import { useState } from "react";
import FinansalTablolarDenetimRiskiBelirlemeBelge from "@/app/(AdminUI)/components/CalismaKagitlari/FinansalTablolarDenetimRiskiBelirlemeBelge";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton"
const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    to: "/PlanVeProgram/FinansalTablolarDenetimRiskiBelirleme",
    title: "Finansal Tablolar Denetim Riski Belirleme",
  },
];

const Page = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);

  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const controller = "FinansalTablolarDenetimRiskiBelirleme";

  return (
    <>
      <Breadcrumb
        title="Finansal Tablolar Denetim Riski Belirleme"
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
                md: 3.8,
                lg: 3.8
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
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              size={{
                xs: 5.8,
                md: 3.8,
                lg: 3.8
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
                md: 3.8,
                lg: 3.8
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
        </>
      </Breadcrumb>
      <PageContainer
        title="Finansal Tablolar Denetim Riski Belirleme"
        description="this is Finansal Tablolar Denetim Riski Belirleme"
      >
        <Box>
          <FinansalTablolarDenetimRiskiBelirlemeBelge
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

