"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DosyaDuzenleForm from "@/app/components/DenetimDosyaIslemleri/DosyaDuzenleForm";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/DenetimDosyaBelgeleri",
    title: "Dosya Firma İşlemleri",
  },
];

const Page = () => {
  return (
    <PageContainer title="Dosya Düzenle" description="this is Dosya Düzenle">
      <Breadcrumb title="Dosya Düzenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ParentCard title="Dosya">
            <DosyaDuzenleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
