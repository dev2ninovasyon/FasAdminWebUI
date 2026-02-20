"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import { Box } from "@mui/material";
import HileVeUsulsuzlukLayout from "./HileVeUsulsuzlukLayout";
import TopCards from "@/app/(AdminUI)/components/Cards/TopCards";

const Page = () => {
  return (
    <HileVeUsulsuzlukLayout>
      <PageContainer
        title="Hile Ve Usulsüzlük"
        description="this is Hile Ve Usulsüzlük"
      >
        <Box>
          <TopCards title="Hile ve Usulsüzlük" />
        </Box>
      </PageContainer>
    </HileVeUsulsuzlukLayout>
  );
};

export default Page;

