import { Divider } from "@mui/material";
import ListSubheader from "@mui/material/ListSubheader";
import { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { IconDots } from "@tabler/icons-react";
import React from "react";

type NavGroup = {
  navlabel?: boolean;
  subheader?: string;
};

interface ItemType {
  item: NavGroup;
  hideMenu: string | boolean;
}

const NavGroup = ({ item, hideMenu }: ItemType) => {
  const ListSubheaderStyle = styled((props: Theme | any) => (
    <ListSubheader disableSticky {...props} />
  ))(({ theme }) => ({
    ...theme.typography.overline,
    height: "6px",
  }));

  return (
    <ListSubheaderStyle>
      {/*hideMenu ? <IconDots size="14" /> : <Divider />*/}
      <Divider />
    </ListSubheaderStyle>
  );
};

export default NavGroup;

