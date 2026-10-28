"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import { Box } from "@mui/material";
import MuhasebeHatalariVeHileLayout from "./MuhasebeHatalariVeHileLayout";
import MuhasebeHatalariVeHileTopCard from "@/app/(AdminUI)/components/Cards/MuhasebeHatalariVeHileTopCard";

const Page = () => {
  return (
    <MuhasebeHatalariVeHileLayout>
      <PageContainer
        title="Muhasebe Hataları Ve Hileye İlişkin Çalışmalar"
        description="this is Muhasebe Hataları Ve Hileye İlişkin Çalışmalar"
      >
        <Box>
          <MuhasebeHatalariVeHileTopCard />
        </Box>
      </PageContainer>
    </MuhasebeHatalariVeHileLayout>
  );
};

export default Page;

