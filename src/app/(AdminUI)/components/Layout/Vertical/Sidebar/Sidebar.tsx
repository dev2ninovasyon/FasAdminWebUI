import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "@/store/hooks";
import { toggleMobileSidebar } from "@/store/customizer/CustomizerSlice";
import { AppState } from "@/store/store";
import CollapseLogo from "@/app/(AdminUI)/components/Layout/Shared/Logo/CollapsLogo";
import Scrollbar from "@/app/components/CustomScroll/Scrollbar";
import Logo from "@/app/(AdminUI)/components/Layout/Shared/Logo/Logo";
import SidebarItems from "./SidebarItems";
import MobileLogo from "@/app/(AdminUI)/components/Layout/Shared/Logo/MobileLogo";

interface Props {
  isSidebarHover: boolean;
  setIsSidebarHover: (bool: boolean) => void;
}

const Sidebar: React.FC<Props> = ({ isSidebarHover, setIsSidebarHover }) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();

  const toggleWidth =
    customizer.isCollapse && !isSidebarHover
      ? customizer.MiniSidebarWidth
      : customizer.SidebarWidth;

  const onHoverEnter = () => {
    if (customizer.isCollapse) {
      setIsSidebarHover(true);
    }
  };

  const onHoverLeave = () => {
    setIsSidebarHover(false);
  };

  if (lgUp) {
    return (
      <>
        <Box
          sx={{
            zIndex: 100,
            width: toggleWidth,
            flexShrink: 0,
            ...(customizer.isCollapse && {
              position: "absolute",
            }),
          }}
        >
          {/* Sidebar for desktop */}
          <Drawer
            anchor="left"
            open
            onMouseEnter={onHoverEnter}
            onMouseLeave={onHoverLeave}
            variant="permanent"
            PaperProps={{
              sx: {
                transition: theme.transitions.create("width", {
                  duration: theme.transitions.duration.shortest,
                }),
                backgroundColor:
                  customizer.activeMode === "dark"
                    ? "#0e121a"
                    : "primary.light",
                width: toggleWidth,
                boxSizing: "border-box",
              },
            }}
          >
            <Box
              sx={{
                height: "100%",
              }}
            >
              {/* Logo */}
              <Box
                px={customizer.isCollapse ? "23px" : "24px"}
                marginBottom={customizer.isCollapse ? 0 : 1.5}
              >
                {customizer.isCollapse ? <CollapseLogo /> : <Logo />}
              </Box>

              <Scrollbar sx={{ height: "calc(100% - 100px)" }}>
                <SidebarItems isSidebarHover={isSidebarHover} />
              </Scrollbar>
            </Box>
          </Drawer>
        </Box>

      </>
    );
  }

  return (
    <>
      <Drawer
        anchor="left"
        open={customizer.isMobileSidebar}
        onClose={() => dispatch(toggleMobileSidebar())}
        variant="temporary"
        PaperProps={{
          sx: {
            width: customizer.SidebarWidth,
            backgroundColor:
              customizer.activeMode === "dark" ? "#0e121a" : "primary.light",
            border: "0 !important",
            boxShadow: (theme) => theme.shadows[8],
          },
        }}
      >
        {/* Logo */}
        <Box px={3} marginBottom={2}>
          <MobileLogo />
        </Box>

        {/* Sidebar For Mobile */}
        <SidebarItems isSidebarHover={isSidebarHover} />
      </Drawer>

      {/* ğŸ‘‰ Saï¿½ alttaki rehber butonu (mobile) */}
    </>
  );
};

export default Sidebar;

