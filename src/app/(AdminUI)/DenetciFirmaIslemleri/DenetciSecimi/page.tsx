"use client";
import { Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import DenetciSecimFormu from "@/app/components/DenetciIslemleri/DenetciSecimFormu";

const BCrumb = [
    {
        to: "/Anasayfa",
        title: "Admin Menü",
    },
    {
        to: "/DenetciFirmaIslemleri",
        title: "Denetçi Firma İşlemleri",
    },
    {
        to: "/DenetciFirmaIslemleri/DenetciSecimi",
        title: "Denetçi Seçimi",
    },
];

const Page = () => {
    return (
        <PageContainer
            title="Denetçi Seçimi"
            description="Denetçi Seçim Sayfası"
        >
            <Breadcrumb title="Denetçi Seçimi" items={BCrumb} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <ParentCard title="Denetçi Seçimi">
                        <DenetciSecimFormu />
                    </ParentCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default Page;

