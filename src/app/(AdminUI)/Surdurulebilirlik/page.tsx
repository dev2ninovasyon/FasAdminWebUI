"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import PageContainer from "@/app/(AdminUI)/components/Container/PageContainer";
import KysLayout from "./SurdurulebilirlikLayout";
import React, { useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import FilteredMenu from "@/app/(AdminUI)/components/Tables/MenuTable";
import TopCards from "@/app/(AdminUI)/components/Cards/TopCards";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

const Page = () => {
  usePageTitle("SÜRDÜRÜLEBİLİRLİK");
  const [showFilteredMenu, setShowFilteredMenu] = useState(true);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };
  return (
    <KysLayout>
      <PageContainer
        title="SÜRDÜRÜLEBİLİRLİK"
        description="this is SÜRDÜRÜLEBİLİRLİK"
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
            <FilteredMenu title="SÜRDÜRÜLEBİLİRLİK" />
          ) : (
            <TopCards title="SÜRDÜRÜLEBİLİRLİK" />
          )}
        </Box>
      </PageContainer>
    </KysLayout>
  );
};

export default Page;

