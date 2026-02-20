"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DenetciDuzenleForm from "@/app/components/DenetciIslemleri/DenetciDuzenleForm";

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

import { use } from "react";

const Page = (props: { params: Promise<{ id: string }> }) => {
  const params = use(props.params);
  const id = params.id;

  return (
    <PageContainer
      title="Denetçi Düzenle"
      description="this is Denetçi Düzenle"
    >
      <Breadcrumb title="Denetçi Düzenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ParentCard title="Denetçi">
            <DenetciDuzenleForm id={id} />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
