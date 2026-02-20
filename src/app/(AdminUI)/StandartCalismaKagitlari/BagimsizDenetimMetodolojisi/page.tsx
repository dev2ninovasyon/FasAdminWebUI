"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BagimsizDenetimMetodolojisiTable from "./BagimsizDenetimMetodolojisiTable";

const BCrumb = [
    {
        to: "/StandartCalismaKagitlari",
        title: "Standart Ã‡alÄ±ÅŸma KaÄŸÄ±tlarÄ±",
    },
    {
        to: "/StandartCalismaKagitlari/BagimsizDenetimMetodolojisi",
        title: "BaÄŸÄ±msÄ±z Denetim Metodolojisi",
    },
];

const Page = () => {
    return (
        <PageContainer
            title="BaÄŸÄ±msÄ±z Denetim Metodolojisi"
            description="this is BaÄŸÄ±msÄ±z Denetim Metodolojisi"
        >
            <Breadcrumb title="BaÄŸÄ±msÄ±z Denetim Metodolojisi" items={BCrumb} />
            <Grid container>
                <Grid
                    mb={3}
                    size={{
                        xs: 12,
                        lg: 12
                    }}>
                    <BagimsizDenetimMetodolojisiTable />
                </Grid>
            </Grid>
        </PageContainer>
    );
};

export default Page;

