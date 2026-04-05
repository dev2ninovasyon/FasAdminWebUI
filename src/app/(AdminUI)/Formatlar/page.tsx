"use client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Box, Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import FormatEkleButton from "@/app/components/FormaIslemleri/FormatEkleButton";
import FormatTable from "@/app/components/Tables/FormatTable";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/Formatlar",
    title: "Formatlar",
  },
];

const Page = () => {
  usePageTitle("Formatlar");
  return (
    <PageContainer title="Formatlar" description="this is Formatlar">
      <Breadcrumb title="Formatlar" items={BCrumb} />
      <ParentCard title="Formatlar">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <FormatEkleButton />
            <Box>
              <FormatTable />
            </Box>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default Page;

