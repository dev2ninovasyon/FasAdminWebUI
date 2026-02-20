"use client";
import { Box, Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import DenetciDetay from "@/app/components/DenetciIslemleri/DenetciDetay";

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
    <PageContainer title="DenetÃ§i Detay" description="this is DenetÃ§i Detay">
      <Breadcrumb title="DenetÃ§i Detay" items={BCrumb} />
      <ParentCard title="DenetÃ§i Detay">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box>
              <DenetciDetay id={id} />
            </Box>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default Page;
