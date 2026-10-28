import Link from "next/link";
// mui imports
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme } from "@mui/material/styles";
import { useSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { AppState } from "@/store/store";
import { useLoading } from "@/contexts/LoadingContext";
import React from "react";

type NavGroup = {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
  children?: NavGroup[];
  chip?: string;
  chipColor?: any;
  variant?: string | any;
  external?: boolean;
  level?: number;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: any;
  level?: number | any;
  pathDirect: string;
}

export default function NavItem({
  item,
  level,
  pathDirect,
  hideMenu,
  onClick,
}: ItemType) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const Icon = item?.icon;
  const theme = useTheme();
  const { t } = useTranslation();
  const { setLoading } = useLoading();

  const itemIcon =
    level > 1 ? (
      <Icon stroke={1.5} size="1rem" />
    ) : (
      <Icon stroke={1.5} size="1.3rem" />
    );

  const ListItemStyled = styled(ListItemButton)(() => ({
    marginBottom: "2px",
    padding: "8px 10px",
    borderRadius: `${customizer.borderRadius}px`,
    backgroundColor: level > 1 ? "inherit" : "inherit",
    color:
      level > 1 && pathDirect === item?.href
        ? `white !important`
        : theme.palette.text.primary,
    paddingLeft: hideMenu ? "9.15px" : level > 2 ? `${level * 15}px` : "9.15px",
    "&:hover": {
      backgroundColor:
        customizer.activeMode === "dark"
          ? theme.palette.primary.dark
          : theme.palette.primary.main,
      color: "white",
    },
    "&.Mui-selected": {
      backgroundColor:
        customizer.activeMode === "dark"
          ? theme.palette.primary.dark
          : theme.palette.primary.main,
      color: "white",
      "&:hover": {
        backgroundColor:
          customizer.activeMode === "dark"
            ? theme.palette.primary.dark
            : theme.palette.primary.main,
        color: "white",
      },
    },
  }));

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    // Eğer farklı bir sayfaya gidiyorsak loading göster
    if (pathDirect !== item?.href && item?.href) {
      setLoading(true);
    }
    // Mobile'da sidebar'ı kapat
    if (lgDown && onClick) {
      onClick(e);
    }
  };

  return (
    <List component="li" disablePadding key={item?.id && item.title}>
      <Link href={item.href}>
        <ListItemStyled
          disabled={item?.disabled}
          selected={pathDirect === item?.href}
          onClick={handleClick}
          data-tour-id={item?.href} // ğŸ‘ˆ Driver.js için hedef
        >
          <ListItemIcon
            sx={{
              minWidth: "36px",
              p: "3px 0px",
              color:
                level > 1 && pathDirect === item?.href
                  ? `white !important`
                  : "inherit",
            }}
          >
            {itemIcon}
          </ListItemIcon>
          <ListItemText>
            {hideMenu ? "" : <>{t(`${item?.title}`)}</>}
            <br />
            {item?.subtitle ? (
              <Typography variant="caption">
                {hideMenu ? "" : item?.subtitle}
              </Typography>
            ) : (
              ""
            )}
          </ListItemText>

          {!item?.chip || hideMenu ? null : (
            <Chip
              color={item?.chipColor}
              variant={item?.variant ? item?.variant : "filled"}
              size="small"
              label={item?.chip}
            />
          )}
        </ListItemStyled>
      </Link>
    </List>
  );
}

