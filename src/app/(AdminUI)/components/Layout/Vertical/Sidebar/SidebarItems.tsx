import React from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDispatch, useSelector } from "@/store/hooks";
import NavItem from "./NavItem";
import NavGroup from "./NavGroup/NavGroup";
import { AppState } from "@/store/store";
import { toggleMobileSidebar } from "@/store/customizer/CustomizerSlice";
import {
  MenuitemsType,
  createMenuItems,
} from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";

interface Props {
  isSidebarHover: boolean;
}

const SidebarItems: React.FC<Props> = ({ isSidebarHover }) => {
  const pathname = usePathname();
  const pathDirect = pathname.split("/").slice(0, 2).join("/");
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const menuItems: MenuitemsType[] = createMenuItems(
    user.rol || undefined,
    user.denetimTuru || undefined,
    user.enflasyonmu || undefined,
    user.konsolidemi || undefined,
    user.bddkmi || undefined,
    user.yil || undefined
  );

  const visibleMenuItems = user.denetlenenId
    ? menuItems
    : menuItems.filter((item) => item.title === "ANASAYFA");

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const hideMenu: any = lgUp ? customizer.isCollapse && !isSidebarHover : "";

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {visibleMenuItems.map((item) => {
          if (item.subheader) {
            return (
              <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />
            );
          }

          return (
            <NavItem
              item={item}
              key={item.id}
              pathDirect={pathDirect}
              hideMenu={hideMenu}
              onClick={() => dispatch(toggleMobileSidebar())}
            />
          );
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;
