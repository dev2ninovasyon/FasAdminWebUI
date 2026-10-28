import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
// LoadingButton import removed

interface ConfirmPopUpProps {
  isConfirmPopUp: boolean;
  handleClose: () => void;
  handleDelete: () => void;
  isLoading?: boolean;
}

export const ConfirmPopUpComponent: React.FC<ConfirmPopUpProps> = ({
  isConfirmPopUp,
  handleClose,
  handleDelete,
  isLoading = false,
}) => {
  return (
    <Dialog maxWidth={"lg"} open={isConfirmPopUp} onClose={handleClose}>
      {isConfirmPopUp && (
        <>
          <DialogContent className="testdialog">
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Typography variant="h5">
                Silmek istediğinize emin misiniz?
              </Typography>
            </Stack>
          </DialogContent>
          <DialogContent>
            <Box py={1}>
              <Button
                variant="outlined"
                color="error"
                loading={isLoading}
                onClick={() => {
                  handleDelete();
                }}
                sx={{ width: "100%", mb: 1 }}
              >
                Evet, Sil
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

