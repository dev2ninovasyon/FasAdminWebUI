"use client";

import { getAdminDashboardOverview, type AdminDashboardOverview } from "@/api/Dashboard/AdminDashboard";
import PageContainer from "@/app/components/Container/PageContainer";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  IconArrowUpRight,
  IconBuildingBank,
  IconBriefcase,
  IconMail,
  IconPhone,
  IconRefresh,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type MetricCardProps = {
  title: string;
  value: number;
  accent: string;
  icon: ReactNode;
  detail: string;
};

type ListCardProps<T> = {
  title: string;
  subtitle: string;
  rows: T[];
  emptyText: string;
  renderRow: (row: T) => React.ReactNode;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Tarih bilgisi yok";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tarih bilgisi yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

function MetricCard({ title, value, accent, icon, detail }: MetricCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${accent}22`,
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`,
        color: "common.white",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={700} lineHeight={1.1}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 1.5 }}>
              {detail}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: "rgba(255,255,255,0.18)",
              color: "common.white",
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ListCard<T>({ title, subtitle, rows, emptyText, renderRow }: ListCardProps<T>) {
  return (
    <Card sx={{ height: "100%", borderRadius: 4 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, pb: 2.5 }}>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.75}>
            {subtitle}
          </Typography>
        </Box>
        <Divider />
        {rows.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {emptyText}
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider flexItem />} sx={{ px: 3 }}>
            {rows.map((row, index) => (
              <Box key={index} sx={{ py: 2.25 }}>
                {renderRow(row)}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, xl: 3 }}>
          <Skeleton variant="rounded" height={170} />
        </Grid>
      ))}
      <Grid size={{ xs: 12, xl: 7 }}>
        <Skeleton variant="rounded" height={240} />
      </Grid>
      <Grid size={{ xs: 12, xl: 5 }}>
        <Skeleton variant="rounded" height={240} />
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <Skeleton variant="rounded" height={360} />
      </Grid>
      <Grid size={{ xs: 12, xl: 6 }}>
        <Skeleton variant="rounded" height={360} />
      </Grid>
    </Grid>
  );
}

export default function Dashboard() {
  usePageTitle("Admin Anasayfa");

  const user = useSelector((state: AppState) => state.userReducer);
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    if (!user.token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const data = await getAdminDashboardOverview(user.token);
      setOverview(data);
    } catch (dashboardError: any) {
      setError(dashboardError?.message || "Dashboard verileri alınamadı.");
    } finally {
      setIsLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const denetciSayisi = overview?.denetciSayisi ?? 0;
  const denetlenenSayisi = overview?.denetlenenSayisi ?? 0;

  return (
    <PageContainer title="Admin Anasayfa" description="Admin dashboard">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <Grid container spacing={3}>
          {error ? (
            <Grid size={{ xs: 12 }}>
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={fetchDashboard}>
                    Tekrar Dene
                  </Button>
                }
              >
                {error}
              </Alert>
            </Grid>
          ) : null}

          <Grid size={{ xs: 12 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Chip
                  color="primary"
                  variant="filled"
                  icon={<IconBriefcase size={16} />}
                  label={`${denetciSayisi} denetçi firma`}
                  sx={{ height: 36, fontWeight: 600 }}
                />
                <Chip
                  color="secondary"
                  variant="outlined"
                  icon={<IconBuildingBank size={16} />}
                  label={`${denetlenenSayisi} denetlenen firma`}
                  sx={{ height: 36, fontWeight: 600 }}
                />
              </Stack>
              <Button
                variant="contained"
                startIcon={
                  isLoading ? <CircularProgress size={16} color="inherit" /> : <IconRefresh size={16} />
                }
                onClick={fetchDashboard}
                disabled={isLoading}
                sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
              >
                Yenile
              </Button>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard
              title="Denetçi Sayısı"
              value={overview?.denetciSayisi ?? 0}
              detail={`${overview?.aktifDenetciSayisi ?? 0} aktif, ${overview?.pasifDenetciSayisi ?? 0} pasif firma`}
              accent="#5d87ff"
              icon={<IconBriefcase size={26} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard
              title="Denetlenen Sayısı"
              value={overview?.denetlenenSayisi ?? 0}
              detail={`${overview?.aktifDenetlenenSayisi ?? 0} aktif, ${overview?.pasifDenetlenenSayisi ?? 0} pasif firma`}
              accent="#49beff"
              icon={<IconBuildingBank size={26} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard
              title="Aktif Denetçi"
              value={overview?.aktifDenetciSayisi ?? 0}
              detail="Çalışmaya açık denetçi firmalar"
              accent="#13deb9"
              icon={<IconArrowUpRight size={26} />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
            <MetricCard
              title="Aktif Denetlenen"
              value={overview?.aktifDenetlenenSayisi ?? 0}
              detail="İşlem gören denetlenen şirketler"
              accent="#ffae1f"
              icon={<IconUsers size={26} />}
            />
          </Grid>

          <Grid size={{ xs: 12, xl: 6 }}>
            <ListCard
              title="Son Eklenen 4 Denetçi"
              subtitle="Yeni eklenen veya son kayıt tarihi en güncel firmalar"
              rows={overview?.sonEklenenDenetciler ?? []}
              emptyText="Gösterilecek denetçi kaydı bulunamadı."
              renderRow={(row) => (
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: "primary.light", color: "primary.main", width: 46, height: 46 }}>
                    <IconBriefcase size={22} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {row.firmaAdi || "Firma adı yok"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.4}>
                          {row.firmaUnvani || row.il || "Firma detayı bulunmuyor"}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={row.aktifmi ? "success" : "default"}
                        label={row.aktifmi ? "Aktif" : "Pasif"}
                        sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                      />
                    </Stack>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mt={1.5}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <IconMail size={15} />
                        <Typography variant="body2" color="text.secondary">
                          {row.email || "E-posta bilgisi yok"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <IconPhone size={15} />
                        <Typography variant="body2" color="text.secondary">
                          {row.tel || "Telefon bilgisi yok"}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1.4}>
                      Kayıt tarihi: {formatDate(row.kayitTarihi)}
                    </Typography>
                  </Box>
                </Stack>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, xl: 6 }}>
            <ListCard
              title="Son Eklenen 4 Denetlenen"
              subtitle="En yeni müşteri şirket kayıtları"
              rows={overview?.sonEklenenDenetlenenler ?? []}
              emptyText="Gösterilecek denetlenen kaydı bulunamadı."
              renderRow={(row) => (
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.main", width: 46, height: 46 }}>
                    <IconBuildingBank size={22} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {row.firmaAdi || "Firma adı yok"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.4}>
                          {row.yetkili || row.denetimTuru || "Yetkili bilgisi bulunmuyor"}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={row.aktifmi ? "success" : "default"}
                        label={row.aktifmi ? "Aktif" : "Pasif"}
                        sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                      />
                    </Stack>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mt={1.5}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <IconUserCircle size={15} />
                        <Typography variant="body2" color="text.secondary">
                          {row.yetkili || "Yetkili bilgisi yok"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <IconMail size={15} />
                        <Typography variant="body2" color="text.secondary">
                          {row.email || "E-posta bilgisi yok"}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1.4}>
                      Eklenme tarihi: {formatDate(row.createdAt || row.importedAt)}
                    </Typography>
                  </Box>
                </Stack>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ListCard
              title="Yenileme Dönemi Yaklaşan Denetçiler"
              subtitle="Bitiş tarihi 45 gün içinde olan ödeme ve lisans kayıtları"
              rows={overview?.yaklasanYenilemeler ?? []}
              emptyText="Yaklaşan yenileme kaydı bulunmuyor."
              renderRow={(row) => (
                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", lg: "center" }}
                >
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: "warning.light", color: "warning.main", width: 46, height: 46 }}>
                      <IconBriefcase size={22} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {row.firmaAdi || "Firma adı yok"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={0.4}>
                        Bitiş tarihi: {formatDate(row.bitisTarihi)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.25}
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <Chip
                      color={typeof row.kalanGun === "number" && row.kalanGun <= 15 ? "error" : "warning"}
                      label={
                        typeof row.kalanGun === "number"
                          ? `${row.kalanGun} gün kaldı`
                          : "Tarih bilgisi yok"
                      }
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      variant="outlined"
                      label={`Mevcut firma: ${row.mevcutFirmaSayisi}`}
                    />
                    <Chip
                      variant="outlined"
                      label={`Şirket kotası: ${row.sirketKota}`}
                    />
                  </Stack>
                </Stack>
              )}
            />
          </Grid>
        </Grid>
      )}
    </PageContainer>
  );
}
