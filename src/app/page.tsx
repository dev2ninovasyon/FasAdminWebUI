"use client";
import { Grid, Box, Card } from "@mui/material";

// components
import AuthLogin from "./auth/authForms/AuthLogin";
import PageContainer from "./components/Container/PageContainer";
import Logo from "./components/Layout/Shared/Logo/Logo";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function Page() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6Ld2CyEsAAAAALNU5rSOM_Q2RAWkQ2RADbsS5NQW"
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      <PageContainer title="Giriş" description="this is Giriş">
        <Box
          sx={{
            position: "relative",
            "&:before": {
              content: '""',
              background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
              backgroundSize: "400% 400%",
              animation: "gradient 15s ease infinite",
              position: "absolute",
              height: "100%",
              width: "100%",
              opacity: "0.3",
            },
          }}
        >
          <Grid
            container
            spacing={0}
            justifyContent="center"
            sx={{ height: "100vh" }}
          >
            <Grid
              item
              xs={12}
              sm={12}
              lg={5}
              xl={4}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Card
                elevation={9}
                sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "450px" }}
              >
                <Box display="flex" alignItems="center" justifyContent="center">
                  <Logo />
                </Box>
                <AuthLogin />
              </Card>
            </Grid>
          </Grid>
        </Box>
      </PageContainer>
    </GoogleReCaptchaProvider>
  );
}

Page.layout = "Blank";
