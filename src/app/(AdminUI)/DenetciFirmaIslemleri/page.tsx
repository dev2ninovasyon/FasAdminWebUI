"use client";
import { Box, Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import DenetciTable from "@/app/components/Tables/DenetciTable";
import DenetciEkleButton from "@/app/components/DenetciIslemleri/DenetciEkleButton";

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

const Page = () => {
  return (
    <PageContainer
      title="DenetÃ§i Firma Ä°ÅŸlemleri"
      description="this is DenetÃ§i Firma Ä°ÅŸlemleri"
    >
      <Breadcrumb title="DenetÃ§i Firma Ä°ÅŸlemleri" items={BCrumb} />
      <ParentCard title="DenetÃ§iler">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <DenetciEkleButton />
            <Box>
              <DenetciTable />
            </Box>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default Page;

