"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DenetciOdemeBilgileriDuzenleForm from "@/app/components/DenetciIslemleri/DenetciOdemeBilgileriDuzenleForm";

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
      title="Denetçi Ödeme Bilgileri Düzenle"
      description="this is Denetçi Ödeme Bilgileri Düzenle"
    >
      <Breadcrumb title="Denetçi Ödeme Bilgileri Düzenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ParentCard title="Denetçi Ödeme Bilgileri">
            <DenetciOdemeBilgileriDuzenleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
