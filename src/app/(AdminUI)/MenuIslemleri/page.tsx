"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { IconEdit, IconExternalLink, IconSearch, IconSitemap, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import PageContainer from "@/app/components/Container/PageContainer";
import Breadcrumb from "@/app/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BlankCard from "@/app/components/Shared/BlankCard";
import { getMenus, Menu as MenuType } from "@/api/Menu/Menu";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import MenuUsageDialog from "@/app/components/MenuIslemleri/MenuUsageDialog";

const BCrumb = [
  {
    to: "/Anasayfa",
    title: "Admin",
  },
  {
    to: "/MenuIslemleri",
    title: "Menü İşlemleri",
  },
];

type MenuNode = MenuType & {
  children: MenuNode[];
};

const getMenuLabel = (menu: MenuType) =>
  menu.belgeAdi || menu.formKodu || menu.referansNo || menu.formUrl || `Menu #${menu.id}`;

const buildMenuTree = (menus: MenuType[]) => {
  const sortedMenus = [...menus].sort((a, b) => {
    const orderDiff = (a.sira ?? Number.MAX_SAFE_INTEGER) - (b.sira ?? Number.MAX_SAFE_INTEGER);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    return getMenuLabel(a).localeCompare(getMenuLabel(b), "tr");
  });

  const nodeMap = new Map<number, MenuNode>();
  const roots: MenuNode[] = [];

  sortedMenus.forEach((menu) => {
    nodeMap.set(menu.id, { ...menu, children: [] });
  });

  sortedMenus.forEach((menu) => {
    const currentNode = nodeMap.get(menu.id);
    if (!currentNode) {
      return;
    }

    if (menu.parentId && nodeMap.has(menu.parentId)) {
      nodeMap.get(menu.parentId)?.children.push(currentNode);
      return;
    }

    roots.push(currentNode);
  });

  return roots;
};

const filterMenuTree = (nodes: MenuNode[], rawSearchTerm: string): MenuNode[] => {
  const searchTerm = rawSearchTerm.trim().toLowerCase();
  if (!searchTerm) {
    return nodes;
  }

  return nodes
    .map((node) => {
      const filteredChildren = filterMenuTree(node.children, rawSearchTerm);
      const searchableText = [
        node.belgeAdi,
        node.formKodu,
        node.dosyaNevi,
        node.referansNo,
        node.formUrl,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const isMatch = searchableText.includes(searchTerm);
      if (!isMatch && filteredChildren.length === 0) {
        return null;
      }

      return {
        ...node,
        children: filteredChildren,
      };
    })
    .filter((node): node is MenuNode => node !== null);
};

const MenuTreeRow = ({
  node,
  level,
  expandedIds,
  onToggle,
  onEdit,
}: {
  node: MenuNode;
  level: number;
  expandedIds: Set<number>;
  onToggle: (menuId: number) => void;
  onEdit: (menu: MenuType) => void;
}) => {
  const theme = useTheme();
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  return (
    <Box sx={{ pl: level === 0 ? 0 : 2.5, position: "relative" }}>
      {level > 0 && (
        <Box
          sx={{
            position: "absolute",
            left: 10,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.14),
          }}
        />
      )}

      <Box
        sx={{
          mb: 1.25,
          borderRadius: 3,
          border: `1px solid ${hasChildren ? alpha(theme.palette.primary.main, 0.28) : theme.palette.divider}`,
          backgroundColor: hasChildren ? alpha(theme.palette.primary.main, 0.04) : "background.paper",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
            <IconButton
              size="small"
              onClick={() => {
                if (hasChildren) {
                  onToggle(node.id);
                }
              }}
              sx={{ mt: 0.2, color: hasChildren ? "text.primary" : "text.disabled" }}
            >
              {hasChildren ? (isExpanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />) : <IconChevronRight size={18} opacity={0.2} />}
            </IconButton>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant={level === 0 ? "h6" : level === 1 ? "subtitle1" : "body1"} fontWeight={hasChildren ? 700 : 500}>
                {getMenuLabel(node)}
              </Typography>

              <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, flexWrap: "wrap" }}>
                <Chip label={`ID: ${node.id}`} size="small" variant="outlined" />
                {node.dosyaNevi && <Chip label={node.dosyaNevi} size="small" variant="outlined" />}
                {node.formKodu && <Chip label={`Form: ${node.formKodu}`} size="small" color="primary" variant="outlined" />}
                {node.referansNo && <Chip label={`Ref: ${node.referansNo}`} size="small" variant="outlined" />}
                {node.formUrl && <Chip label={node.formUrl} size="small" color="secondary" variant="outlined" />}
                {hasChildren && (
                  <Chip label={`${node.children.length} alt başlık`} size="small" color="primary" variant={isExpanded ? "filled" : "outlined"} />
                )}
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title="Kullanım Bilgisi Düzenle">
              <IconButton color="primary" onClick={() => onEdit(node)}>
                <IconEdit size="20" />
              </IconButton>
            </Tooltip>
            {node.formUrl && node.formUrl !== "#" && (
              <Tooltip title="Bağlantıyı Aç">
                <IconButton size="small" component="a" href={node.formUrl} target="_blank">
                  <IconExternalLink size="18" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              {node.children.map((child) => (
                <MenuTreeRow
                  key={child.id}
                  node={child}
                  level={level + 1}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onEdit={onEdit}
                />
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    </Box>
  );
};

const MenuIslemleriPage = () => {
  usePageTitle("Menü İşlemleri");
  const user = useSelector((state: AppState) => state.userReducer);
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuType | null>(null);

  const menuTree = useMemo(() => buildMenuTree(menus), [menus]);
  const filteredTree = useMemo(() => filterMenuTree(menuTree, searchTerm), [menuTree, searchTerm]);
  const allMenuIds = useMemo(() => menus.map((menu) => menu.id), [menus]);

  useEffect(() => {
    if (!user.token) {
      setLoading(false);
      return;
    }

    void fetchMenus();
  }, [user.token]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedIds(new Set(allMenuIds));
    }
  }, [searchTerm, allMenuIds]);

  const fetchMenus = async () => {
    if (!user.token) return;

    setLoading(true);
    setError("");
    try {
      const data = await getMenus(user.token);
      const nextMenus = Array.isArray(data) ? data : [];
      setMenus(nextMenus);
      setExpandedIds(new Set(buildMenuTree(nextMenus).map((menu) => menu.id)));
    } catch (err) {
      setMenus([]);
      setError("Menüler yüklenirken bir hata oluştu.");
      console.error("Menüler getirilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleEditUsage = (menu: MenuType) => {
    setSelectedMenu(menu);
    setDialogOpen(true);
  };

  const handleToggle = (menuId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(allMenuIds));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <PageContainer title="Menü İşlemleri" description="Menü kullanım bilgilerini yönetin">
      <Breadcrumb title="Menü İşlemleri" items={BCrumb} />

      <BlankCard>
        <Box sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                }}
              >
                <IconSitemap size={22} />
              </Box>
              <Box>
                <Typography variant="h5">Sistem Menüleri</Typography>
                <Typography variant="body2" color="text.secondary">
                  Alt başlıklar kırılımlı ve collapse yapıda listelenir.
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ width: { xs: "100%", sm: "auto" } }}>
              <TextField
                size="small"
                placeholder="Menü ara..."
                value={searchTerm}
                onChange={handleSearchChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size="18" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ width: { xs: "100%", sm: "320px" } }}
              />
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={handleExpandAll}>
                  Tümünü Aç
                </Button>
                <Button variant="outlined" color="inherit" onClick={handleCollapseAll}>
                  Tümünü Kapat
                </Button>
              </Stack>
            </Stack>
          </Stack>

          <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
            Toplam {menus.length} menü kaydı bulundu. Eşleşen alt başlıklar varsa üst başlıklar görünür kalır.
          </Alert>

          {loading && (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Menü listesi yükleniyor...
              </Typography>
            </Box>
          )}

          {error && !loading && (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          )}

          {!loading && !error && filteredTree.length === 0 && (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Menü bulunamadı.
              </Typography>
            </Box>
          )}

          {!loading && !error && filteredTree.length > 0 && (
            <Box>
              {filteredTree.map((menu) => (
                <MenuTreeRow
                  key={menu.id}
                  node={menu}
                  level={0}
                  expandedIds={expandedIds}
                  onToggle={handleToggle}
                  onEdit={handleEditUsage}
                />
              ))}
            </Box>
          )}
        </Box>
      </BlankCard>

      <MenuUsageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        menu={selectedMenu}
        onSuccess={fetchMenus}
      />
    </PageContainer>
  );
};

export default MenuIslemleriPage;
