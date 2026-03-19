"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  TablePagination,
  Chip,
  Tooltip,
} from "@mui/material";
import { IconSearch, IconInfoCircle, IconEdit, IconExternalLink } from "@tabler/icons-react";
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

const MenuIslemleriPage = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuType | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const data = await getMenus(user.token || "");
      setMenus(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Menüler getirilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredMenus = menus.filter(
    (m) =>
      m.belgeAdi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.formKodu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.dosyaNevi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditUsage = (menu: MenuType) => {
    setSelectedMenu(menu);
    setDialogOpen(true);
  };

  return (
    <PageContainer title="Menü İşlemleri" description="Menü kullanım bilgilerini yönetin">
      <Breadcrumb title="Menü İşlemleri" items={BCrumb} />
      
      <BlankCard>
        <Box sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2} mb={3}>
            <Typography variant="h5">Sistem Menüleri</Typography>
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
              sx={{ width: { xs: "100%", sm: "300px" } }}
            />
          </Stack>

          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>ID</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Menü Adı</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Dosya Nevi</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Ref No</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Form URL</Typography></TableCell>
                  <TableCell align="center"><Typography variant="subtitle2" fontWeight={600}>İşlemler</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMenus
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((menu) => (
                    <TableRow key={menu.id} hover>
                      <TableCell>{menu.id}</TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>{menu.belgeAdi}</Typography>
                        <Typography variant="caption" color="textSecondary">{menu.formKodu}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={menu.dosyaNevi || "-"} variant="outlined" />
                      </TableCell>
                      <TableCell>{menu.referansNo || "-"}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {menu.formUrl}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Kullanım Bilgisi Düzenle">
                          <IconButton color="primary" onClick={() => handleEditUsage(menu)}>
                            <IconEdit size="20" />
                          </IconButton>
                        </Tooltip>
                        {menu.formUrl && menu.formUrl !== "#" && (
                          <Tooltip title="Bağlantıyı Aç">
                            <IconButton size="small" component="a" href={menu.formUrl} target="_blank">
                              <IconExternalLink size="18" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredMenus.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="textSecondary">Menü bulunamadı.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredMenus.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Satır sayısı:"
          />
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
