import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";

interface ConfirmPopUpProps {
  tip: string;
  isConfirmPopUp: boolean;
  handleClose: () => void;
  handleContinue: () => void;
}

export const MizanConfirmPopUpComponent: React.FC<ConfirmPopUpProps> = ({
  tip,
  isConfirmPopUp,
  handleClose,
  handleContinue,
}) => {
  return (
    <Dialog maxWidth={"sm"} open={isConfirmPopUp} onClose={handleClose}>
      {isConfirmPopUp && (
        <>
          <DialogContent className="testdialog">
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Typography variant="h5" align="center">
                {tip === "VukMizan"
                  ? "Vuk Mizandan oluşturulmuş Program Vuk Mizan Formatı zaten mevcut. Devam ederseniz mevcut Program Vuk Mizan Formatı silinecektir. Devam etmek istiyor musunuz?"
                  : tip === "E-Defter"
                  ? "E-Defterden oluşturulmuş Program Vuk Mizan Formatı zaten mevcut. Devam ederseniz mevcut Program Vuk Mizan Formatı silinecektir. Devam etmek istiyor musunuz?"
                  : ""}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogContent>
            <Box py={1}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleContinue();
                  handleClose();
                }}
                sx={{ width: "100%", mb: 1 }}
              >
                Evet, Sil ve Devam Et
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleClose()}
                sx={{ width: "100%" }}
              >
                Hayır, İptal Et
              </Button>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

