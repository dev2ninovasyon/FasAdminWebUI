"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DosyaDuzenleForm from "@/app/components/DenetimDosyaIslemleri/DosyaDuzenleForm";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin MenÃ¼",
  },
  {
    to: "/DenetimDosyaBelgeleri",
    title: "Dosya Firma Ä°ÅŸlemleri",
  },
];

import { use } from "react";

const Page = (props: { params: Promise<{ id: string }> }) => {
  const params = use(props.params);
  const id = params.id;

  return (
    <PageContainer title="Dosya DÃ¼zenle" description="this is Dosya DÃ¼zenle">
      <Breadcrumb title="Dosya DÃ¼zenle" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ParentCard title="Dosya">
            <DosyaDuzenleForm id={id} />
          </ParentCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
