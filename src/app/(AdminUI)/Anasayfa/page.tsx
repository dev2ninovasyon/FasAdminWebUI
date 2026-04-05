"use client";
import { usePageTitle } from "@/hooks/usePageTitle";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useEffect, useState } from "react";

import PageContainer from "@/app/components/Container/PageContainer";
// components

export default function Dashboard() {
  usePageTitle("Dashboard");
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box mt={3}>
        <Grid container spacing={3}>
          {/* column */}
          <Grid size={{ xs: 12, lg: 12 }}></Grid>
          {/* column */}
          <Grid size={{ xs: 12, lg: 8 }}></Grid>
          {/* column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}></Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 12 }}></Grid>
            </Grid>
          </Grid>
          {/* column */}
          <Grid size={{ xs: 12, lg: 4 }}></Grid>
          {/* column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}></Grid>
              <Grid size={{ xs: 12, sm: 6 }}></Grid>
              <Grid size={{ xs: 12 }}></Grid>
            </Grid>
          </Grid>
          {/* column */}
          <Grid size={{ xs: 12, lg: 4 }}></Grid>
          {/* column */}
          <Grid size={{ xs: 12, lg: 4 }}></Grid>
          {/* column */}
          <Grid size={{ xs: 12, lg: 8 }}></Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}

