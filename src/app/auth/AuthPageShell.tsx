"use client";

import { Box, Card, Typography } from "@mui/material";
import PageContainer from "../components/Container/PageContainer";
import Logo from "../components/Layout/Shared/Logo/Logo";
import { ReactNode } from "react";

interface AuthPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** Ortak kimlik doğrulama sayfa düzeni. Giriş ve şifre sıfırlama akışları aynı görsel kabuğu kullanır. */
export default function AuthPageShell({ title, description, children }: AuthPageShellProps) {
  return (
    <PageContainer title={title} description={description}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: 4,
          background: "radial-gradient(circle at top left, #d2f1df, #d3d7fa 45%, #bad8f4)",
        }}
      >
        <Card
          elevation={9}
          sx={{
            width: "100%",
            maxWidth: 480,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
          }}
        >
          <Box display="flex" justifyContent="center" mb={3}>
            <Logo />
          </Box>
          <Typography variant="h4" fontWeight={700} mb={1}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {description}
          </Typography>
          {children}
        </Card>
      </Box>
    </PageContainer>
  );
}
