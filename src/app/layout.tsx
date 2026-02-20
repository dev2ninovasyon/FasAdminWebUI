"use client";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Provider } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "@/app/api/index";
import "@/utils/i18n";
import { NextAppDirEmotionCacheProvider } from "@/utils/theme/EmotionCache";
import "react-quill/dist/quill.snow.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/storeConfig";
import { SnackbarProvider } from "notistack";
import RTL from "./components/Layout/Shared/Customizer/RTL";
import useAutoLogout from "@/utils/useAutoLogOut";
import { LoadingProvider } from "@/contexts/LoadingContext";
import Script from "next/script";
import "@/utils/utf8Support"; // Initialize UTF-8 support

const MyApp = ({ children }: { children: React.ReactNode }) => {
  useAutoLogout(45 * 60 * 1000, 40 * 60 * 1000);

  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <>
      <NextAppDirEmotionCacheProvider options={{ key: "modernize" }}>
        <ThemeProvider theme={theme}>
          <RTL direction={customizer.activeDir}>
            <CssBaseline />
            <SnackbarProvider
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <LoadingProvider>
                {children}
              </LoadingProvider>
            </SnackbarProvider>
          </RTL>
        </ThemeProvider>
      </NextAppDirEmotionCacheProvider>
    </>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    setTimeout(() => setLoading(true), 3000);
  }, []);

  return (
    <html suppressHydrationWarning lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, charset=utf-8" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Script
          src="https://www.google.com/recaptcha/api.js?render=6Ld2CyEsAAAAALNU5rSOM_Q2RAWkQ2RADbsS5NQW"
          strategy="afterInteractive"
        />
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {loading ? (
              <MyApp>{children}</MyApp>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100vh",
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
