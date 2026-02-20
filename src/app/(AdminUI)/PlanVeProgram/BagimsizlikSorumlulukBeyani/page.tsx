"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import { Box, Grid } from "@mui/material";
import { useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import dynamic from "next/dynamic";
import PersonelBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/PersonelBoxAutoComplete";
import BagimsizlikSorumlulukBeyaniLayout from "./BagimsizlikSorumlulukBeyaniLayout";
import BelgeKontrolCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/IslemlerCard";
import NoUsersAlert from "@/app/(AdminUI)/components/Alerts/NoUsersAlert";

const CustomEditor = dynamic(
  () => import("@/app/(AdminUI)/components/Editor/CustomEditor"),
  { ssr: false }
);

const controller = "BagimsizlikSorumlulukBeyani";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [personelId, setPersonelId] = useState(user.id);
  const [personelAdi, setPersonelAdi] = useState(user.kullaniciAdi);
  const [showNoUsersAlert, setShowNoUsersAlert] = useState(false);

  return (
    <BagimsizlikSorumlulukBeyaniLayout>
      <PageContainer
        title="Baï¿½ï¿½msï¿½zlï¿½k Sorumluluk Beyanï¿½"
        description="this is Baï¿½ï¿½msï¿½zlï¿½k Sorumluluk Beyanï¿½"
      >
        <Grid container>
          <Grid mb={3} size={12}>
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
          <CustomEditor controller={controller} personelId={personelId || 0} />
        </Box>
      </PageContainer>
      <Box>
        {(user.rol?.includes("KaliteKontrolSorumluDenetci") ||
          user.rol?.includes("SorumluDenetci") ||
          user.rol?.includes("Denetci") ||
          user.rol?.includes("DenetciYardimcisi")) && (
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
                  fetch={() => { }}
                  hazirlayan="Denetï¿½i - Yardï¿½mcï¿½ Denetï¿½i"
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
                  fetch={() => { }}
                  onaylayan="Sorumlu Denetï¿½i"
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
                  fetch={() => { }}
                  kaliteKontrol="Kalite Kontrol Sorumlu Denetï¿½i"
                  controller={controller}
                ></BelgeKontrolCard>
              </Grid>
            </Grid>
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
      </Box>
      <NoUsersAlert
        open={showNoUsersAlert}
        onClose={() => setShowNoUsersAlert(false)}
      />
    </BagimsizlikSorumlulukBeyaniLayout>
  );
};

export default Page;

