"use client";
import { Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import OdemeBilgileriTable from "@/app/components/Tables/OdemeBilgileriTable";

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
      title="Denetçi Ödeme Bilgileri"
      description="this is Denetçi Ödeme Bilgileri"
    >
      <Breadcrumb title="Denetçi Ödeme Bilgileri" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <OdemeBilgileriTable id={id} />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
