"use client";
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
    to: "/DenetciFirmaIslemleri",
    title: "Denetçi Firma İşlemleri",
  },
];

const Page = () => {
  return (
    <PageContainer
      title="Denetim Dosya Belgeleri"
      description="this is Denetim Dosya Belgeleri"
    >
      <Breadcrumb title="Denetim Dosya Belgeleri" items={BCrumb} />
      <ParentCard title="Dosyalar">
        <Grid container spacing={3}>
          <Grid item xs={12}>
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
