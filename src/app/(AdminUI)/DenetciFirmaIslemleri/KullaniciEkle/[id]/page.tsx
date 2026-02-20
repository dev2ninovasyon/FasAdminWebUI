"use client";

import { Grid } from "@mui/material";
import ParentCard from "@/app/components/Shared/ParentCard";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import KullaniciEkleForm from "@/app/components/DenetciIslemleri/KullaniciEkleForm";

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
    <PageContainer title="KullanÄ±cÄ± Ekle" description="this is KullanÄ±cÄ± Ekle">
      <ParentCard title="KullanÄ±cÄ± Ekle">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Breadcrumb title="KullanÄ±cÄ± Ekle" items={BCrumb} />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <ParentCard title="Yeni KullanÄ±cÄ±">
                  <KullaniciEkleForm id={id} />
                </ParentCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </ParentCard>
    </PageContainer>
  );
};

export default Page;
