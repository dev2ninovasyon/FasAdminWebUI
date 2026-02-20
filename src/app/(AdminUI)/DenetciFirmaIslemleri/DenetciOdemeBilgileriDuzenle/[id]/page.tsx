"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DenetciOdemeBilgileriDuzenleForm from "@/app/components/DenetciIslemleri/DenetciOdemeBilgileriDuzenleForm";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin MenÃ¼",
  },
  {
    to: "/DenetciFirmaIslemleri",
    title: "DenetÃ§i Firma Ä°ÅŸlemleri",
  },
];

import { use } from "react";

const Page = (props: { params: Promise<{ id: string }> }) => {
  const params = use(props.params);
  const id = params.id;

  return (
    <PageContainer
      title="DenetÃ§i Ã–deme Bilgileri DÃ¼zenle"
      description="this is DenetÃ§i Ã–deme Bilgileri DÃ¼zenle"
    >
      <Breadcrumb title="DenetÃ§i Ã–deme Bilgileri DÃ¼zenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ParentCard title="DenetÃ§i Ã–deme Bilgileri">
            <DenetciOdemeBilgileriDuzenleForm id={id} />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
