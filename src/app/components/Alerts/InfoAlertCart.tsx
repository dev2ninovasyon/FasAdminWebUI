import * as React from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material";

interface Props {
  setOpenCartAlert: (bool: boolean) => void;
  openCartAlert: boolean;
}

const InfoAlertCart = ({ setOpenCartAlert, openCartAlert }: Props) => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  return (
    <React.Fragment>
      <Snackbar
        open={openCartAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="info"
          variant="filled"
          sx={{
            width: "100%",
            color: "white",
            fontSize: "0.875rem",
            maxWidth: "720px",
            backgroundColor:
              customizer.activeMode == "dark"
                ? theme.palette.info.light
                : theme.palette.info.main,
          }}
        >
          İşlem Gerçekleştiriliyor...
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default InfoAlertCart;
