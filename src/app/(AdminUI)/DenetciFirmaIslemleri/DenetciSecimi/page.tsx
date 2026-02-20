"use client";
import { Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ParentCard from "@/app/components/Shared/ParentCard";
import DenetciSecimFormu from "@/app/components/DenetciIslemleri/DenetciSecimFormu";

const BCrumb = [
    {
        to: "/Anasayfa",
        title: "Admin MenÃ¼",
    },
    {
        to: "/DenetciFirmaIslemleri",
        title: "DenetÃ§i Firma Ä°ÅŸlemleri",
    },
    {
        to: "/DenetciFirmaIslemleri/DenetciSecimi",
        title: "DenetÃ§i SeÃ§imi",
    },
];

const Page = () => {
    return (
        <PageContainer
            title="DenetÃ§i SeÃ§imi"
            description="DenetÃ§i SeÃ§im SayfasÄ±"
        >
            <Breadcrumb title="DenetÃ§i SeÃ§imi" items={BCrumb} />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <ParentCard title="DenetÃ§i SeÃ§imi">
                        <DenetciSecimFormu />
                    </ParentCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default Page;

