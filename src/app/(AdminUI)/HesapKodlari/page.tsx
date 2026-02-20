"use client";
import { Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import HesapKodlari from "./HesapKodlari";
const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin MenÃ¼",
  },
  {
    to: "/HesapKodlari",
    title: "Hesap KodlarÄ±",
  },
];

const Page = () => {
  return (
    <PageContainer title="Hesap KodlarÄ±" description="this is Hesap KodlarÄ±">
      <Breadcrumb title="Hesap KodlarÄ±" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <HesapKodlari />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;

