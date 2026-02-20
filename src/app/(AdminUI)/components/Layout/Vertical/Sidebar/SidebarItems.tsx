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
import { MenuitemsType } from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";
import { createMenuItems } from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";

interface Props {
  isSidebarHover: boolean;
}
const SidebarItems: React.FC<Props> = ({ isSidebarHover }) => {
  const pathname = usePathname();
  const pathDirect = pathname.split("/").slice(0, 2).join("/");
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf("/"));
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const Menuitems: MenuitemsType[] = createMenuItems(
    user.rol || undefined,
    user.denetimTuru || undefined,
    user.enflasyonmu || undefined,
    user.konsolidemi || undefined,
    user.bddkmi || undefined,
    user.yil || undefined
  );

  // ï¿½irket seï¿½ilmediyse sadece ANASAYFA gï¿½ster
  const filteredMenuItems = user.denetlenenId
    ? Menuitems
    : Menuitems.filter((item) => item.title === "ANASAYFA");

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const hideMenu: any = lgUp ? customizer.isCollapse && !isSidebarHover : "";
  const dispatch = useDispatch();
  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {filteredMenuItems.map((item) => {
          // {/********SubHeader**********/}
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
          //}
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;

