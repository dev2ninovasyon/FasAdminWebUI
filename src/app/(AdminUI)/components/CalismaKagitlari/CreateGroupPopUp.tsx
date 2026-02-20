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
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";

interface Props {
  islem: string;
  isPopUpOpen: boolean;

  setIslem: (islem: string) => void;
  setIsPopUpOpen: (deger: boolean) => void;
  handleCreateGroup: (islem: string) => void;
}
export const CreateGroupPopUp: React.FC<Props> = ({
  islem,
  isPopUpOpen,
  setIslem,
  setIsPopUpOpen,
  handleCreateGroup,
}) => {
  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
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
                Grup Ekle
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
              onClick={() => handleCreateGroup(islem)}
              sx={{ width: "20%" }}
            >
              Kaydet
            </Button>{" "}
            <Button
              variant="outlined"
              color="error"
              onClick={handleClosePopUp}
              sx={{ width: "20%" }}
            >
              Sil
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

