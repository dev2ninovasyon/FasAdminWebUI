"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DenetciDuzenleForm from "@/app/components/DenetciIslemleri/DenetciDuzenleForm";

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
      title="DenetÃ§i DÃ¼zenle"
      description="this is DenetÃ§i DÃ¼zenle"
    >
      <Breadcrumb title="DenetÃ§i DÃ¼zenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ParentCard title="DenetÃ§i">
            <DenetciDuzenleForm id={id} />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
