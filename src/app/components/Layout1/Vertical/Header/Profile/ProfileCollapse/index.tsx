import React from "react";

import { useState } from "react";
import { useSelector } from "@/store/hooks";
import { usePathname } from "next/navigation";

// mui imports
import Collapse from "@mui/material/Collapse";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme } from "@mui/material/styles";

// custom imports
import ProfileItem from "@/app/components/Layout/Vertical/Header/Profile/ProfileItem";
import { isNull } from "lodash";

// plugins
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { AppState } from "@/store/store";
import { Avatar, Box, Typography } from "@mui/material";

type ProfileGroupProps = {
  [x: string]: any;
  title?: string;
  icon?: any;
  href?: any;
};

interface ProfileCollapseProps {
  menu: ProfileGroupProps;
  level: number;
  pathWithoutLastPart: any;
  pathDirect: any;

  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

// FC Component For Dropdown Menu
export default function ProfileCollapse({
  menu,
  level,
  pathWithoutLastPart,
  pathDirect,

  onClick,
}: ProfileCollapseProps) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));

  const customizer = useSelector((state: AppState) => state.customizer);
  const Icon = menu?.icon;
  const theme = useTheme();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuIcon =
    level > 1 ? (
      <Icon stroke={1.5} size="1rem" />
    ) : (
      <Icon stroke={1.5} size="1.3rem" />
    );

  const handleClick = () => {
    setOpen(!open);
  };

  // menu collapse for sub-levels
  React.useEffect(() => {
    setOpen(false);
    menu?.children?.forEach((item: any) => {
      if (item?.href === pathname) {
        setOpen(true);
      }
    });
  }, [pathname, menu.children]);

  const ListItemStyled = styled(ListItemButton)(() => ({
    marginBottom: "2px",
    paddingRight: "0px",
    paddingLeft: "0px",
    whiteSpace: "normal",
    textOverflow: "ellipsis",

    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
    },
  }));

  // If Menu has Children
  const submenus = menu.children?.map((item: any) => {
    if (item.children) {
      return (
        <ProfileCollapse
          key={item?.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          onClick={onClick}
        />
      );
    } else {
      return (
        <ProfileItem
          key={item.id}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          onClick={lgDown ? onClick : isNull}
        />
      );
    }
  });

  return (
    <>
      <ListItemStyled
        onClick={handleClick}
        selected={pathWithoutLastPart === menu.href}
        key={menu?.id}
      >
        <Box
          width="45px"
          height="45px"
          bgcolor="primary.light"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink="0"
        >
          <Avatar
            src={menu.icon}
            sx={{
              width: 24,
              height: 24,
              borderRadius: 0,
              justifyContent: "center",
            }}
          ></Avatar>
        </Box>

        <div style={{ width: "100%" }}>
          <ListItemText
            color="inherit"
            className="hover-text-primary"
            sx={{
              paddingLeft: "5%",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="textPrimary"
              className="text-hover"
              noWrap
            >
              {" "}
              {<>{t(`${menu.title}`)}</>}
            </Typography>
          </ListItemText>
        </div>
        {!open ? (
          <IconChevronDown size="1rem" />
        ) : (
          <IconChevronUp size="1rem" />
        )}
      </ListItemStyled>
      <Collapse in={open}>{submenus}</Collapse>
    </>
  );
}
