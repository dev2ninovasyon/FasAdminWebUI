"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import AdminMusteriTasiFormu from "@/app/components/DenetciIslemleri/AdminMusteriTasiFormu";
import { usePageTitle } from "@/hooks/usePageTitle";

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
    to: "/DenetciFirmaIslemleri/MusteriTasi",
    title: "Eski Sistemden Müşteri Taşı",
  },
];

const MusteriTasiPage = () => {
  usePageTitle("Eski Sistemden Müşteri Taşı");

  return (
    <PageContainer
      title="Eski Sistemden Müşteri Taşı"
      description="Eski veritabanındaki bir müşteriyi seçilen yeni sistem denetçisi altına aktarın"
    >
      <Breadcrumb title="Eski Sistemden Müşteri Taşı" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ParentCard title="Eski Sistemden Hedef Denetçiye Müşteri Taşı">
            <AdminMusteriTasiFormu />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default MusteriTasiPage;
