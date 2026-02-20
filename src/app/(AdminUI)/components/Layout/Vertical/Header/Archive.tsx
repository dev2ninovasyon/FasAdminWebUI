import React from "react";
import { IconButton, Box, Tooltip } from "@mui/material";
import { IconArchive } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const Archive = () => {
  const router = useRouter();
  return (
    <Box>
      <Tooltip
        title="Arşive Git"
        onClick={() => {
          router.push("/DigerIslemler/Arsiv");
        }}
      >
        <IconButton size="large" aria-label="archive button" color="inherit">
          <IconArchive size="20" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Archive;

