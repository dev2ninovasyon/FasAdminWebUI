"use client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Box, Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import DenetimDosyaTable from "@/app/components/Tables/DenetimDosyaTable";
import DosyaEkleButton from "@/app/components/DenetimDosyaIslemleri/DosyaEkleButton";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/DenetimDosyaBelgeleri",
    title: "Denetim Dosya Belgeleri",
  },
];

const Page = () => {
  usePageTitle("Denetim Dosya Belgeleri");
  return (
    <PageContainer
      title="Denetim Dosya Belgeleri"
      description="this is Denetim Dosya Belgeleri"
    >
      <Breadcrumb title="Denetim Dosya Belgeleri" items={BCrumb} />
      <ParentCard title="Dosyalar">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <DosyaEkleButton />
            <Box>
              <DenetimDosyaTable />
            </Box>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default Page;

