"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(AdminUI)/components/Cards/TopCards";
import DigerKanitlarLayout from "./DigerKanitlarLayout";

const Page = () => {
  return (
    <DigerKanitlarLayout>
      <PageContainer
        title="Diğer Kanıtlar"
        description="this is Diğer Kanıtlar"
      >
        <Box>
          <TopCards title="Diğer Kanıtlar" />
        </Box>
      </PageContainer>
    </DigerKanitlarLayout>
  );
};

export default Page;

