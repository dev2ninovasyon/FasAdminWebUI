// örn: src/app/(AdminUI)/components/CalismaKagitlari/FormOnayBolumu.tsx

import React from "react";
import { Grid } from "@mui/material";
import BelgeKontrolCard from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/BelgeKontrolCard";

interface FormOnayBolumuProps {
  controller: string; // form kodun / controller adın
  showHazirlayan?: boolean;
  showOnaylayan?: boolean;
  showKaliteKontrol?: boolean;
  // Hazırlayan onayladıktan sonra sayfayı yenilemek istersen:
  onHazirlayanChange?: () => void;
  onOnaylayanChange?: () => void;
  onKaliteKontrolChange?: () => void;
}

const FormOnayBolumu: React.FC<FormOnayBolumuProps> = ({
  controller,
  showHazirlayan = true,
  showOnaylayan = true,
  showKaliteKontrol = false,
  onHazirlayanChange,
  onOnaylayanChange,
  onKaliteKontrolChange,
}) => {
  return (
    <Grid container spacing={2} mt={2}>
      {showHazirlayan && (
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <BelgeKontrolCard
            controller={controller}
            hazirlayan="Hazırlayan"
            fetch={onHazirlayanChange}
          />
        </Grid>
      )}
      {showOnaylayan && (
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <BelgeKontrolCard
            controller={controller}
            onaylayan="Onaylayan"
            fetch={onOnaylayanChange}
          />
        </Grid>
      )}
      {showKaliteKontrol && (
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <BelgeKontrolCard
            controller={controller}
            kaliteKontrol="KaliteKontrol"
            fetch={onKaliteKontrolChange}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default FormOnayBolumu;

