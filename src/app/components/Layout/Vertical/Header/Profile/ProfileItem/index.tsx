import React from "react";
import Link from "next/link";

// mui imports
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, useTheme } from "@mui/material/styles";
import { useSelector } from "@/store/hooks";
import { useTranslation } from "react-i18next";
import { AppState } from "@/store/store";
import { Avatar, Box } from "@mui/material";

type ProfileGroup = {
  [x: string]: any;
  id?: string;
  title?: string;
  subtitle?: string;
  icon?: any;
  href?: any;
  children?: ProfileGroup[];
  level?: number;
  onClick?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
};

interface ItemType {
  item: ProfileGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;

  level?: number | any;
  pathDirect: string;
}

export default function ProfileItem({
  item,
  level,
  pathDirect,

  onClick,
}: ItemType) {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const Icon = item?.icon;
  const theme = useTheme();
  const { t } = useTranslation();
  const itemIcon =
    level > 1 ? (
      <Icon stroke={1.5} size="1rem" />
    ) : (
      <Icon stroke={1.5} size="1.3rem" />
    );

  const ListItemStyled = styled(ListItemButton)(() => ({
    marginBottom: "2px",
    paddingRight: "0px",
    borderRadius: `${customizer.borderRadius}px`,

    color:
      level > 1 && pathDirect === item?.href
        ? `${theme.palette.primary.main}!important`
        : theme.palette.text.secondary,
    paddingLeft: "0px",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main,
    },
  }));

  return (
    <List component="li" disablePadding key={item?.id && item.title}>
      <Link href={item.href}>
        <ListItemStyled
          disabled={item?.disabled}
          selected={pathDirect === item?.href}
          onClick={lgDown ? onClick : undefined}
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
              src={item.icon}
              sx={{
                width: 24,
                height: 24,
                borderRadius: 0,
              }}
            >
              {}
            </Avatar>
          </Box>

          <ListItemText
            className="hover-text-primary"
            sx={{
              paddingLeft: "5%",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={level > 1 ? 400 : 600}
              color="textPrimary"
              className="text-hover"
              noWrap
              sx={{
                width: "240px",
              }}
            >
              {<>{t(`${item?.title}`)}</>}
            </Typography>

            {item?.subtitle ? (
              <Typography
                color="textSecondary"
                variant="subtitle2"
                className="hover-text-primary"
                sx={{
                  width: "240px",
                }}
                noWrap
              >
                {item?.subtitle}
              </Typography>
            ) : (
              ""
            )}
          </ListItemText>
        </ListItemStyled>
      </Link>
    </List>
  );
}
