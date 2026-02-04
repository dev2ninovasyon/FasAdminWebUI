"use client";
import { Box, Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import DenetciDetay from "@/app/components/DenetciIslemleri/DenetciDetay";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/DenetciFirmaIslemleri",
    title: "Denetçi Firma İşlemleri",
  },
];

const Page = () => {
  return (
    <PageContainer title="Denetçi Detay" description="this is Denetçi Detay">
      <Breadcrumb title="Denetçi Detay" items={BCrumb} />
      <ParentCard title="Denetçi Detay">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box>
              <DenetciDetay />
            </Box>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default Page;
