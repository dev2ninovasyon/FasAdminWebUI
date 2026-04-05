"use client";
import { usePageTitle } from "@/hooks/usePageTitle";
import React, { useState } from "react";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import TopCards from "@/app/(AdminUI)/components/Cards/TopCards";
import PlanVeProgramLayout from "./PlanVeProgramLayout";
import FilteredMenu from "@/app/(AdminUI)/components/Tables/MenuTable";
import { Box, Button, IconButton } from "@mui/material";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

const Page = () => {
  usePageTitle("Plan ve Program");
  const [showFilteredMenu, setShowFilteredMenu] = useState(true);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };
  return (
    <PlanVeProgramLayout>
      <PageContainer
        title="Plan ve Program"
        description="this is Plan ve Program"
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              paddingBottom: showFilteredMenu ? "32px" : "0px",
              paddingRight: "10px",
            }}
          >
            <Button onClick={handleToggle}>
              {showFilteredMenu ? (
                <IconLayoutGrid size={24} />
              ) : (
                <IconList size={24} />
              )}
              {/* Toggle between icons */}
            </Button>
          </Box>

          {showFilteredMenu ? (
            <FilteredMenu title="PLAN VE PROGRAM" />
          ) : (
            <TopCards title="PLAN VE PROGRAM" />
          )}
        </Box>
      </PageContainer>
    </PlanVeProgramLayout>
  );
};

export default Page;

