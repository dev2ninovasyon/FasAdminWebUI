import { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogContent,
  Stack,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import { IconSearch, IconX } from "@tabler/icons-react";
import SearchBoxAutocomplete from "@/app/(AdminUI)/components/Layout/Vertical/Header/SearchBoxAutoComplete";
import { MenuitemsType } from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";
import { createMenuItems } from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface menuType {
  title: string;
  id: string;
  subheader: string;
  children: menuType[];
  href: string;
}

const Search = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const Menuitems: MenuitemsType[] = createMenuItems(
    user.rol || undefined,
    user.denetimTuru || undefined,
    user.enflasyonmu || undefined,
    user.konsolidemi || undefined,
    user.bddkmi || undefined
  );

  // drawer top
  const [showDrawer2, setShowDrawer2] = useState(false);
  const [search, setSerach] = useState("");

  const handleDrawerClose2 = () => {
    setShowDrawer2(false);
  };

  const filterRoutes = (rotr: any, cSearch: string) => {
    if (rotr.length > 1)
      return rotr.filter((t: any) =>
        t.title
          ? t.href.toLocaleLowerCase().includes(cSearch.toLocaleLowerCase())
          : ""
      );

    return rotr;
  };
  const searchData = filterRoutes(Menuitems, search);

  return (
    <>
      <IconButton
        aria-label="show 4 new mails"
        color="inherit"
        aria-controls="search-menu"
        aria-haspopup="true"
        onClick={() => setShowDrawer2(true)}
        size="large"
      >
        <IconSearch size="20" />
      </IconButton>
      <Dialog
        open={showDrawer2}
        onClose={() => setShowDrawer2(false)}
        fullWidth
        maxWidth={"sm"}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { position: "fixed", top: 30, m: 0 } }}
      >
        <DialogContent className="testdialog">
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" p={1}>
              Hï¿½zlï¿½ Sayfa Baï¿½lantï¿½larï¿½
            </Typography>
            <IconButton size="small" onClick={handleDrawerClose2}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <Box p={2} sx={{ height: "255px", overflow: "auto" }}>
          <Box>
            <SearchBoxAutocomplete />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default Search;

