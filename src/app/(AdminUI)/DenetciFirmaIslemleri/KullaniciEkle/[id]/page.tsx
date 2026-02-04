"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KullaniciEkleForm from "@/app/components/DenetciIslemleri/KullaniciEkleForm";

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
    <PageContainer title="Kullanıcı Ekle" description="this is Kullanıcı Ekle">
      <ParentCard title="Kullanıcı Ekle">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Breadcrumb title="Kullanıcı Ekle" items={BCrumb} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <ParentCard title="Yeni Kullanıcı">
                  <KullaniciEkleForm />
                </ParentCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default Page;
