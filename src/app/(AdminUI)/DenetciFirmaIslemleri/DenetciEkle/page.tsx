"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DenetciEkleForm from "@/app/components/DenetciIslemleri/DenetciEkleForm";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin MenÃ¼",
  },
  {
    to: "/DenetciFirmaIslemleri",
    title: "DenetÃ§i Firma Ä°ÅŸlemleri",
  },
  {
    to: "/DenetciFirmaIslemleri/DenetciEkle",
    title: "DenetÃ§i Ekle",
  },
];

const Page = () => {
  return (
    <PageContainer title="DenetÃ§i Ekle" description="this is DenetÃ§i Ekle">
      <Breadcrumb title="DenetÃ§i Ekle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ParentCard title="Yeni DenetÃ§i">
            <DenetciEkleForm />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;

