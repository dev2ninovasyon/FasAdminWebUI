"use client";
import { Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import OdemeBilgileriTable from "@/app/components/Tables/OdemeBilgileriTable";

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
      title="DenetÃ§i Ã–deme Bilgileri"
      description="this is DenetÃ§i Ã–deme Bilgileri"
    >
      <Breadcrumb title="DenetÃ§i Ã–deme Bilgileri" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <OdemeBilgileriTable id={id} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
