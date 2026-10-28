"use client";

import { Grid } from "@mui/material";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BagimsizDenetimMetodolojisiTable from "./BagimsizDenetimMetodolojisiTable";

const BCrumb = [
    {
        to: "/StandartCalismaKagitlari",
        title: "Standart Çalışma Kağıtları",
    },
    {
        to: "/StandartCalismaKagitlari/BagimsizDenetimMetodolojisi",
        title: "Bağımsız Denetim Metodolojisi",
    },
];

const Page = () => {
    return (
        <PageContainer
            title="Bağımsız Denetim Metodolojisi"
            description="this is Bağımsız Denetim Metodolojisi"
        >
            <Breadcrumb title="Bağımsız Denetim Metodolojisi" items={BCrumb} />
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

