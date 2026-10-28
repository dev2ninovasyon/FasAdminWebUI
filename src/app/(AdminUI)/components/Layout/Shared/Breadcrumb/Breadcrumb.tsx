"use client";
import React, { useState } from "react";
import {
  Grid,
  Typography,
  Box,
  Breadcrumbs,
  Theme,
  ListItemIcon,
  useMediaQuery,
  IconButton,
  Menu,
} from "@mui/material";
import NextLink from "next/link";
import { IconChevronLeft, IconDotsVertical } from "@tabler/icons-react";
import { MenuitemsType, createMenuItems } from "@/app/(AdminUI)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useLoading } from "@/contexts/LoadingContext";
import { usePathname } from "next/navigation";

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: React.ReactNode;
}

const Breadcrumb = ({ subtitle, items, title, children }: BreadCrumbType) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { setLoading } = useLoading();
  const pathname = usePathname();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const Menuitems: MenuitemsType[] = React.useMemo(() => createMenuItems(
    user.rol || undefined,
    user.denetimTuru || undefined,
    user.enflasyonmu || undefined,
    user.konsolidemi || undefined,
    user.bddkmi || undefined
  ), [user.rol, user.denetimTuru, user.enflasyonmu, user.konsolidemi, user.bddkmi]);

  const itemsTitle = items && items.length > 0 ? items.map((item) => item.title.toUpperCase().replace(/I/g, "ï¿½"))[0] : "";
  const MenuItemData: any = itemsTitle && Menuitems.find((item) => item.title?.toUpperCase() === itemsTitle);
  const Icon = MenuItemData && MenuItemData?.icon;
  const itemIcon = MenuItemData && <Icon stroke={0.8} size="100%" />;

  const handleBreadcrumbClick = (to: string) => { if (pathname !== to) setLoading(true); };

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  return (
    <Grid
      container
      alignItems="center"
      sx={{
        backgroundColor: "primary.light",
        borderRadius: (theme: Theme) => (theme.shape.borderRadius as number) / 4,
        p: "20px 25px",
        marginBottom: "15px",
        position: "relative",
        overflow: "hidden", // Arka plan ikonunun taï¿½mamasï¿½ iï¿½in
        minHeight: "90px",
      }}
    >

      {/* 2. SOL TARAF: Yazï¿½lar (zIndex: 1 ile ikonun ï¿½stï¿½nde) */}
      <Grid
        sx={{ zIndex: 1 }}
        size={{
          xs: 9,
          sm: 8
        }}>
        <Typography variant="h4">{title}</Typography>
        {items && (
          <Breadcrumbs separator={null} sx={{ alignItems: "center", mt: 0.5 }} aria-label="breadcrumb">
            {items.filter((item) => item.title !== title).map((item) => (
              <div key={item.title}>
                {item.to ? (
                  <NextLink href={item.to} passHref onClick={() => handleBreadcrumbClick(item.to)} style={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      color={item.title === subtitle ? "white" : "textPrimary"}
                      sx={{
                        backgroundColor: item.title === subtitle ? "primary.main" : "transparent",
                        px: item.title === subtitle ? 1 : 0,
                        borderRadius: (theme: Theme) => (theme.shape.borderRadius as number) / 4,
                        display: "flex", alignItems: "center", fontSize: "0.875rem"
                      }}
                    >
                      <IconChevronLeft size="16" style={{ marginRight: 4 }} />
                      {item.title}
                    </Typography>
                  </NextLink>
                ) : (
                  <Typography sx={{ fontSize: "0.875rem" }}>{item.title}</Typography>
                )}
              </div>
            ))}
          </Breadcrumbs>
        )}
      </Grid>
      {/* 3. SAï¿½ TARAF: Aksiyonlar (zIndex: 1) */}
      <Grid
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ zIndex: 1 }}
        size={{
          xs: 3,
          sm: 4
        }}>
        {children && (
          <>
            {smDown ? (
              <>
                <IconButton onClick={handleOpenMenu} color="primary">
                  <IconDotsVertical />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  TransitionComponent={Box as any}
                  slotProps={{
                    paper: {
                      sx: {
                        p: 2,
                        minWidth: '200px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', // BOX'I ORTALAR
                      }
                    }
                  }}
                >
                  <div style={{ outline: 'none' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center', // ï¿½ï¿½ï¿½NDEKï¿½LERï¿½ ORTALAR
                        justifyContent: 'center',
                        textAlign: 'center',
                        width: '100%',
                        gap: 2
                      }}
                    >
                      {/* Children iï¿½inde fragment varsa onlarï¿½ tek tek ele alï¿½p ortalarï¿½z */}
                      {React.Children.map(React.Children.toArray(children), (child) => (
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                          {child}
                        </Box>
                      ))}
                    </Box>
                  </div>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {children}
              </Box>
            )}
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default Breadcrumb;

