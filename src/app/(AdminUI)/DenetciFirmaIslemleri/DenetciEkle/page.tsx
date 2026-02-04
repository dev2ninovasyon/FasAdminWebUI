"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DenetciEkleForm from "@/app/components/DenetciIslemleri/DenetciEkleForm";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/DenetciFirmaIslemleri",
    title: "Denetçi Firma İşlemleri",
  },
  {
    to: "/DenetciFirmaIslemleri/DenetciEkle",
    title: "Denetçi Ekle",
  },
];

const Page = () => {
  return (
    <PageContainer title="Denetçi Ekle" description="this is Denetçi Ekle">
      <Breadcrumb title="Denetçi Ekle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ParentCard title="Yeni Denetçi">
            <DenetciEkleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
