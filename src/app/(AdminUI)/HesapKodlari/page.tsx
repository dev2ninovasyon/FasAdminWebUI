"use client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import HesapKodlari from "./HesapKodlari";
const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin Menü",
  },
  {
    to: "/HesapKodlari",
    title: "Hesap Kodları",
  },
];

const Page = () => {
  usePageTitle("Hesap Kodları");
  return (
    <PageContainer title="Hesap Kodları" description="this is Hesap Kodları">
      <Breadcrumb title="Hesap Kodları" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <HesapKodlari />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;

