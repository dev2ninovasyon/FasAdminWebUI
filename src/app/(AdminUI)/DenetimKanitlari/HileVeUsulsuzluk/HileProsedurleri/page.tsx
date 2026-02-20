"use client";

import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import { Box } from "@mui/material";
import HileProsedurleriLayout from "./HileProsedurleriLayout";
import TopCards from "@/app/(AdminUI)/components/Cards/TopCards";

const Page = () => {
  return (
    <HileProsedurleriLayout>
      <PageContainer
        title="Hile Prosedürleri"
        description="this is Hile Prosedürleri"
      >
        <Box>
          <TopCards title="Hile Prosedürleri" />
        </Box>
      </PageContainer>
    </HileProsedurleriLayout>
  );
};

export default Page;

