"use client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Box, Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import DenetciTable from "@/app/components/Tables/DenetciTable";
import DenetciEkleButton from "@/app/components/DenetciIslemleri/DenetciEkleButton";

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
  usePageTitle("Denetçi Firma İşlemleri");
  return (
    <PageContainer
      title="Denetçi Firma İşlemleri"
      description="this is Denetçi Firma İşlemleri"
    >
      <Breadcrumb title="Denetçi Firma İşlemleri" items={BCrumb} />
      <ParentCard title="Denetçiler">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <DenetciEkleButton />
            <Box>
              <DenetciTable />
            </Box>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default Page;

