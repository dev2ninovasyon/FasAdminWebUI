import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { getDonusumKayitlari, DonusumKayitlariKontrolSatirDto, DonusumBobiFisDto, DonusumKayitlariResponse } from "@/api/CalismaKagitlari/DonusumKayitlariKontrol";

interface DonusumKayitlariProps {
    controller: string;
    dipnotNo: string;
    isReport?: boolean;
}

const fmt = (n: any) =>
    Number(n ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DonusumKayitlariKontrol: React.FC<DonusumKayitlariProps> = ({
    controller,
    dipnotNo,
    isReport,
}) => {
    const theme = useTheme();
    const user = useSelector((state: AppState) => state.userReducer);
    const [veriler, setVeriler] = useState<DonusumKayitlariResponse[]>([]);
    const [anaHesaplar, setAnaHesaplar] = useState<DonusumKayitlariKontrolSatirDto[]>([]);
    const [donusumFisleri, setDonusumFisleri] = useState<DonusumBobiFisDto[]>([]);
    const [loading, setLoading] = useState(false);

    // Colors
    // Header blue from image: approx #2196F3 or similar light blue
    const HEADER_BG = theme.palette.primary.main;
    const ZEBRA_ROW = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#F9FAFB";
    const BG_PAPER = theme.palette.mode === 'dark' ? theme.palette.grey[900] : "#FFFFFF";
    const TEXT_COLOR = theme.palette.mode === 'dark' ? "#FFFFFF" : "#000000";
    const BORDER_COLOR = theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0';

    const [resolvedDipnotNo, setResolvedDipnotNo] = useState(dipnotNo);

    useEffect(() => {
        setResolvedDipnotNo(dipnotNo);
    }, [dipnotNo]);

    useEffect(() => {
        const resolveDipnot = async () => {
            if (!dipnotNo && controller) {
                try {
                    const { getDipnotNoByDipnotAdi } = await import("@/api/MaddiDogrulama/MaddiDogrulama");
                    const dNo = await getDipnotNoByDipnotAdi(user.denetciId || 0,
                        user.denetlenenId || 0,
                        user.yil || 0,
                        controller,
                        user.denetimTuru === "Tfrs"
                    );
                    if (dNo) setResolvedDipnotNo(dNo);
                } catch (error) {
                    console.error("Dipnot no getirilemedi:", error);
                }
            }
        };
        resolveDipnot();
    }, [dipnotNo, controller, user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!resolvedDipnotNo) return;
            setLoading(true);
            try {
                const res = await getDonusumKayitlari(
                    controller,
                    user.denetciId || 0,
                    user.denetlenenId || 0,
                    user.yil || 0,
                    resolvedDipnotNo
                );
                if (res) {
                    setAnaHesaplar(res.kayitlar);
                    setDonusumFisleri(res.donusumFisler);
                }
            } catch (error) {
                console.log("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [controller, resolvedDipnotNo, user.token, user.denetciId, user.denetlenenId, user.yil]);

    const hasData = useMemo(() => {
        const hasAna = anaHesaplar.some(row => (row.vukBakiye ?? 0) !== 0 || (row.donusumBakiye ?? 0) !== 0 || (row.fark ?? 0) !== 0);
        const hasFis = donusumFisleri.some(row => (row.borc ?? 0) !== 0 || (row.alacak ?? 0) !== 0);
        return hasAna || hasFis;
    }, [anaHesaplar, donusumFisleri]);

    if (!loading && !hasData && isReport) return null;

    const renderAnaHesaplarTable = () => {

        return (
            <Box mb={4}>
                <Box sx={{ backgroundColor: HEADER_BG, px: 2, py: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} color="white">
                        Ana Hesaplar
                    </Typography>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}` }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: HEADER_BG }}>
                                <TableCell sx={{ fontWeight: 700, color: "white" }}>Hesap No</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "right", color: "white" }}>VUK Bakiye</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "right", color: "white" }}>Dönüşüm Bakiye</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: "right", color: "white" }}>Fark</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {anaHesaplar
                                .filter(row => (row.vukBakiye ?? 0) !== 0 || (row.donusumBakiye ?? 0) !== 0 || (row.fark ?? 0) !== 0)
                                .map((row, idx) => (
                                    <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                        <TableCell sx={{ color: TEXT_COLOR }}>{row.kebirKodu}</TableCell>
                                        <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.vukBakiye)}</TableCell>
                                        <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.donusumBakiye)}</TableCell>
                                        <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.fark)}</TableCell>
                                    </TableRow>
                                ))}
                            {anaHesaplar.filter(row => (row.vukBakiye ?? 0) !== 0 || (row.donusumBakiye ?? 0) !== 0 || (row.fark ?? 0) !== 0).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ color: TEXT_COLOR }}>Veri bulunamadı</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        )
    };

    const renderDonusumFisleriTable = () => (
        <Box mb={4}>
            <Box sx={{ backgroundColor: HEADER_BG, px: 2, py: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} color="white">
                    Dönüşüm Fişleri
                </Typography>
            </Box>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: `1px solid ${BORDER_COLOR}` }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: HEADER_BG }}>
                            <TableCell sx={{ fontWeight: 700, color: "white" }}>Hesap No</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "white" }}>Yevmiye No</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "white" }}>Hesap Adı</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: "right", color: "white" }}>Borç</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: "right", color: "white" }}>Alacak</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: "white" }}>Açıklama</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {donusumFisleri
                            .filter(row => (row.borc ?? 0) !== 0 || (row.alacak ?? 0) !== 0)
                            .map((row, idx) => (
                                <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? BG_PAPER : ZEBRA_ROW }}>
                                    <TableCell sx={{ color: TEXT_COLOR }}>{row.hesapKodu}</TableCell>
                                    <TableCell sx={{ color: TEXT_COLOR }}>{row.yevmiyeNo}</TableCell>
                                    <TableCell sx={{ color: TEXT_COLOR }}>{row.hesapAdi}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.borc)}</TableCell>
                                    <TableCell align="right" sx={{ color: TEXT_COLOR }}>{fmt(row.alacak)}</TableCell>
                                    <TableCell sx={{ color: TEXT_COLOR }}>{row.aciklama}</TableCell>
                                </TableRow>
                            ))}
                        {donusumFisleri.filter(row => (row.borc ?? 0) !== 0 || (row.alacak ?? 0) !== 0).length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ color: TEXT_COLOR }}>Veri bulunamadı</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Grid container>
            <Grid size={12}>
                <Box px={isReport ? 0 : 3} pt={isReport ? 0 : 3} pb={isReport ? 0 : 5} sx={{ width: "100%", margin: "0 auto" }}>
                    <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? "#FFFFFF" : "#2C3E50", fontWeight: "bold", mb: 3 }}>
                        Dönüşüm Kayıtları Kontrol
                    </Typography>
                    {renderAnaHesaplarTable()}
                    {renderDonusumFisleriTable()}
                </Box>
            </Grid>
        </Grid>
    );
};

export default DonusumKayitlariKontrol;


