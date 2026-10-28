"use client";

// src/app/(AdminUI)/components/CalismaKagitlari/MaddiDogrulamaEkBelgeYukleButton.tsx

import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from "react";
import {
    Button,
    Typography,
    useTheme,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Grid,
    Paper,
    IconButton,
    Checkbox,
    TextField,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
    EkBelgeDto,
    getMaddiDogrulamaEkBelgeler,
    uploadMaddiDogrulamaEkBelge,
    deleteEkBelgelerSecilenler,
    downloadEkBelge,
} from "@/api/CalismaKagitlari/CalismaKagitlariEkBelge";
import jsPDF from "jspdf";

interface MaddiDogrulamaEkBelgeYukleButtonProps {
    belgeAdi: string;
    text?: string;
    fullWidth?: boolean;
    onUploaded?: () => void;
    hideButton?: boolean;
    variant?: 'button' | 'menuitem';
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
    buttonVariant?: 'contained' | 'outlined' | 'text';
    sx?: any;
}

export interface MaddiDogrulamaEkBelgeYukleButtonRef {
    handleOpen: () => void;
}

const MaddiDogrulamaEkBelgeYukleButton = forwardRef<MaddiDogrulamaEkBelgeYukleButtonRef, MaddiDogrulamaEkBelgeYukleButtonProps>(({
    belgeAdi,
    text = "Belge Yükle",
    fullWidth = true,
    onUploaded,
    hideButton = false,
    variant = 'button',
    color = 'primary',
    buttonVariant = 'outlined',
    sx,
}, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [ekBelgeler, setEkBelgeler] = useState<EkBelgeDto[]>([]);
    const [open, setOpen] = useState(false);

    // PDF önizleme için:
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFileName, setPreviewFileName] = useState<string>("");

    // Seçerek silme için:
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeletingSelected, setIsDeletingSelected] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Drag & drop highlight
    const [isDragging, setIsDragging] = useState(false);

    // Arama + sayfalama
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const theme = useTheme();
    const borderColor = theme.palette.divider;

    const isPdfBelge = (belge: EkBelgeDto) => {
        const contentType = belge.contentType?.toLowerCase() || "";
        const name = (belge.orijinalDosyaAdi || "").toLowerCase();
        return contentType.includes("pdf") || name.endsWith(".pdf");
    };

    const canLoad =
        !!user.token && !!user.denetciId && !!user.denetlenenId && !!user.yil;

    const isAllSelected =
        ekBelgeler.length > 0 && selectedIds.length === ekBelgeler.length;

    // Filtrelenmiş liste (arama)
    const filteredBelgeler = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return ekBelgeler;
        return ekBelgeler.filter((b) =>
            (b.orijinalDosyaAdi || "").toLowerCase().includes(term)
        );
    }, [ekBelgeler, searchTerm]);

    // Sayfalı liste
    const pagedBelgeler = useMemo(() => {
        const start = page * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredBelgeler.slice(start, end);
    }, [filteredBelgeler, page, rowsPerPage]);

    const loadEkBelgeler = async () => {
        if (!canLoad) return;

        try {
            setIsLoadingList(true);
            const list = await getMaddiDogrulamaEkBelgeler(user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                belgeAdi
            );
            setEkBelgeler(list || []);
            setSelectedIds([]);
            setPage(0);
        } catch (error) {
            console.log("Ek belgeler alınırken hata oluştu:", error);
            setEkBelgeler([]);
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleOpen = async () => {
        setOpen(true);
        await loadEkBelgeler();
    };

    const handleClose = () => {
        setOpen(false);
    };

    useImperativeHandle(ref, () => ({
        handleOpen
    }));

    const handleClickUploadButton = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.click();
        }
    };

    // PNG dosyasını tek sayfalık PDF'e çevirir
    const convertPngToPdf = async (file: File): Promise<File> => {
        return new Promise<File>(async (resolve, reject) => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const blobUrl = URL.createObjectURL(new Blob([arrayBuffer]));
                const img = new Image();
                img.src = blobUrl;
                img.onload = () => {
                    try {
                        const pdf = new jsPDF({
                            orientation: img.width > img.height ? "l" : "p",
                            unit: "pt",
                            format: [img.width, img.height],
                        });

                        pdf.addImage(img, "PNG", 0, 0, img.width, img.height);
                        const pdfBlob = pdf.output("blob");
                        URL.revokeObjectURL(blobUrl);

                        const pdfFile = new File(
                            [pdfBlob],
                            file.name.replace(/\.png$/i, ".pdf"),
                            { type: "application/pdf" }
                        );

                        resolve(pdfFile);
                    } catch (err) {
                        URL.revokeObjectURL(blobUrl);
                        reject(err);
                    }
                };
                img.onerror = (e) => {
                    URL.revokeObjectURL(blobUrl);
                    reject(e);
                };
            } catch (err) {
                reject(err);
            }
        });
    };

    // Ortak dosya işleme fonksiyonu (input + drag&drop)
    const handleFiles = async (files: FileList | File[] | null) => {
        if (!files || (files as FileList).length === 0) return;

        if (!canLoad) {
            enqueueSnackbar(
                "Kullanıcı veya denetim bilgileri eksik. Lütfen sayfayı yenileyin.",
                {
                    variant: "warning",
                    autoHideDuration: 5000,
                    style: {
                        backgroundColor:
                            customizer.activeMode === "dark"
                                ? theme.palette.warning.dark
                                : theme.palette.warning.main,
                    },
                }
            );
            return;
        }

        const allFiles = Array.from(files as FileList);

        const allowedExtensions = [
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "xlsm",
            "png",
        ];

        const invalidFiles: string[] = [];
        const candidateFiles: File[] = [];

        for (const file of allFiles) {
            const ext = file.name.split(".").pop()?.toLowerCase() || "";
            if (!allowedExtensions.includes(ext)) {
                invalidFiles.push(file.name);
            } else {
                candidateFiles.push(file);
            }
        }

        if (invalidFiles.length > 0) {
            enqueueSnackbar(
                `Sadece PDF, Word (doc/docx), Excel (xls/xlsx/xlsm) ve PNG dosyaları yüklenebilir. Geçersiz dosyalar: ${invalidFiles.join(
                    ", "
                )}`,
                {
                    variant: "error",
                    autoHideDuration: 7000,
                    style: {
                        backgroundColor:
                            customizer.activeMode === "dark"
                                ? theme.palette.error.dark
                                : theme.palette.error.main,
                    },
                }
            );
            return;
        }

        if (candidateFiles.length === 0) {
            enqueueSnackbar("Yüklenecek uygun dosya bulunamadı.", {
                variant: "info",
                autoHideDuration: 4000,
            });
            return;
        }

        // PNG'leri PDF'e çevir
        const processedFiles: File[] = [];
        try {
            for (const file of candidateFiles) {
                const ext = file.name.split(".").pop()?.toLowerCase() || "";
                if (ext === "png") {
                    const pdfFile = await convertPngToPdf(file);
                    processedFiles.push(pdfFile);
                } else {
                    processedFiles.push(file);
                }
            }
        } catch (err) {
            console.log("PNG dosyası PDF'e dönüştürülürken hata oluştu:", err);
            enqueueSnackbar(
                "PNG dosyası PDF'e dönüştürülürken bir hata oluştu. Lütfen tekrar deneyin.",
                {
                    variant: "error",
                    autoHideDuration: 5000,
                    style: {
                        backgroundColor:
                            customizer.activeMode === "dark"
                                ? theme.palette.error.dark
                                : theme.palette.error.main,
                    },
                }
            );
            return;
        }

        const formData = new FormData();
        processedFiles.forEach((file) => {
            formData.append("files", file);
        });

        formData.append("BelgeAdi", belgeAdi);
        formData.append("DenetciId", String(user.denetciId));
        formData.append("DenetlenenId", String(user.denetlenenId));
        formData.append("Yil", String(user.yil));
        formData.append("IsMaddiDogrulama", "true");

        try {
            setIsUploading(true);

            const result = await uploadMaddiDogrulamaEkBelge(formData);

            if (result === true || (typeof result === "object" && result?.success)) {
                enqueueSnackbar("Ek belge(ler) başarıyla yüklendi.", {
                    variant: "success",
                    autoHideDuration: 5000,
                    style: {
                        backgroundColor:
                            customizer.activeMode === "dark"
                                ? theme.palette.success.light
                                : theme.palette.success.main,
                    },
                });

                await loadEkBelgeler();
                if (onUploaded) onUploaded();
            } else {
                enqueueSnackbar(
                    (typeof result === "object" &&
                        (result.message || (result as any).error)) ||
                    "Ek belgeler yüklenirken bir hata oluştu.",
                    {
                        variant: "error",
                        autoHideDuration: 5000,
                        style: {
                            backgroundColor:
                                customizer.activeMode === "dark"
                                    ? theme.palette.error.dark
                                    : theme.palette.error.main,
                        },
                    }
                );
            }
        } catch (error) {
            console.log("Ek belge yüklenirken hata oluştu:", error);
            enqueueSnackbar("Ek belgeler yüklenirken beklenmeyen bir hata oluştu.", {
                variant: "error",
                autoHideDuration: 5000,
                style: {
                    backgroundColor:
                        customizer.activeMode === "dark"
                            ? theme.palette.error.dark
                            : theme.palette.error.main,
                },
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        await handleFiles(files);
    };

    const handleDownload = async (belge: EkBelgeDto) => {
        if (!user.token) return;

        try {
            const { blob, fileName } = await downloadEkBelge(belge.id
            );
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName || belge.orijinalDosyaAdi || "ek_belge";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.log("Ek belge indirilirken hata:", error);
            enqueueSnackbar("Ek belge indirilirken bir hata oluştu.", {
                variant: "error",
                autoHideDuration: 5000,
                style: {
                    backgroundColor:
                        customizer.activeMode === "dark"
                            ? theme.palette.error.dark
                            : theme.palette.error.main,
                },
            });
        }
    };

    const handleView = async (belge: EkBelgeDto) => {
        if (!user.token) return;

        try {
            const { blob } = await downloadEkBelge(belge.id);

            const isPdf = isPdfBelge(belge);


            const url = window.URL.createObjectURL(blob);

            if (isPdf) {
                setPreviewUrl(url);
                setPreviewFileName(belge.orijinalDosyaAdi || "ek_belge.pdf");
                setPreviewOpen(true);
            } else {
                const a = document.createElement("a");
                a.href = url;
                a.download = belge.orijinalDosyaAdi || "ek_belge";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.log("Ek belge görüntülenirken hata:", error);
            enqueueSnackbar("Ek belge görüntülenirken bir hata oluştu.", {
                variant: "error",
                autoHideDuration: 5000,
                style: {
                    backgroundColor:
                        customizer.activeMode === "dark"
                            ? theme.palette.error.dark
                            : theme.palette.error.main,
                },
            });
        }
    };

    // Tek tek seçim toggle
    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Tümünü seç / temizle
    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(ekBelgeler.map((b) => b.id));
        }
    };

    const openDeleteConfirm = (ids: number[]) => {
        if (!ids || ids.length === 0) {
            enqueueSnackbar("Lütfen silmek için en az bir belge seçin.", {
                variant: "info",
                autoHideDuration: 4000,
            });
            return;
        }
        setSelectedIds(ids);
        setDeleteConfirmOpen(true);
    };

    // Silme butonuna basılınca
    const handleDeleteSelectedClick = () => {
        openDeleteConfirm(selectedIds);
    };


    const handleConfirmDeleteSelected = async () => {
        if (!user.token) return;
        if (selectedIds.length === 0) {
            setDeleteConfirmOpen(false);
            return;
        }

        try {
            setIsDeletingSelected(true);

            const result = await deleteEkBelgelerSecilenler(
                user.denetciId!,
                user.denetlenenId!,
                user.yil!,
                selectedIds
            );

            setEkBelgeler((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
            setSelectedIds([]);

            enqueueSnackbar(
                `${result.deleted} adet ek belge başarıyla silindi.`,
                { variant: "success" }
            );

            if (onUploaded) onUploaded();
        } catch (error) {
            // ...
        } finally {
            setIsDeletingSelected(false);
            setDeleteConfirmOpen(false);
        }
    };


    const handleClosePreview = () => {
        setPreviewOpen(false);
    };

    // Drag & drop eventleri
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        await handleFiles(files);
    };

    // Preview URL cleanup
    useEffect(() => {
        if (!previewOpen && previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [previewOpen, previewUrl]);

    const handleChangePage = (
        _event: unknown,
        newPage: number
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
            {/* Ana buton */}
            {!hideButton && (
                variant === 'menuitem' ? (
                    <MenuItem onClick={handleOpen}>
                        <Typography textAlign="center">{text}</Typography>
                    </MenuItem>
                ) : (
                    <Button
                        size="medium"
                        variant={buttonVariant}
                        color={color}
                        onClick={handleOpen}
                        sx={{
                            width: fullWidth ? "100%" : "auto",
                            textTransform: 'none',
                            whiteSpace: 'normal',
                            textAlign: 'center',
                            lineHeight: 1.2,
                            ...sx
                        }}
                    >
                        {text}
                    </Button>
                )
            )}
            {/* gizli input */}
            <input
                ref={inputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.xlsm,.png"
                onChange={handleFileChange}
            />
            {/* Ek belgeler popup */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle
                    sx={{
                        pb: 1,
                        px: 3,
                    }}
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography variant="h5">Belge Yükle</Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                Çalışma kağıdınızla ilişkili ek belgeleri buradan
                                yönetebilirsiniz.
                            </Typography>
                        </Box>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent
                    dividers
                    sx={{
                        px: 3,
                        py: 3,
                        bgcolor:
                            theme.palette.mode === "dark"
                                ? "background.default"
                                : "#F8FAFC",
                    }}
                >
                    <Grid container spacing={3}>
                        {/* Sol: yükleme alanı */}
                        <Grid
                            size={{
                                xs: 12,
                                md: 5
                            }}>
                            <Box
                                onClick={handleClickUploadButton}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                sx={{
                                    border: `2px dashed ${borderColor}`,
                                    borderRadius: 2,
                                    padding: "20px",
                                    marginTop: 1,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    height: "100%",
                                    minHeight: 285,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: isDragging
                                        ? theme.palette.mode === "dark"
                                            ? "rgba(96,165,250,0.1)"
                                            : "#E0F2FE"
                                        : theme.palette.mode === "dark"
                                            ? "rgba(255,255,255,0.02)"
                                            : "background.paper",
                                    "&:hover": {
                                        borderColor: theme.palette.primary.main,
                                        bgcolor:
                                            theme.palette.mode === "dark"
                                                ? "rgba(255,255,255,0.04)"
                                                : "#F1F5F9",
                                    },
                                    transition: "all 0.15s ease-in-out",
                                }}
                            >
                                {isUploading ? (
                                    <Typography variant="body2">
                                        Dosyalar yükleniyor...
                                    </Typography>
                                ) : (
                                    <Grid
                                        container
                                        style={{ height: "100%" }}
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Grid style={{ textAlign: "center" }} size={12}>
                                            <Stack spacing={1.5} alignItems="center">
                                                <CloudUploadIcon
                                                    fontSize="large"
                                                    color="primary"
                                                    sx={{ mb: 0.5 }}
                                                />
                                                <Typography variant="h6" mb={1}>
                                                    Dosyayı buraya sürükleyin veya tıklayıp seçin.
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Sadece PDF, Word, Excel ve PNG formatları
                                                    desteklenir.
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Tek seferde maksimum 200 adet dosya
                                                    yükleyebilirsiniz.
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                )}
                            </Box>
                        </Grid>

                        {/* Sağ: Yüklenmiş Dosya Bilgileri */}
                        <Grid
                            size={{
                                xs: 12,
                                md: 7
                            }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 2,
                                    border: `1px solid ${borderColor}`,
                                    bgcolor:
                                        theme.palette.mode === "dark"
                                            ? "background.default"
                                            : "background.paper",
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    minHeight: 285,
                                    maxHeight: 420,
                                }}
                            >
                                {/* Başlık + arama */}
                                <Box
                                    sx={{
                                        px: 2.5,
                                        py: 2,
                                        borderBottom: `1px solid ${borderColor}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography variant="h6">
                                        Yüklenmiş Dosya Bilgileri
                                    </Typography>
                                    <TextField
                                        size="small"
                                        placeholder="Arama"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        sx={{ width: 260 }}
                                    />
                                </Box>

                                {/* Tablo */}
                                <TableContainer
                                    sx={{
                                        flex: 1,
                                        overflowY: "auto",
                                        overflowX: "auto",
                                    }}
                                >
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        indeterminate={
                                                            selectedIds.length > 0 &&
                                                            selectedIds.length < filteredBelgeler.length
                                                        }
                                                        checked={
                                                            filteredBelgeler.length > 0 &&
                                                            selectedIds.length === filteredBelgeler.length
                                                        }
                                                        onChange={handleToggleSelectAll}
                                                    />
                                                </TableCell>
                                                <TableCell>Dosya Adı</TableCell>
                                                <TableCell width={100}>Tarih</TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {isLoadingList ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        <Typography variant="body2">
                                                            Yüklenmiş dosyalar yükleniyor...
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredBelgeler.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        <Typography variant="body2" color="text.secondary">
                                                            Henüz yüklenmiş dosya bulunmuyor.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredBelgeler.map((belge) => (
                                                    <TableRow key={belge.id} hover>
                                                        <TableCell padding="checkbox" >
                                                            <Checkbox
                                                                checked={selectedIds.includes(belge.id)}
                                                                onChange={() => toggleSelect(belge.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                                <InsertDriveFileIcon fontSize="small" />
                                                                <Typography
                                                                    variant="body2"
                                                                    title={belge.orijinalDosyaAdi}
                                                                    sx={{
                                                                        wordBreak: "break-word",
                                                                        whiteSpace: "normal",
                                                                    }}
                                                                >
                                                                    {belge.orijinalDosyaAdi}
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {belge.yuklemeTarihi
                                                                    ? new Date(belge.yuklemeTarihi).toLocaleString("tr-TR")
                                                                    : "-"}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                {/* Göster sadece PDF ise */}
                                                                {isPdfBelge(belge) && (
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleView(belge)}
                                                                    >
                                                                        <VisibilityIcon fontSize="small" />
                                                                    </IconButton>
                                                                )}

                                                                {/* İndir her zaman olsun */}
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDownload(belge)}
                                                                >
                                                                    <DownloadIcon fontSize="small" />
                                                                </IconButton>


                                                            </Stack>
                                                        </TableCell>

                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Alt bar: sadece seçilenleri sil butonu */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        px: 1.5,
                                        py: 0.75,
                                        borderTop: `1px solid ${borderColor}`,
                                    }}
                                >
                                    <Button
                                        size="small"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleDeleteSelectedClick}
                                        disabled={selectedIds.length === 0 || isDeletingSelected}
                                    >
                                        Seçilenleri Sil
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>

                    </Grid>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 1.5,
                        justifyContent: "flex-end",
                    }}
                >
                    <Button onClick={handleClose}>Kapat</Button>
                </DialogActions>
            </Dialog >
            {/* Seçilenleri silme onay popup'ı */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={
                    isDeletingSelected ? undefined : () => setDeleteConfirmOpen(false)
                }
            >
                <DialogTitle>Seçilen ek belgeleri sil</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2">
                        {selectedIds.length} adet ek belgeyi silmek istediğinize emin
                        misiniz? Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteConfirmOpen(false)}
                        disabled={isDeletingSelected}
                    >
                        Vazgeç
                    </Button>
                    <Button
                        onClick={handleConfirmDeleteSelected}
                        color="error"
                        variant="contained"
                        disabled={isDeletingSelected}
                    >
                        {isDeletingSelected ? "Siliniyor..." : "Sil"}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* PDF Önizleme popup */}
            <Dialog
                open={previewOpen}
                onClose={handleClosePreview}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle
                    sx={{
                        px: 3,
                        py: 1.5,
                    }}
                >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" noWrap>
                            PDF Önizleme
                            {previewFileName ? ` - ${previewFileName}` : ""}
                        </Typography>
                        <IconButton onClick={handleClosePreview} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent
                    dividers
                    sx={{
                        p: 2,
                        height: "80vh",
                        bgcolor:
                            theme.palette.mode === "dark" ? "#1E1E1E" : "#F9FAFB",
                    }}
                >
                    {previewUrl && (
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 2,
                                overflow: "hidden",
                                boxShadow: 1,
                            }}
                        >
                            <iframe
                                src={previewUrl}
                                title={previewFileName || "pdf-preview"}
                                style={{ width: "100%", height: "100%", border: "none" }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        px: 3,
                        py: 1.5,
                        justifyContent: "space-between",
                    }}
                >
                    <Button
                        onClick={() => {
                            if (previewUrl) {
                                window.open(previewUrl, "_blank");
                            }
                        }}
                    >
                        Yeni sekmede aç
                    </Button>
                    <Button onClick={handleClosePreview}>Kapat</Button>
                </DialogActions>
            </Dialog>
        </>
    );
});

MaddiDogrulamaEkBelgeYukleButton.displayName = "MaddiDogrulamaEkBelgeYukleButton";

export default MaddiDogrulamaEkBelgeYukleButton;


