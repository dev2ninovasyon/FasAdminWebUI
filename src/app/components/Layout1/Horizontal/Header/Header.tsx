import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { Theme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/material/styles";
import { useSelector, useDispatch } from "@/store/hooks";
import {
  toggleMobileSidebar,
  toggleSidebar,
} from "@/store/customizer/CustomizerSlice";
import { IconMenu2 } from "@tabler/icons-react";
import Notifications from "@/app/components/Layout/Vertical/Header/Notification";

import Profile from "@/app/components/Layout/Vertical/Header/Profile/Profile";
import Search from "@/app/components/Layout/Vertical/Header/Search";
import Language from "@/app/components/Layout/Vertical/Header/Language";
import Logo from "@/app/components/Layout/Shared/Logo/Logo";
import { AppState } from "@/store/store";

const Header = () => {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));

  // drawer
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",

    [theme.breakpoints.up("lg")]: {
      minHeight: customizer.TopbarHeight,
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    margin: "0 auto",
    width: "100%",
    color: `${theme.palette.text.secondary} !important`,
  }));

  return (
    <AppBarStyled position="sticky" color="default" elevation={8}>
      <ToolbarStyled
        sx={{
          maxWidth: customizer.isLayout === "boxed" ? "lg" : "100%!important",
        }}
      >
        {customizer.isHorizontal && lgUp && (
          <Box sx={{ width: lgDown ? "45px" : "auto", overflow: "hidden" }}>
            <Logo />
          </Box>
        )}
        {/* ------------------------------------------- */}
        {/* Toggle Button Sidebar */}
        {/* ------------------------------------------- */}
        {lgDown ? (
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={
              lgUp
                ? () => dispatch(toggleSidebar())
                : () => dispatch(toggleMobileSidebar())
            }
          >
            <IconMenu2 size="20" />
          </IconButton>
        ) : (
          ""
        )}
        {/* ------------------------------------------- */}
        {/* Search Dropdown */}
        {/* ------------------------------------------- */}
        <Search />
        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          <Language />
          {/* ------------------------------------------- */}
          {/* Ecommerce Dropdown */}
          {/* ------------------------------------------- */}

          {/* ------------------------------------------- */}
          {/* End Ecommerce Dropdown */}
          {/* ------------------------------------------- */}
          <Notifications />
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
