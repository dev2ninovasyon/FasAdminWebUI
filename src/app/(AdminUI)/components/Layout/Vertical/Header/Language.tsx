import React, { useEffect } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Box, Tooltip, useTheme } from "@mui/material";
import "@/app/(AdminUI)/components/Layout/Vertical/Header/Language.css";
declare global {
  interface Window {
    gtranslateSettings: any;
  }
}

const Language = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  useEffect(() => {
    // GTranslate ayarlarï¿½nï¿½ tanï¿½mlï¿½yoruz
    window.gtranslateSettings = {
      default_language: "tr",
      languages: ["tr", "en", "de", "fr", "az", "ar", "sq"],
      globe_color:
        customizer.activeMode === "dark"
          ? theme.palette.primary.dark
          : theme.palette.primary.main,
      wrapper_selector: ".gtranslate_wrapper",
      flag_size: 16,
      globe_size: 20,
      float_position: "center",
    };

    // Script'i dinamik olarak yï¿½klï¿½yoruz
    const script = document.createElement("script");
    script.src = "https://cdn.gtranslate.net/widgets/latest/globe.js";
    script.defer = true;
    document.body.appendChild(script);

    // Cleanup function: Script kaldï¿½rï¿½ldï¿½ï¿½ï¿½nda etkiyi temizlemek iï¿½in
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Box padding={2}>
        <div
          className="gtranslate_wrapper"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        ></div>
      </Box>
    </>
  );
};

export default Language;

