"use client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button, Grid, useTheme } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DovizKurlariOtuzBirAralik from "@/app/components/VeriIslemleri/DovizKurlariOtuzBirAralik";
import DovizKurlariOtuzAralik from "@/app/components/VeriIslemleri/DovizKurlariOtuzAralik";
import { useEffect, useState } from "react";
import { createDovizKurlari } from "@/api/VeriIslemleri/DovizKurlari";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import InfoAlertCart from "@/app/components/Alerts/InfoAlertCart";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/DovizKurlari",
    title: "Döviz Kurları",
  },
];

const Page = () => {
  usePageTitle("Döviz Kurları");
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [verileriCekTiklandimi, setVerileriCekTiklandimi] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleVerileriCek = async () => {
    try {
      const result = await createDovizKurlari(user.token || "");
      if (result) {
        setVerileriCekTiklandimi(false);
        enqueueSnackbar("Döviz Kurları Çekildi", {
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
        enqueueSnackbar("Döviz Kurları Çekilemedi", {
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
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (verileriCekTiklandimi) {
      setOpenCartAlert(true);
    } else {
      setOpenCartAlert(false);
    }
  }, [verileriCekTiklandimi]);

  return (
    <PageContainer title="Döviz Kurları" description="this is Döviz Kurları">
      <Breadcrumb title="Döviz Kurları" items={BCrumb} />
      <Grid container>
        <Grid
          size={{
            xs: 12,
            lg: 12
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          <Button
            type="button"
            size="medium"
            disabled={verileriCekTiklandimi}
            variant="outlined"
            color="primary"
            sx={{ ml: 2, height: "100%" }}
            onClick={() => {
              setVerileriCekTiklandimi(true);
              handleVerileriCek();
            }}
          >
            Verileri Çek
          </Button>
        </Grid>
        <Grid size={{ xs: 12 }} marginBottom={3}>
          <DovizKurlariOtuzBirAralik
            verileriCekTiklandimi={verileriCekTiklandimi}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DovizKurlariOtuzAralik
            verileriCekTiklandimi={verileriCekTiklandimi}
          />
        </Grid>
        {openCartAlert && (
          <InfoAlertCart
            openCartAlert={openCartAlert}
            setOpenCartAlert={setOpenCartAlert}
          ></InfoAlertCart>
        )}
      </Grid>
    </PageContainer>
  );
};

export default Page;

