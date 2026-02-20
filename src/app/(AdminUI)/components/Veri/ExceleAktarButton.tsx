import React from "react";
import { Button } from "@mui/material";
import { IconFileTypeDocx, IconFileTypeXls } from "@tabler/icons-react";

interface Props {
  handleDownload: () => void;
}

const ExceleAktarButton: React.FC<Props> = ({ handleDownload }) => {
  return (
    <Button
      size="medium"
      variant="outlined"
      color="primary"
      startIcon={<IconFileTypeXls width={18} />}
      onClick={() => handleDownload()}
      sx={{ width: "100%" }}
    >
      Excel&apos;e Aktar
    </Button>
  );
};

export default ExceleAktarButton;

