"use client";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeSettings } from "@/utils/theme/Theme";
//import { store } from "@/store/store";
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

export const MyApp = ({ children }: { children: React.ReactNode }) => {
  useAutoLogout(45 * 60 * 1000, 40 * 60 * 1000); // 45 dakika idle süresi, 40 dakika refresh süresi

  const theme = ThemeSettings();

  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <>
      <NextAppDirEmotionCacheProvider options={{ key: "modernize" }}>
        <ThemeProvider theme={theme}>
          <RTL direction={customizer.activeDir}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <SnackbarProvider
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              {children}
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
    <html suppressHydrationWarning>
      <body>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            {loading ? (
              // eslint-disable-next-line react/no-children-prop
              <MyApp children={children} />
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
