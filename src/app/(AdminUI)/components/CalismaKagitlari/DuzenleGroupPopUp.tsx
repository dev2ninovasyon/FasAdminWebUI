import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";
import { ConfirmPopUpComponent } from "./ConfirmPopUp";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

interface Props {
  islem: string;
  isPopUpOpen: boolean;
  setIslem: (islem: string) => void;
  setIsPopUpOpen: (deger: boolean) => void;
  handleGroupUpdate(islem: string): void;
  handleGroupDelete(): void;
}
export const DuzenleGroupPopUp: React.FC<Props> = ({
  islem,
  isPopUpOpen,
  setIslem,
  setIsPopUpOpen,
  handleGroupUpdate,
  handleGroupDelete,
}) => {
  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };

  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleIsConfirm = () => {
    setIsConfirmPopUpOpen(!isConfirmPopUpOpen);
  };
  return (
    <Dialog
      fullWidth
      maxWidth={"lg"}
      open={isPopUpOpen}
      onClose={handleClosePopUp}
    >
      {isPopUpOpen && (
        <>
          <DialogContent className="testdialog">
            <Stack
              direction="row"
              spacing={2}
              justifyContent={"space-between"}
              alignItems="center"
            >
              <Typography variant="h4" py={1} px={3}>
                Grup Düzenle
              </Typography>
              <IconButton size="small" onClick={handleClosePopUp}>
                <IconX size="18" />
              </IconButton>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogContent>
            <Box p={3}>
              <Typography variant="h5" p={1}>
                İşlem
              </Typography>
              <CustomTextField
                id="Islem"
                multiline
                rows={8}
                variant="outlined"
                fullWidth
                value={islem}
                onChange={(e: any) => setIslem(e.target.value)}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", mb: "15px" }}>
            <Button
              variant="outlined"
              color="success"
              onClick={() => {
                handleGroupUpdate(islem);
                handleClosePopUp();
              }}
              sx={{ width: "20%" }}
            >
              Kaydet
            </Button>{" "}
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                handleIsConfirm();
              }}
              sx={{ width: "20%" }}
            >
              Sil
            </Button>
          </DialogActions>
        </>
      )}
      {isConfirmPopUpOpen && (
        <ConfirmPopUpComponent
          isConfirmPopUp={isConfirmPopUpOpen}
          handleClose={handleClosePopUp}
          handleDelete={handleGroupDelete}
        />
      )}
    </Dialog>
  );
};

