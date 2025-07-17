"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import Header from "@/app/components/Layout/Vertical/Header/Header";
import Sidebar from "@/app/components/Layout/Vertical/Sidebar/Sidebar";
import Customizer from "@/app/components/Layout/Shared/Customizer/Customizer";
import Navigation from "@/app/components/Layout/Horizontal/Navbar/Navigation";
import HorizontalHeader from "@/app/components/Layout/Horizontal/Header/Header";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import Forbidden from "./ForbiddenPage/page";
import { useRouter } from "next/navigation";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  backgroundColor: "transparent",
}));

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);
  const [control, setControl] = useState(false);
  useEffect(() => {
    // Sadece client-side'da çalışmasını sağla
    if (typeof window !== "undefined") {
      // Eğer token yoksa kullanıcıyı login sayfasına yönlendir
      if (!user.token) {
        router.push("/");
      } else {
        setControl(true);
      }
    }
  }, [user.token]);
  return control && user.id == 1 ? (
    <MainWrapper>
      <title>Fas Admin</title>
      {/* ------------------------------------------- */}
      {/* Sidebar */}
      {/* ------------------------------------------- */}
      {customizer.isHorizontal ? "" : <Sidebar />}
      {/* ------------------------------------------- */}
      {/* Main Wrapper */}
      {/* ------------------------------------------- */}
      <PageWrapper
        className="page-wrapper"
        sx={{
          ...(customizer.isCollapse && {
            [theme.breakpoints.up("lg")]: {
              ml: customizer.isHorizontal
                ? "0px"
                : `${customizer.MiniSidebarWidth}px`,
            },
          }),
        }}
      >
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        {customizer.isHorizontal ? <HorizontalHeader /> : <Header />}
        {/* PageContent */}
        {customizer.isHorizontal ? <Navigation /> : ""}
        <Container
          sx={{
            maxWidth: customizer.isLayout === "boxed" ? "lg" : "100%!important",
          }}
        >
          {/* ------------------------------------------- */}
          {/* PageContent */}
          {/* ------------------------------------------- */}
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
            {/* <Outlet /> */}
            {children}
            {/* <Index /> */}
          </Box>
          {/* ------------------------------------------- */}
          {/* End Page */}
          {/* ------------------------------------------- */}
        </Container>
        <Customizer />
      </PageWrapper>
    </MainWrapper>
  ) : (
    <Forbidden></Forbidden>
  );
}
