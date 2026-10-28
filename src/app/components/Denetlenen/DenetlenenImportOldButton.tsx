import React from "react";
import { Button, Stack } from "@mui/material";
import { IconDatabase } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const DenetlenenImportOldButton = () => {
  const router = useRouter();

  const handleRouteClick = () => {
    router.push("/Denetlenen/ImportFromOld");
  };

  return (
    <>
      <Stack spacing={1} direction="row" justifyContent="start" marginBottom={4}>
        <Button color="secondary" onClick={() => handleRouteClick()} startIcon={<IconDatabase width={18} />}>
          Müşteri Taşı
        </Button>
      </Stack>
    </>
  );
};

export default DenetlenenImportOldButton;
