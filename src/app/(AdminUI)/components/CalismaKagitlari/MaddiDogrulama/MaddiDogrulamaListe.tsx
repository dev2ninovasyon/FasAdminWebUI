import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useSelector } from "@/store/hooks";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import EkBelgeYukleButton from "@/app/(AdminUI)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";


const allIcons = [
  "/images/svgs/denetim-kanitlari/icon/icons8-accounting-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-banknotes-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-bill-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-billing-machine-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-bitcoin-accepted-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-budget-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-business-report-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-buy-for-cash-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-buy-for-change-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-buy-for-coins-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-buy-with-card-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-card-exchange-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-card-wallet-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-cashbook-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-check-book-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-coin-in-hand-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-coin-wallet-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-collectibles-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-community-grants-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-credit-control-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-debit-card-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-debt-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-deposit-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-ethereum-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-financial-growth-analysis-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-folder-bills-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-foreclosure-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-fund-accounting-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-general-ledger-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-goal-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-hand-with-pen-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-increase-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-investment-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-invoice-50-2.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-invoice-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-ledger-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-logbook-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-magnetic-card-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-management-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-market-share-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-merchant-account-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-money-box-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-positive-dynamic-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-profit-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-receive-cash-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-refund-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-related-companies-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-rental-house-contract-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-safe-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-safe-ok-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-shopping-cart-with-money-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-split-transaction-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-study-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-tasks-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-to-do-list-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-topup-payment-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-transaction-50-2.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-transaction-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-turkish-lira-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-us-dollar-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-wallet-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-web-analytics-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-withdrawal-50.png",
  "/images/svgs/denetim-kanitlari/icon/icons8-world-markets-50.png",
];

function getIconForCategory(index: number): string {
  return allIcons[index % allIcons.length];
}

function getColorForCategory(categoryName: string): string {
  const colors = ["error", "success", "info"];
  const index = categoryName.length % colors.length;
  return colors[index];
}

interface CalismaKagidiProps {
  parentName?: string;
  onViewModeChange?: (mode: "list" | "card") => void;
}

interface DenetimDosyaBelgeleriDto {
  id: number;
  name: string;
  children?: DenetimDosyaBelgeleriDto[];
}

const StatusIcon: React.FC<{ status: boolean }> = ({ status }) => {
  return status ? (
    <CheckCircleIcon color="success" />
  ) : (
    <CheckCircleIcon color="disabled" />
  );
};

const MaddiDogrulamaListe: React.FC<CalismaKagidiProps> = ({ parentName, onViewModeChange }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const [openedGroupIndex, setOpenGroupIndex] = useState<number | null>(null);
  const [calismaKagidiVerileri, setCalismaKagidiVerileri] = useState<DenetimDosyaBelgeleriDto[]>([]);

  // Görünümü localStorage'dan oku, yoksa "list" varsayılan yap
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  const router = useRouter();
  const { setLoading } = useLoading();

  // İlk açılışta localStorage kontrolü
  useEffect(() => {
    const savedMode = localStorage.getItem("maddiDogrulamaViewMode") as "list" | "card";
    if (savedMode) {
      setViewMode(savedMode);
      onViewModeChange?.(savedMode);
    } else {
      onViewModeChange?.(viewMode);
    }
  }, []);

  // Görünüm değiştiğinde localStorage'a kaydet ve parent'a bildir
  const handleToggleView = () => {
    const newMode = viewMode === "list" ? "card" : "list";
    setViewMode(newMode);
    localStorage.setItem("maddiDogrulamaViewMode", newMode);
    onViewModeChange?.(newMode);
  };

  const removeTurkishChars = (str: string | undefined | null) => {
    if (!str) return "";
    return str
      .replace(/\s/g, "")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
      .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c")
      .replace(/İ/g, "I").replace(/Ö/g, "O").replace(/Ü/g, "U")
      .replace(/Ş/g, "S").replace(/Ğ/g, "G").replace(/Ç/g, "C");
  };

  const handleChildClick = (parentId: string, childId: string) => {
    const cleanParentId = removeTurkishChars(parentId);
    const cleanChildId = removeTurkishChars(childId);
    setLoading(true);
    router.push(`/DenetimKanitlari/MaddiDogrulamaProsedurleri/${cleanParentId}/${cleanChildId}?title=${encodeURIComponent(childId)}`);
  };

  const handleOpenGroup = (index: number) => {
    setOpenGroupIndex(openedGroupIndex === index ? null : index);
  };

  const fetchData = async () => {
    try {
      const data = await getMaddiDogrulama(user.denetimTuru || "",
        user.denetlenenId || 0,
        user.yil || 0
      );

      if (parentName) {
        const filtered = data?.filter((item: any) => removeTurkishChars(item.name) === parentName);
        setCalismaKagidiVerileri(filtered || []);
        if (filtered && filtered.length > 0) {
          setOpenGroupIndex(0);
        }
      } else {
        setCalismaKagidiVerileri(data || []);
      }
    } catch (error) {
      console.log("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [parentName]);

  const displayData = parentName && calismaKagidiVerileri[0]?.children
    ? calismaKagidiVerileri[0].children
    : calismaKagidiVerileri;

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "end", paddingBottom: viewMode === "list" ? "32px" : "0px", paddingRight: "10px" }}>
        <Button onClick={handleToggleView}>
          {viewMode === "list" ? <IconLayoutGrid size={24} /> : <IconList size={24} />}
        </Button>
      </Box>
      {viewMode === "card" ? (
        <Grid container spacing={3} mt={1}>
          {displayData.map((item, index) => {
            const bgcolor = getColorForCategory(item.name);
            const icon = getIconForCategory(index);
            const targetPath = parentName
              ? `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${parentName}/${removeTurkishChars(item.name)}?title=${encodeURIComponent(item.name)}`
              : `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(item.name)}?title=${encodeURIComponent(item.name)}`;

            return (
              <Grid
                key={item.id}
                size={{
                  xs: 12,
                  sm: 4,
                  lg: 3
                }}>
                <Link href={targetPath} passHref onClick={() => setLoading(true)} style={{ textDecoration: 'none' }}>
                  <Box bgcolor={bgcolor + ".light"} textAlign="center" sx={{ borderRadius: "8px", cursor: "pointer" }}>
                    <CardContent style={{ height: "180px", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Image src={icon} alt={"icon"} width="50" height="50" />
                      <Typography color={bgcolor + ".main"} mt={1} variant="subtitle1" fontWeight={600}>
                        {item.name}
                      </Typography>
                    </CardContent>
                  </Box>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Grid container spacing={3} mt={1}>
          {calismaKagidiVerileri.map((parent, index) => (
            <Grid
              key={parent.id}
              size={{
                lg: 12,
                xs: 12
              }}>
              <Card sx={{ padding: 0, width: "100%", maxHeight: 500, overflow: "auto", mt: "20px", bgcolor: "primary.light", borderRadius: 0, border: `1px solid ${theme.palette.divider}` }}>
                <CardHeader
                  title={parent.name}
                  sx={{ cursor: "pointer", position: "sticky", top: 0, zIndex: "1", bgcolor: "primary.light" }}
                  onClick={() => handleOpenGroup(index)}
                  action={
                    <IconButton aria-label="expand row" size="medium" onClick={(e) => { e.stopPropagation(); handleOpenGroup(index); }}>
                      {openedGroupIndex === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  }
                />
                <Collapse in={openedGroupIndex === index} timeout="auto" unmountOnExit>
                  <Divider />
                  <CardContent>
                    <Grid container mb={2} spacing={2} justifyContent="center">
                      <Grid
                        display="flex"
                        justifyContent={"center"}
                        size={{
                          xs: 12,
                          sm: 6
                        }}>
                        <Box sx={{ width: "100%", maxWidth: 400 }}>
                          <EkBelgeYukleButton
                            formKodu={parent.name}
                            text="Belge Yükle"
                            fullWidth={true}
                            buttonVariant="contained"
                            color="primary"
                          />
                        </Box>
                      </Grid>
                      <Grid
                        display="flex"
                        justifyContent={"center"}
                        size={{
                          xs: 12,
                          sm: 6
                        }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          sx={{ maxWidth: 400, textTransform: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLoading(true);
                            router.push(`/DenetimKanitlari/MaddiDogrulamaProsedurleri/CalismaKagidiRaporu?parentName=${parent.name}`);
                          }}
                        >
                          Çalışma Kağıdı Oluştur
                        </Button>
                      </Grid>
                    </Grid>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Belge Adı</TableCell>
                          <TableCell align="center">Hazırlandı</TableCell>
                          <TableCell align="center">Onaylandı</TableCell>
                          <TableCell align="center">Kalite Kontrol</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parent.children?.map((child) => (
                          <Tooltip title="Belgeye Git" followCursor placement="top" key={child.id}>
                            <TableRow
                              onClick={() => handleChildClick(parent.name, child.name)}
                              sx={{ cursor: "pointer", transition: "background-color 0.3s", "&:hover": { backgroundColor: customizer.activeMode === "dark" ? "#333" : "#ddd" } }}
                            >
                              <TableCell><Typography variant="body1">{child.name}</Typography></TableCell>
                              <TableCell align="center"><StatusIcon status={true} /></TableCell>
                              <TableCell align="center"><StatusIcon status={false} /></TableCell>
                              <TableCell align="center"><StatusIcon status={true} /></TableCell>
                            </TableRow>
                          </Tooltip>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default MaddiDogrulamaListe;


