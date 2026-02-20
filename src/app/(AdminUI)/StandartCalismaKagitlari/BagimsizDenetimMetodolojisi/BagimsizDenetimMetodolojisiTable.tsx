import React, { useEffect, useState, useCallback } from "react";
import {
    TableContainer,
    Table,
    TableRow,
    TableCell,
    TableBody,
    TableHead,
    Typography,
    useTheme,
    Stack,
    Box,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getDenetimDosya } from "@/api/DenetimDosya";
import {
    getEkBelgeler,
    downloadEkBelge,
    EkBelgeDto,
} from "@/api/CalismaKagitlari/CalismaKagitlariEkBelge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";

interface Veri {
    id: number;
    parentId?: number;
    name: string;
    bds?: string;
    code?: string;
    url?: string;
    reference?: string;
    archiveFileName?: string;
    children: Veri[];
}

const BagimsizDenetimMetodolojisiTable = () => {
    const [rows, setRows] = useState<Veri[]>([]);

    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const theme = useTheme();

    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const [denetimTuru, setDenetimTuru] = useState<string>("Tfrs");

    // EkBelge durum haritasi: formKodu -> EkBelgeDto[]
    const [ekBelgeDurumMap, setEkBelgeDurumMap] = useState<
        Record<string, EkBelgeDto[]>
    >({});
    const [durumLoading, setDurumLoading] = useState(false);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogBelgeler, setDialogBelgeler] = useState<EkBelgeDto[]>([]);
    const [dialogTitle, setDialogTitle] = useState("");
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    // Açilir/kapanir state: kapali olan parent id'leri
    const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());

    function normalizeString(str: string): string {
        const turkishChars: { [key: string]: string } = {
            "\u00E7": "c",
            "\u011F": "g",
            "\u0131": "i",
            "\u00F6": "o",
            "\u015F": "s",
            "\u00FC": "u",
            "\u00C7": "C",
            "\u011E": "G",
            "\u0130": "I",
            "\u00D6": "O",
            "\u015E": "S",
            "\u00DC": "U"
        };

        let normalized = str.replace(
            /[\u00E7\u011F\u0131\u00F6\u015F\u00FC\u00C7\u011E\u0130\u00D6\u015E\u00DC]/g,
            (match) => turkishChars[match] || match
        );

        normalized = normalized.replace(/\s+/g, "");
        return normalized.toLowerCase();
    }

    // Açilir/kapanir toggle
    const toggleCollapse = (id: number) => {
        setCollapsedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // recursive sekilde children'lari düz liste haline getirelim
    // collapsedIds'deki parent'larin children'larini atla
    const flattenData = (
        data: Veri[],
        level = 0,
        isMaddiDogrulamaChild = false
    ): (Veri & { level: number; isForcedLeaf?: boolean })[] => {
        return data.flatMap((item) => {
            const isMaddiDogrulamaRoot = item.id === 166 || (level === 0 && normalizeString(item.name).includes("maddidogrulamaprosdurleri"));
            const isMaddiDogrulamaLevel1 = isMaddiDogrulamaChild && level === 1;

            return [
                { ...item, level, isForcedLeaf: isMaddiDogrulamaLevel1 },
                ...(collapsedIds.has(item.id) || isMaddiDogrulamaLevel1
                    ? []
                    : flattenData(
                        item.children || [],
                        level + 1,
                        isMaddiDogrulamaChild || isMaddiDogrulamaRoot
                    )),
            ];
        });
    };

    // Tüm formKodu'lari topla (recursive)
    const collectFormKodlari = useCallback((data: Veri[]): string[] => {
        const kodlar: string[] = [];
        const traverse = (items: Veri[]) => {
            for (const item of items) {
                if (item.code) {
                    kodlar.push(item.code);
                }
                if (item.children && item.children.length > 0) {
                    traverse(item.children);
                }
            }
        };
        traverse(data);
        return kodlar;
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getDenetimDosya(denetimTuru || "", user.token || "");
            if (data) {
                const filteredData = data.filter((item: any) =>
                    normalizeString(item.name).includes("denetimkanitlari")
                );
                setRows(filteredData);
            } else {
                setRows([]);
            }
            setLoading(false);

            // EkBelge durumlarini kontrol et
            if (data && user.denetciId && user.denetlenenId && user.yil) {
                setDurumLoading(true);
                const formKodlari = collectFormKodlari(data);
                const map: Record<string, EkBelgeDto[]> = {};

                // Paralel istekler (batch halinde)
                const batchSize = 10;
                for (let i = 0; i < formKodlari.length; i += batchSize) {
                    const batch = formKodlari.slice(i, i + batchSize);
                    const results = await Promise.all(
                        batch.map(async (formKodu) => {
                            try {
                                const belgeler = await getEkBelgeler(
                                    user.denetciId!,
                                    user.denetlenenId!,
                                    user.yil!,
                                    formKodu
                                );
                                return { formKodu, belgeler };
                            } catch {
                                return { formKodu, belgeler: [] };
                            }
                        })
                    );
                    for (const { formKodu, belgeler } of results) {
                        map[formKodu] = belgeler;
                    }
                }

                setEkBelgeDurumMap(map);
                setDurumLoading(false);
            }
        } catch (error) {
            console.log("An error occurred:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [denetimTuru]);

    const handleDurumClick = (formKodu: string, belgeAdi: string) => {
        const belgeler = ekBelgeDurumMap[formKodu] || [];
        setDialogBelgeler(belgeler);
        setDialogTitle(belgeAdi);
        setDialogOpen(true);
    };

    const handleDownload = async (belge: EkBelgeDto) => {
        try {
            setDownloadingId(belge.id);
            const { blob, fileName } = await downloadEkBelge(belge.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName || belge.orijinalDosyaAdi;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log("İndirme hatasi:", error);
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredRows = flattenData(rows).filter((row) =>
        normalizeString(row.name).includes(normalizeString(searchTerm))
    );

    return (
        <>
            <Stack direction="row" spacing={2} marginBottom={2}>
                <Button
                    variant={denetimTuru === "Tfrs" ? "contained" : "outlined"}
                    onClick={() => setDenetimTuru("Tfrs")}
                >
                    TFRS
                </Button>
                <Button
                    variant={denetimTuru === "Bobi" ? "contained" : "outlined"}
                    onClick={() => setDenetimTuru("Bobi")}
                >
                    BOBİ
                </Button>
            </Stack>
            <Stack direction="row" alignItems="center" marginBottom={2}>
                <Box width={"100%"}>
                    <Typography variant="h6">Denetim Dosya Listesi ({denetimTuru})</Typography>
                </Box>
                <TextField
                    placeholder="Arama"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                />
            </Stack>
            <TableContainer
                sx={{
                    mt: 0.5,
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "none",
                }}
            >
                <Table stickyHeader aria-label="sticky table" size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    width: "45%",
                                    backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                                    borderBottom: `2px solid ${theme.palette.divider}`,
                                    px: 0
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="700" sx={{ pl: 2.5 }}>
                                    Belge Adi
                                </Typography>
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                                    borderBottom: `2px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="700" textAlign="center">
                                    Referans No
                                </Typography>
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                                    borderBottom: `2px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="700" textAlign="center">
                                    BDS No
                                </Typography>
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                                    borderBottom: `2px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="700" textAlign="center">
                                    Arşiv
                                </Typography>
                            </TableCell>
                            <TableCell
                                sx={{
                                    width: "8%",
                                    backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                                    borderBottom: `2px solid ${theme.palette.divider}`,
                                }}
                            >
                               
                            </TableCell>
                            <TableCell
                                sx={{
                                    backgroundColor: customizer.activeMode === "dark" ? "#1a1e28" : "#f5f7f9",
                                    borderBottom: `2px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="700" textAlign="center">
                                    Link
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ width: "100%" }}>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    align="center"
                                    sx={{ py: 8 }}
                                >
                                    <CircularProgress size={40} thickness={4} />
                                    <Typography variant="body2" sx={{ mt: 2 }}>
                                        Veriler yükleniyor...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRows.map((row, index) => {
                                const isParent = row.parentId == null;
                                const hasChildren =
                                    row.children && row.children.length > 0 && !row.isForcedLeaf;
                                const hasFormKodu = !!row.code;
                                const isLeaf = !hasChildren && hasFormKodu;
                                const isCollapsible = (isParent || hasChildren) && !row.isForcedLeaf;
                                const isCollapsed = collapsedIds.has(row.id);

                                // Durum kontrolü
                                const ekBelgeler = row.code
                                    ? ekBelgeDurumMap[row.code] || []
                                    : [];
                                const hasEkBelge = ekBelgeler.length > 0;

                                return (
                                    <TableRow
                                        key={index}
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        style={{
                                            backgroundColor: isParent
                                                ? customizer.activeMode === "dark"
                                                    ? "#1c222d"
                                                    : "#f1f3f5"
                                                : hasChildren
                                                    ? customizer.activeMode === "dark"
                                                        ? "#232a37"
                                                        : "#f8f9fa"
                                                    : "transparent",
                                            cursor: isCollapsible ? "pointer" : "default",
                                        }}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: customizer.activeMode === "dark"
                                                    ? "rgba(255, 255, 255, 0.05) !important"
                                                    : "rgba(0, 0, 0, 0.04) !important",
                                            }
                                        }}
                                        onClick={
                                            isCollapsible
                                                ? () => toggleCollapse(row.id)
                                                : undefined
                                        }
                                    >
                                        <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0 }}>
                                            <Stack
                                                direction="row"
                                                alignItems="flex-start"
                                                sx={{ pl: row.level * 2 }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: 28,
                                                        minWidth: 28,
                                                        mt: 0.1,
                                                        mr: 0.5
                                                    }}
                                                >
                                                    {isCollapsible && (
                                                        <IconButton
                                                            size="small"
                                                            sx={{
                                                                p: 0.2,
                                                                color: theme.palette.text.secondary,
                                                                "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" }
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleCollapse(row.id);
                                                            }}
                                                        >
                                                            {isCollapsed ? (
                                                                <ChevronRightIcon sx={{ fontSize: '1.3rem' }} />
                                                            ) : (
                                                                <ExpandMoreIcon sx={{ fontSize: '1.3rem' }} />
                                                            )}
                                                        </IconButton>
                                                    )}
                                                </Box>
                                                <Tooltip
                                                    title={row.name.length > 70 ? row.name : ""}
                                                    placement="top-start"
                                                    enterDelay={500}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="textPrimary"
                                                        textAlign={"left"}
                                                        fontWeight={isParent || hasChildren ? "600" : "400"}
                                                        sx={{
                                                            fontSize: isParent ? "0.875rem" : "0.825rem",
                                                            lineHeight: 1.3,
                                                            flex: 1,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: isParent ? 1 : 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            wordBreak: 'break-word',
                                                            mt: 0.15
                                                        }}
                                                    >
                                                        {row.name}
                                                    </Typography>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                textAlign={"center"}
                                                sx={{ fontSize: "0.8rem" }}
                                            >
                                                {row.reference &&
                                                    `${row.archiveFileName}${row.reference}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                textAlign={"center"}
                                                sx={{ fontSize: "0.8rem" }}
                                            >
                                                {row.bds}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                textAlign={"center"}
                                                sx={{ fontSize: "0.8rem" }}
                                            >
                                                {row.archiveFileName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                                      
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", borderBottom: `1px solid ${theme.palette.divider}`, py: 0.75, px: 0.5 }}>
                                            {row.url && (
                                                <Link href={row.url || ""} onClick={(e) => e.stopPropagation()}>
                                                    <IconButton size="small" color="primary" sx={{ p: 0.1 }}>
                                                        <ArrowCircleRightIcon sx={{ fontSize: '1.3rem' }} />
                                                    </IconButton>
                                                </Link>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Yüklenen Belgeler Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h5">Yüklenen Belgeler</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {dialogTitle}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    {dialogBelgeler.length === 0 ? (
                        <Box p={3}>
                            <Typography variant="body2" color="textSecondary">
                                Yüklenmis belge bulunamadi.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Dosya Adi</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} width={150}>Yükleme Tarihi</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} width={80} align="center">İslem</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dialogBelgeler.map((belge) => (
                                        <TableRow key={belge.id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <InsertDriveFileIcon color="primary" fontSize="small" />
                                                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                                                        {belge.orijinalDosyaAdi}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {belge.yuklemeTarihi
                                                        ? new Date(belge.yuklemeTarihi).toLocaleDateString("tr-TR")
                                                        : "-"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="İndir">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDownload(belge)}
                                                        disabled={downloadingId === belge.id}
                                                    >
                                                        {downloadingId === belge.id ? (
                                                            <CircularProgress size={20} />
                                                        ) : (
                                                            <DownloadIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary">
                        Kapat
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BagimsizDenetimMetodolojisiTable;

