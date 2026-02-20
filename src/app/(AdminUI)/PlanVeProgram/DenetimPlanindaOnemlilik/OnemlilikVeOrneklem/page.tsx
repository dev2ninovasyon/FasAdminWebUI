"use client";

import React, { useEffect, useState } from "react";
import { Grid, useTheme } from "@mui/material";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import Breadcrumb from "@/app/(AdminUI)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import InfoAlertCart from "@/app/components/Alerts/InfoAlertCart";
import { createOnemlilikVeOrneklem } from "@/api/PlanVeProgram/PlanVeProgram";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { enqueueSnackbar } from "notistack";
import OnemlilikVeOrneklem from "./OnemlilikVeOrneklem";
import OnemlilikVeOrneklemSeviyesi from "./OnemlilikVeOrneklemSeviyesi";
import OnemlilikVeOrneklemHesaplamaBazi from "./OnemlilikVeOrneklemHesaplamaBazi";
import BelgeKontrolCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/IslemlerCard";

import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/PlanVeProgram/DenetimPlanindaOnemlilik",
    title: "Denetim Planında Önemlilik",
  },
  {
    to: "/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem",
    title: "Önemlilik Ve Örneklem",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const controller = "OnemlilikVeOrneklem";

  const [guvenilirlikDuzeyi, setGuvenilirlikDuzeyi] = useState(95);
  const [hataPayi, setHataPayi] = useState(5);

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);
  const [hesaplaTiklandimi2, setHesaplaTiklandimi2] = useState(false);

  const [openCartAlert, setOpenCartAlert] = useState(false);

  const handleHesapla = async () => {
    try {
      const result = await createOnemlilikVeOrneklem(user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        guvenilirlikDuzeyi || 0,
        hataPayi || 0
      );
      if (result) {
        setHesaplaTiklandimi(false);
        enqueueSnackbar("Önemlilik Ve Örneklem Hesaplandı", {
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
        enqueueSnackbar("Önemlilik Ve Örneklem Hesaplanamadı", {
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
    <PageContainer
      title="Önemlilik Ve Örneklem"
      description="this is Önemlilik Ve Örneklem"
    >
      <Breadcrumb title="Önemlilik Ve Örneklem" items={BCrumb}>
        <EkBelgeYukleButton formKodu="OnemlilikVeOrneklem" />
      </Breadcrumb>

    </PageContainer>
  );
};

export default Page;


