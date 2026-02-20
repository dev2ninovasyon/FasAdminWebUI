import * as React from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useTheme } from "@mui/material";

interface Props {
  setOpenCartAlert: (bool: boolean) => void;
  openCartAlert: boolean;
  message: string;
}

const WarnAlertCart = ({ setOpenCartAlert, openCartAlert, message }: Props) => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const handleClose = (event: React.SyntheticEvent | any, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenCartAlert(false);
  };
  return (
    <React.Fragment>
      <Snackbar
        open={openCartAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            width: "100%",
            color: "white",
            fontSize: "0.875rem",
            maxWidth: "720px",
            backgroundColor:
              customizer.activeMode == "dark"
                ? theme.palette.warning.dark
                : theme.palette.warning.main,
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};

export default WarnAlertCart;

