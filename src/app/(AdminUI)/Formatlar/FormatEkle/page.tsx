"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import FormatEkleForm from "@/app/components/FormaIslemleri/FormatEkleForm";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/Formatlar",
    title: "Formatlar",
  },
  {
    to: "/Formatlar/FormatEkle",
    title: "Format Ekle",
  },
];

const Page = () => {
  return (
    <PageContainer title="Format Ekle" description="this is Format Ekle">
      <ParentCard title="Format Ekle">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Breadcrumb title="Format Ekle" items={BCrumb} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <ParentCard title="Yeni Format">
                  <FormatEkleForm />
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

