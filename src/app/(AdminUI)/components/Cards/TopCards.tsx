import Image from "next/image";
import {
  Box,
  CardContent,
  Grid,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
const icon1 = "/images/svgs/icon-connect.svg";
const icon2 = "/images/svgs/icon-user-male.svg";
const icon3 = "/images/svgs/icon-briefcase.svg";
const icon4 = "/images/svgs/icon-mailbox.svg";
const icon5 = "/images/svgs/icon-favorites.svg";
const icon6 = "/images/svgs/icon-speech-bubble.svg";
import Link from "next/link";
import { MenuitemsType } from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";
import { createMenuItems } from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useLoading } from "@/contexts/LoadingContext";

function randomIcon() {
  var icons = [icon1, icon2, icon3, icon4, icon5, icon6];
  var randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}

function randomColor() {
  var colors = [
    /*"primary",*/
    /*"warning",*/
    /*"secondary",*/
    "error",
    "success",
    "info",
  ];
  var randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

interface TopCardsProps {
  title: string;
  parenTitle?: string;
}

const TopCards: React.FC<TopCardsProps> = ({ title, parenTitle }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const { setLoading } = useLoading();

  const Menuitems: MenuitemsType[] = createMenuItems(
    user.rol || undefined,
    user.denetimTuru || undefined,
    user.enflasyonmu || undefined,
    user.konsolidemi || undefined,
    user.bddkmi || undefined
  );

  const findItemTitle = (
    title: string,
    items: MenuitemsType[],
    parentTitle?: string
  ): MenuitemsType | null => {
    for (const item of items) {
      if (item.title === title) {
        if (parentTitle && item.parentTitle !== parentTitle) {
          continue;
        }
        return item;
      }
      if (item.children) {
        const found = findItemTitle(title, item.children, parentTitle);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const MenuItem = findItemTitle(title, Menuitems, parenTitle);

  let TopCards: Array<{
    icon: any;
    title: string;
    href: string;
    bgcolor: string;
    aciklama?: string;
  }> = [];

  if (MenuItem && MenuItem.children && MenuItem.children.length > 0) {
    TopCards = MenuItem.children.map((child: MenuitemsType) => ({
      icon: child.customIcon
        ? child.customIcon.replace("public", "")
        : randomIcon(),
      title: child.title || "",
      href: child.href || "",
      bgcolor: randomColor(),
      aciklama: child.aciklama,
    }));
  }

  return (
    <Grid container spacing={3} mt={1}>
      {TopCards.map((topcard, i) => (
        <Grid
          key={i}
          size={{
            xs: 12,
            sm: 4,
            lg: 3
          }}>
          {topcard.aciklama != undefined ? (
            <Tooltip
              title={topcard.aciklama}
              placement="bottom"
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor:
                      customizer.activeMode == "dark"
                        ? theme.palette.primary.dark
                        : theme.palette.primary.main,
                    color: theme.palette.getContrastText(
                      customizer.activeMode == "dark"
                        ? theme.palette.primary.dark
                        : theme.palette.primary.main
                    ),
                  },
                },
              }}
            >
              <Link href={topcard.href} passHref onClick={() => setLoading(true)}>
                <Box bgcolor={topcard.bgcolor + ".light"} textAlign="center">
                  <CardContent style={{ height: "180px" }}>
                    <Image
                      src={topcard.icon}
                      alt={"topcard.icon"}
                      width="50"
                      height="50"
                    />

                    <Typography
                      color={topcard.bgcolor + ".main"}
                      mt={1}
                      variant="subtitle1"
                      fontWeight={600}
                    >
                      {topcard.title}
                    </Typography>
                  </CardContent>
                </Box>
              </Link>
            </Tooltip>
          ) : (
            <Link href={topcard.href} passHref onClick={() => setLoading(true)}>
              <Box bgcolor={topcard.bgcolor + ".light"} textAlign="center">
                <CardContent style={{ height: "180px" }}>
                  <Image
                    src={topcard.icon}
                    alt={"topcard.icon"}
                    width="50"
                    height="50"
                  />

                  <Typography
                    color={topcard.bgcolor + ".main"}
                    mt={1}
                    variant="subtitle1"
                    fontWeight={600}
                  >
                    {topcard.title}
                  </Typography>
                </CardContent>
              </Box>
            </Link>
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default TopCards;

