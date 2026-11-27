"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconDatabaseImport,
  IconPlayerPlay,
  IconRefresh,
  IconReportAnalytics,
  IconUserCheck,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import CustomFormLabel from "@/app/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/components/Forms/ThemeElements/CustomTextField";
import BlankCard from "@/app/components/Shared/BlankCard";
import { OldDenetciListItem } from "@/api/DenetciIslemleri/DenetciIslemleri";
import {
  AdminTargetDenetciDto,
  getImportFromOldTransferTablesForAdmin,
  getImportJobReconciliationForAdmin,
  getImportJobStatusForAdmin,
  getOldCompanyYearsForAdmin,
  getOldDenetcilerForAdmin,
  getOldDenetlenenByOldDenetciForAdmin,
  getTargetDenetcilerForAdmin,
  ImportJobStatusDto,
  ImportReconciliationDto,
  OldDenetlenenPreviewDto,
  resumeImportJobForAdmin,
  startAdminCustomerImportJob,
  TransferTableInfo,
} from "@/api/DataTransfer/AdminDataTransfer";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const TERMINAL_JOB_STATUSES = new Set(["Succeeded", "Failed", "Cancelled"]);

const getJobStatusLabel = (status: string) => {
  switch (status) {
    case "Queued":
      return "Kuyruğa Alındı";
    case "Running":
      return "Aktarım Sürüyor";
    case "Succeeded":
      return "Başarıyla Tamamlandı";
    case "Failed":
      return "Hata ile Sonlandı";
    case "Cancelled":
      return "İptal Edildi";
    case "Warning":
      return "Uyarılarla Tamamlandı";
    case "WaitingForUserInput":
      return "Kullanıcı Onayı Bekleniyor";
    default:
      return status || "Bilinmiyor";
  }
};

const getJobStatusColor = (
  status: string
): "default" | "info" | "success" | "error" | "warning" => {
  switch (status) {
    case "Succeeded":
      return "success";
    case "Failed":
    case "Cancelled":
      return "error";
    case "Warning":
    case "WaitingForUserInput":
      return "warning";
    case "Queued":
    case "Running":
      return "info";
    default:
      return "default";
  }
};

const getReconciliationBadge = (
  matchStatus: string
): { label: string; color: "success" | "info" | "error" | "warning" | "default" } => {
  switch (matchStatus) {
    case "Matched":
      return { label: "Eşleşti", color: "success" };
    case "ExpectedDiff":
      return { label: "Beklenen Fark", color: "info" };
    case "Mismatch":
      return { label: "Uyumsuz", color: "error" };
    case "Skipped":
      return { label: "Atlandı", color: "warning" };
    case "Empty":
      return { label: "Boş", color: "default" };
    default:
      return { label: matchStatus || "-", color: "default" };
  }
};

const AdminMusteriTasiFormu = () => {
  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);
  const token = user?.token || "";

  const [includeInactiveOldAuditors, setIncludeInactiveOldAuditors] = useState(false);
  const [oldAuditors, setOldAuditors] = useState<OldDenetciListItem[]>([]);
  const [loadingOldAuditors, setLoadingOldAuditors] = useState(false);
  const [selectedOldAuditor, setSelectedOldAuditor] = useState<OldDenetciListItem | null>(null);

  const [oldCompanies, setOldCompanies] = useState<OldDenetlenenPreviewDto[]>([]);
  const [loadingOldCompanies, setLoadingOldCompanies] = useState(false);
  const [onlyUnimportedCompanies, setOnlyUnimportedCompanies] = useState(false);
  const [selectedOldCompany, setSelectedOldCompany] = useState<OldDenetlenenPreviewDto | null>(null);

  const [targetAuditors, setTargetAuditors] = useState<AdminTargetDenetciDto[]>([]);
  const [loadingTargetAuditors, setLoadingTargetAuditors] = useState(false);
  const [targetInputText, setTargetInputText] = useState("");
  const [selectedTargetAuditor, setSelectedTargetAuditor] =
    useState<AdminTargetDenetciDto | null>(null);

  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [useAutoYears, setUseAutoYears] = useState(false);

  const [transferTables, setTransferTables] = useState<TransferTableInfo[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTableKeys, setSelectedTableKeys] = useState<string[]>([]);
  const [showTableSelector, setShowTableSelector] = useState(false);

  const [overrideFirmaAdi, setOverrideFirmaAdi] = useState("");
  const [overrideVergiNo, setOverrideVergiNo] = useState("");
  const [overrideVergiDairesi, setOverrideVergiDairesi] = useState("");
  const [overrideEmail, setOverrideEmail] = useState("");
  const [overrideYetkili, setOverrideYetkili] = useState("");
  const [overrideTel, setOverrideTel] = useState("");
  const [overrideAdres, setOverrideAdres] = useState("");
  const [overrideTicaretSicilNo, setOverrideTicaretSicilNo] = useState("");
  const [overrideWebAdresi, setOverrideWebAdresi] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<ImportJobStatusDto | null>(null);
  const [polling, setPolling] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [reconciliationLoading, setReconciliationLoading] = useState(false);
  const [reconciliation, setReconciliation] = useState<ImportReconciliationDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const terminalNotifiedRef = useRef<string | null>(null);

  const loadInitialLists = useCallback(async () => {
    setLoadError(null);
    setLoadingOldAuditors(true);
    setLoadingTargetAuditors(true);
    setLoadingTables(true);
    try {
      const [oldRes, targetRes, tablesRes] = await Promise.all([
        getOldDenetcilerForAdmin(token, includeInactiveOldAuditors),
        getTargetDenetcilerForAdmin(token),
        getImportFromOldTransferTablesForAdmin(token).catch(() => []),
      ]);
      setOldAuditors(oldRes);
      setTargetAuditors(targetRes);
      setTransferTables(tablesRes);
      setSelectedTableKeys(
        tablesRes.filter((t) => t.defaultSelected !== false).map((t) => t.key)
      );
    } catch (error: any) {
      const message = error?.message || "Veri taşıma listeleri yüklenemedi.";
      setLoadError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoadingOldAuditors(false);
      setLoadingTargetAuditors(false);
      setLoadingTables(false);
    }
  }, [token, includeInactiveOldAuditors]);

  useEffect(() => {
    void loadInitialLists();
  }, [loadInitialLists]);

  useEffect(() => {
    if (!selectedOldAuditor) {
      setOldCompanies([]);
      setSelectedOldCompany(null);
      return;
    }

    let cancelled = false;
    const loadCompanies = async () => {
      setLoadingOldCompanies(true);
      setSelectedOldCompany(null);
      try {
        const list = await getOldDenetlenenByOldDenetciForAdmin(selectedOldAuditor.id, token);
        if (!cancelled) {
          setOldCompanies(list);
        }
      } catch (error: any) {
        if (!cancelled) {
          setOldCompanies([]);
          enqueueSnackbar(error?.message || "Eski müşteri listesi alınamadı.", {
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoadingOldCompanies(false);
      }
    };

    void loadCompanies();
    return () => {
      cancelled = true;
    };
  }, [selectedOldAuditor, token]);

  useEffect(() => {
    if (!selectedOldCompany) {
      setAvailableYears([]);
      setSelectedYears([]);
      setOverrideFirmaAdi("");
      setOverrideVergiNo("");
      setOverrideVergiDairesi("");
      setOverrideEmail("");
      setOverrideYetkili("");
      setOverrideTel("");
      setOverrideAdres("");
      setOverrideTicaretSicilNo("");
      setOverrideWebAdresi("");
      return;
    }

    setOverrideFirmaAdi(selectedOldCompany.firmaAdi || "");
    setOverrideVergiNo(selectedOldCompany.vergiNo || "");
    setOverrideVergiDairesi(selectedOldCompany.vergiDairesi || "");
    setOverrideEmail(selectedOldCompany.email || "");
    setOverrideYetkili(selectedOldCompany.yetkili || "");
    setOverrideTel(selectedOldCompany.tel || "");
    setOverrideAdres(selectedOldCompany.adres || "");
    setOverrideTicaretSicilNo(selectedOldCompany.ticaretSicilNo || "");
    setOverrideWebAdresi(selectedOldCompany.webAdresi || "");

    setSelectedTableKeys((prev) => {
      const defaultKeys = transferTables
        .filter((t) => t.defaultSelected !== false)
        .map((t) => t.key);
      if (prev.length === 0) return defaultKeys;
      return prev;
    });

    let cancelled = false;
    const loadYears = async () => {
      setLoadingYears(true);
      try {
        const years = await getOldCompanyYearsForAdmin(selectedOldCompany.id, token);
        if (!cancelled) {
          setAvailableYears(years);
          setSelectedYears(years);
          setUseAutoYears(years.length === 0);
        }
      } catch {
        if (!cancelled) {
          setAvailableYears([]);
          setSelectedYears([]);
          setUseAutoYears(true);
        }
      } finally {
        if (!cancelled) setLoadingYears(false);
      }
    };

    void loadYears();
    return () => {
      cancelled = true;
    };
  }, [selectedOldCompany, token, transferTables]);

  useEffect(() => {
    if (!activeJobId || !polling) return;

    let active = true;
    const poll = async () => {
      try {
        const status = await getImportJobStatusForAdmin(activeJobId, token);
        if (!active) return;
        setJobStatus(status);

        if (TERMINAL_JOB_STATUSES.has(status.status)) {
          setPolling(false);
          const notifyKey = `${status.jobId}:${status.status}`;
          if (terminalNotifiedRef.current !== notifyKey) {
            terminalNotifiedRef.current = notifyKey;
            if (status.status === "Succeeded") {
              enqueueSnackbar("Müşteri taşıma işlemi tamamlandı!", { variant: "success" });
              if (selectedOldAuditor) {
                getOldDenetlenenByOldDenetciForAdmin(selectedOldAuditor.id, token)
                  .then((rows) => {
                    if (active) setOldCompanies(rows);
                  })
                  .catch(() => undefined);
              }
            } else if (status.status === "Failed") {
              enqueueSnackbar(status.errorMessage || "Müşteri taşıma işlemi başarısız oldu.", {
                variant: "error",
              });
            } else if (status.status === "Cancelled") {
              enqueueSnackbar("Müşteri taşıma işlemi iptal edildi.", { variant: "warning" });
            }
          }
        }
      } catch (error: any) {
        if (!active) return;
        console.error("Import job durum sorgulama hatası:", error);
      }
    };

    void poll();
    const timerId = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(timerId);
    };
  }, [activeJobId, polling, selectedOldAuditor, token]);

  const visibleOldCompanies = useMemo(() => {
    if (!onlyUnimportedCompanies) return oldCompanies;
    return oldCompanies.filter((c) => !c.alreadyImported);
  }, [oldCompanies, onlyUnimportedCompanies]);

  const visibleTransferTables = transferTables;

  const tableDisplayNameMap = useMemo(() => {
    const map = new Map<string, string>();
    transferTables.forEach((t) => map.set(t.key, t.name));
    return map;
  }, [transferTables]);

  const matchedUsersForQuery = useMemo(() => {
    if (!selectedTargetAuditor) return [];
    const q = targetInputText.trim().toLowerCase();
    if (!q) return selectedTargetAuditor.kullanicilar;
    const matches = selectedTargetAuditor.kullanicilar.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.personelAdi.toLowerCase().includes(q)
    );
    return matches.length > 0 ? matches : selectedTargetAuditor.kullanicilar;
  }, [selectedTargetAuditor, targetInputText]);

  const handleToggleYear = (year: number) => {
    setUseAutoYears(false);
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year].sort((a, b) => b - a)
    );
  };

  const handleToggleTable = (key: string) => {
    setSelectedTableKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const handleOpenConfirm = () => {
    if (!selectedOldAuditor) {
      enqueueSnackbar("Lütfen kaynak eski sistem denetçisini seçiniz.", { variant: "warning" });
      return;
    }
    if (!selectedOldCompany) {
      enqueueSnackbar("Lütfen taşınacak müşteriyi seçiniz.", { variant: "warning" });
      return;
    }
    if (!selectedTargetAuditor) {
      enqueueSnackbar("Lütfen hedef yeni sistem denetçisini seçiniz.", { variant: "warning" });
      return;
    }
    if (!overrideFirmaAdi.trim()) {
      enqueueSnackbar("Firma adı boş olamaz.", { variant: "warning" });
      return;
    }
    if (selectedTableKeys.length === 0) {
      enqueueSnackbar("En az bir aktarım aşaması seçmelisiniz.", { variant: "warning" });
      return;
    }
    setConfirmOpen(true);
  };

  const handleStartTransfer = async () => {
    if (!selectedOldCompany || !selectedTargetAuditor) return;
    setConfirmOpen(false);
    setSubmitting(true);
    setReconciliation(null);
    terminalNotifiedRef.current = null;

    try {
      const yearsPayload = useAutoYears ? [] : [...selectedYears].sort((a, b) => a - b);
      const response = await startAdminCustomerImportJob(
        {
          TasinanDenetlenenId: selectedOldCompany.id,
          Years: yearsPayload,
          TableKeys: selectedTableKeys,
          CompanyOverrides: {
            DenetciId: selectedTargetAuditor.id,
            FirmaAdi: overrideFirmaAdi.trim() || undefined,
            Yetkili: overrideYetkili.trim() || undefined,
            Tel: overrideTel.trim() || undefined,
            Fax: selectedOldCompany.fax || undefined,
            Adres: overrideAdres.trim() || undefined,
            Email: overrideEmail.trim() || undefined,
            WebAdresi: overrideWebAdresi.trim() || undefined,
            TicaretSicilNo: overrideTicaretSicilNo.trim() || undefined,
            VergiDairesi: overrideVergiDairesi.trim() || undefined,
            VergiNo: overrideVergiNo.trim() || undefined,
          },
        },
        token
      );

      setActiveJobId(response.jobId);
      setJobStatus({
        jobId: response.jobId,
        status: response.status || "Queued",
        effectiveYears: yearsPayload,
        isUserInteractionPending: false,
        skippedTables: [],
        retryCount: 0,
        notifications: [],
        stageResults: [],
      });
      setPolling(true);
      enqueueSnackbar(
        response.alreadyQueued
          ? "Bu aktarım işi zaten kuyrukta veya çalışıyor."
          : "Müşteri taşıma işi kuyruğa alındı.",
        { variant: "info" }
      );
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Müşteri taşıma işi başlatılamadı.", {
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResumeJob = async (action: "continue" | "skip" | "cancel") => {
    if (!activeJobId) return;
    setResumeBusy(true);
    try {
      await resumeImportJobForAdmin(activeJobId, action, token);
      setPolling(true);
      enqueueSnackbar("İşlem komutu gönderildi, devam ediliyor...", { variant: "info" });
    } catch (error: any) {
      enqueueSnackbar(error?.message || "İşlem devam ettirilemedi.", { variant: "error" });
    } finally {
      setResumeBusy(false);
    }
  };

  const handleLoadReconciliation = async () => {
    if (!activeJobId) return;
    setReconciliationLoading(true);
    try {
      const report = await getImportJobReconciliationForAdmin(activeJobId, token);
      setReconciliation(report);
    } catch (error: any) {
      enqueueSnackbar(error?.message || "Mutabakat raporu alınamadı.", { variant: "error" });
    } finally {
      setReconciliationLoading(false);
    }
  };

  const isTargetDifferentFromExisting =
    Boolean(selectedOldCompany?.existingTargetDenetciId) &&
    Boolean(selectedTargetAuditor?.id) &&
    selectedOldCompany?.existingTargetDenetciId !== selectedTargetAuditor?.id;

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Özel / Çapraz Denetçi Müşteri Taşıma:</strong> Eski veritabanındaki bir denetçiye ait
          tek bir müşteriyi (ör. <em>Senktron → Prima</em>), yeni sistemdeki mevcut herhangi bir denetçi
          firmasına (ör. <em>fasdestek@gmail.com</em> kullanıcısının firmasına) geçici veya kalıcı olarak
          aktarabilirsiniz. Hedef denetçi firmanın <strong>Eski Sistem (LegacyOldDbId)</strong> eşleşmesi
          değiştirilmez ve kaynak denetçinin diğer müşterileri taşınmaz.
        </Typography>
      </Alert>

      {loadError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void loadInitialLists()}>
              Tekrar Dene
            </Button>
          }
        >
          {loadError}
        </Alert>
      )}

      {/* BÖLÜM 1: KAYNAK ESKİ DENETÇİ & MÜŞTERİ */}
      <BlankCard>
        <Box p={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              1. Kaynak Eski Sistem Denetçisi ve Müşterisi
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={includeInactiveOldAuditors}
                  onChange={(_, checked) => {
                    setSelectedOldAuditor(null);
                    setSelectedOldCompany(null);
                    setIncludeInactiveOldAuditors(checked);
                  }}
                />
              }
              label="Pasif eski denetçileri de göster"
            />
          </Stack>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomFormLabel sx={{ mt: 0 }}>Kaynak Eski Denetçi</CustomFormLabel>
              <Autocomplete
                options={oldAuditors}
                loading={loadingOldAuditors}
                value={selectedOldAuditor}
                onChange={(_, value) => setSelectedOldAuditor(value)}
                getOptionLabel={(opt) =>
                  `${opt.firmaAdi}${opt.vergiNo ? ` (VKN: ${opt.vergiNo})` : ""} — ID: ${opt.id}`
                }
                filterOptions={(options, { inputValue }) => {
                  const q = inputValue.trim().toLowerCase();
                  if (!q) return options;
                  return options.filter(
                    (o) =>
                      (o.firmaAdi || "").toLowerCase().includes(q) ||
                      (o.firmaUnvani || "").toLowerCase().includes(q) ||
                      (o.vergiNo || "").toLowerCase().includes(q) ||
                      (o.email || "").toLowerCase().includes(q) ||
                      String(o.id) === q
                  );
                }}
                renderOption={(props, opt) => (
                  <li {...props} key={opt.id}>
                    <Stack direction="row" justifyContent="space-between" width="100%" spacing={1}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {opt.firmaAdi}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {opt.id}
                          {opt.vergiNo ? ` • VKN: ${opt.vergiNo}` : ""}
                          {opt.email ? ` • ${opt.email}` : ""}
                        </Typography>
                      </Box>
                      {opt.aktifmi === false && (
                        <Chip label="Pasif" size="small" color="default" variant="outlined" />
                      )}
                    </Stack>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Eski denetçi adı (ör. Senktron), VKN veya ID yazın..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingOldAuditors ? <CircularProgress size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText="Eski denetçi bulunamadı"
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <CustomFormLabel sx={{ mt: 0 }}>Taşınacak Eski Müşteri (Denetlenen)</CustomFormLabel>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={onlyUnimportedCompanies}
                      onChange={(_, checked) => setOnlyUnimportedCompanies(checked)}
                    />
                  }
                  label={<Typography variant="caption">Yalnız taşınmamışlar</Typography>}
                />
              </Stack>
              <Autocomplete
                options={visibleOldCompanies}
                loading={loadingOldCompanies}
                disabled={!selectedOldAuditor}
                value={selectedOldCompany}
                onChange={(_, value) => setSelectedOldCompany(value)}
                getOptionLabel={(opt) =>
                  `${opt.firmaAdi}${opt.vergiNo ? ` (VKN: ${opt.vergiNo})` : ""} — Eski ID: ${opt.id}`
                }
                filterOptions={(options, { inputValue }) => {
                  const q = inputValue.trim().toLowerCase();
                  if (!q) return options;
                  return options.filter(
                    (o) =>
                      (o.firmaAdi || "").toLowerCase().includes(q) ||
                      (o.vergiNo || "").toLowerCase().includes(q) ||
                      (o.email || "").toLowerCase().includes(q) ||
                      String(o.id) === q
                  );
                }}
                renderOption={(props, opt) => (
                  <li {...props} key={opt.id}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                      spacing={1}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {opt.firmaAdi}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Eski ID: {opt.id}
                          {opt.vergiNo ? ` • VKN: ${opt.vergiNo}` : ""}
                          {opt.denetimTuru ? ` • ${opt.denetimTuru}` : ""}
                        </Typography>
                      </Box>
                      {opt.alreadyImported ? (
                        <Chip
                          size="small"
                          color="info"
                          variant="outlined"
                          label={`Taşındı → ${opt.existingTargetDenetciFirmaAdi || `Denetçi #${opt.existingTargetDenetciId}`}`}
                        />
                      ) : (
                        <Chip size="small" color="success" variant="outlined" label="Yeni Taşıma" />
                      )}
                    </Stack>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={
                      selectedOldAuditor
                        ? "Müşteri adı (ör. Prima), VKN veya ID yazın..."
                        : "Önce kaynak eski denetçiyi seçin"
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingOldCompanies ? <CircularProgress size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                noOptionsText={
                  selectedOldAuditor
                    ? "Bu denetçiye ait müşteri bulunamadı"
                    : "Önce eski denetçiyi seçin"
                }
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
              />
            </Grid>
          </Grid>

          {selectedOldCompany && (
            <Box mt={2.5} p={2} borderRadius={1} bgcolor="action.hover">
              <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                <Chip size="small" label={`Eski ID: ${selectedOldCompany.id}`} />
                {selectedOldCompany.denetimTuru && (
                  <Chip size="small" color="primary" label={selectedOldCompany.denetimTuru} />
                )}
                {selectedOldCompany.enflasyonMu && (
                  <Chip size="small" color="secondary" label="Enflasyon Düzeltmeli" />
                )}
                {selectedOldCompany.konsolide && (
                  <Chip size="small" color="warning" label="Konsolide" />
                )}
                {selectedOldCompany.alreadyImported && (
                  <Chip
                    size="small"
                    color="info"
                    label={`Mevcut Hedef: ${selectedOldCompany.existingTargetDenetciFirmaAdi || `Denetçi #${selectedOldCompany.existingTargetDenetciId}`} (Yeni ID: ${selectedOldCompany.existingTargetDenetlenenId})`}
                  />
                )}
              </Stack>
            </Box>
          )}
        </Box>
      </BlankCard>

      {/* BÖLÜM 2: HEDEF YENİ DENETÇİ */}
      <BlankCard>
        <Box p={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              2. Hedef Yeni Sistem Denetçisi (Kullanıcı E-postası veya Firma ile Ara)
            </Typography>
            <Button
              size="small"
              startIcon={<IconRefresh size={16} />}
              onClick={() => void loadInitialLists()}
            >
              Listeyi Yenile
            </Button>
          </Stack>

          <Autocomplete
            options={targetAuditors}
            loading={loadingTargetAuditors}
            value={selectedTargetAuditor}
            inputValue={targetInputText}
            onInputChange={(_, value) => setTargetInputText(value)}
            onChange={(_, value) => setSelectedTargetAuditor(value)}
            getOptionLabel={(opt) =>
              `${opt.firmaAdi}${opt.vergiNo ? ` (VKN: ${opt.vergiNo})` : ""} — ID: ${opt.id}`
            }
            filterOptions={(options, { inputValue }) => {
              const q = inputValue.trim().toLowerCase();
              if (!q) return options;
              return options.filter(
                (o) =>
                  (o.firmaAdi || "").toLowerCase().includes(q) ||
                  (o.firmaUnvani || "").toLowerCase().includes(q) ||
                  (o.vergiNo || "").toLowerCase().includes(q) ||
                  (o.email || "").toLowerCase().includes(q) ||
                  String(o.id) === q ||
                  o.kullanicilar.some(
                    (u) =>
                      (u.email || "").toLowerCase().includes(q) ||
                      (u.personelAdi || "").toLowerCase().includes(q)
                  )
              );
            }}
            renderOption={(props, opt) => {
              const q = targetInputText.trim().toLowerCase();
              const matchingUsers = q
                ? opt.kullanicilar.filter(
                    (u) =>
                      u.email.toLowerCase().includes(q) ||
                      u.personelAdi.toLowerCase().includes(q)
                  )
                : opt.kullanicilar.slice(0, 3);

              return (
                <li {...props} key={opt.id}>
                  <Stack spacing={0.5} width="100%">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {opt.firmaAdi} (ID: {opt.id})
                      </Typography>
                      <Stack direction="row" spacing={0.5}>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Müşteri: ${opt.musteriSayisi}${opt.sirketKota ? ` / ${opt.sirketKota}` : ""}`}
                        />
                        {opt.legacyOldDbId ? (
                          <Chip
                            size="small"
                            color="info"
                            variant="outlined"
                            label={`Eski ID: ${opt.legacyOldDbId}`}
                          />
                        ) : null}
                      </Stack>
                    </Stack>
                    {matchingUsers.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Kullanıcılar:{" "}
                        {matchingUsers
                          .map(
                            (u) =>
                              `${u.email || u.personelAdi}${u.roller.length ? ` [${u.roller.join(", ")}]` : ""}`
                          )
                          .join(" • ")}
                      </Typography>
                    )}
                  </Stack>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Kullanıcı e-postası (ör. fasdestek@gmail.com), firma adı veya VKN yazın..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingTargetAuditors ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText="Eşleşen hedef denetçi veya kullanıcı bulunamadı"
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
          />

          {selectedTargetAuditor && (
            <Box mt={2.5} p={2} borderRadius={1} border="1px solid" borderColor="divider">
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={1}
                mb={1.5}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconBuilding size={20} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {selectedTargetAuditor.firmaAdi}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Denetçi ID: {selectedTargetAuditor.id}
                      {selectedTargetAuditor.vergiNo ? ` • VKN: ${selectedTargetAuditor.vergiNo}` : ""}
                      {selectedTargetAuditor.legacyOldDbId
                        ? ` • Kayıtlı Eski Sistem ID: ${selectedTargetAuditor.legacyOldDbId} (Değiştirilmeyecek)`
                        : " • Eski Sistem ID Bağlı Değil"}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<IconUserCheck size={16} />}
                  onClick={() => router.push(`/KullaniciIslemleri/${selectedTargetAuditor.id}`)}
                >
                  Bu Firmadaki Kullanıcıları Yönet
                </Button>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                Firmaya Kayıtlı Kullanıcılar ({selectedTargetAuditor.kullanicilar.length}):
              </Typography>
              {selectedTargetAuditor.kullanicilar.length === 0 ? (
                <Alert severity="warning">
                  Bu denetçi firmada henüz tanımlı kullanıcı yok.
                </Alert>
              ) : (
                <Stack spacing={1}>
                  {matchedUsersForQuery.map((u) => {
                    const isDenetciAdmin = u.roller.includes("DenetciAdmin") || u.roller.includes("FasAdmin");
                    return (
                      <Stack
                        key={u.id}
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                        p={1}
                        borderRadius={1}
                        bgcolor="action.hover"
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {u.personelAdi || "-"} ({u.email || "-"})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {u.unvani || "Ünvan belirtilmemiş"}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            color={u.aktifPasif ? "success" : "error"}
                            label={u.aktifPasif ? "Aktif" : "Pasif"}
                          />
                          {u.roller.length > 0 ? (
                            u.roller.map((role) => (
                              <Chip
                                key={role}
                                size="small"
                                color={isDenetciAdmin ? "primary" : "default"}
                                variant="outlined"
                                label={role}
                              />
                            ))
                          ) : (
                            <Chip size="small" variant="outlined" label="Rol yok" />
                          )}
                        </Stack>
                      </Stack>
                    );
                  })}
                  {matchedUsersForQuery.some(
                    (u) => !u.roller.includes("DenetciAdmin") && !u.roller.includes("FasAdmin")
                  ) && (
                    <Alert severity="info">
                      Not: Kullanıcıda <strong>DenetciAdmin</strong> rolü yoksa, taşıma sonrası ana
                      uygulamada müşteriyi görebilmesi için ilgili denetim yılına müşteri/görev
                      ataması yapılması gerekebilir.
                    </Alert>
                  )}
                </Stack>
              )}

              {isTargetDifferentFromExisting && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <strong>Dikkat — Başka Denetçiden Devir:</strong> Seçilen müşteri daha önce{" "}
                  <strong>
                    {selectedOldCompany?.existingTargetDenetciFirmaAdi ||
                      `Denetçi #${selectedOldCompany?.existingTargetDenetciId}`}
                  </strong>{" "}
                  altına aktarılmış. Onayladığınızda müşteri kaydı ve seçili aşama verileri{" "}
                  <strong>{selectedTargetAuditor.firmaAdi}</strong> üzerine taşınacaktır.
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </BlankCard>

      {/* BÖLÜM 3: YIL, FİRMA ÖNİZLEME VE AŞAMALAR */}
      {selectedOldCompany && (
        <BlankCard>
          <Box p={3}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              3. Yıllar, Firma Bilgisi Önizleme ve Aktarılacak Tablolar
            </Typography>

            <Box mb={3}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                mb={1}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Aktarılacak Denetim Yılları
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={useAutoYears}
                        onChange={(_, checked) => setUseAutoYears(checked)}
                      />
                    }
                    label="Otomatik (Eski sistemdeki son yıllar)"
                  />
                  {availableYears.length > 0 && (
                    <Button
                      size="small"
                      onClick={() => {
                        setUseAutoYears(false);
                        setSelectedYears(availableYears);
                      }}
                    >
                      Tümünü Seç ({availableYears.length})
                    </Button>
                  )}
                </Stack>
              </Stack>

              {loadingYears ? (
                <CircularProgress size={20} />
              ) : useAutoYears ? (
                <Alert severity="info">
                  Otomatik mod açık: Eski veritabanındaki en güncel yıllar sunucu tarafından otomatik seçilir.
                </Alert>
              ) : availableYears.length === 0 ? (
                <Alert severity="warning">
                  Eski veritabanında bu müşteri için yıl kaydı bulunamadı; sunucu otomatik çözümü kullanılacak.
                </Alert>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {availableYears.map((yr) => {
                    const checked = selectedYears.includes(yr);
                    return (
                      <Chip
                        key={yr}
                        label={yr}
                        color={checked ? "primary" : "default"}
                        variant={checked ? "filled" : "outlined"}
                        onClick={() => handleToggleYear(yr)}
                        icon={checked ? <IconCheck size={16} /> : undefined}
                      />
                    );
                  })}
                </Stack>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2} mb={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Firma Adı *</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  value={overrideFirmaAdi}
                  onChange={(e: any) => setOverrideFirmaAdi(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Vergi No</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  value={overrideVergiNo}
                  onChange={(e: any) => setOverrideVergiNo(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Vergi Dairesi</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  value={overrideVergiDairesi}
                  onChange={(e: any) => setOverrideVergiDairesi(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel sx={{ mt: 0 }}>E-posta</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  value={overrideEmail}
                  onChange={(e: any) => setOverrideEmail(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Yetkili</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  value={overrideYetkili}
                  onChange={(e: any) => setOverrideYetkili(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Telefon</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  value={overrideTel}
                  onChange={(e: any) => setOverrideTel(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Ticaret Sicil No</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  value={overrideTicaretSicilNo}
                  onChange={(e: any) => setOverrideTicaretSicilNo(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Web Adresi</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  value={overrideWebAdresi}
                  onChange={(e: any) => setOverrideWebAdresi(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel sx={{ mt: 0 }}>Adres</CustomFormLabel>
                <CustomTextField
                  fullWidth
                  size="small"
                  value={overrideAdres}
                  onChange={(e: any) => setOverrideAdres(e.target.value)}
                />
              </Grid>
            </Grid>

            <Box>
              <Button
                size="small"
                variant="text"
                endIcon={showTableSelector ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                onClick={() => setShowTableSelector((prev) => !prev)}
              >
                Aktarım Aşamaları ({selectedTableKeys.length} / {visibleTransferTables.length} seçili)
              </Button>
              <Collapse in={showTableSelector}>
                <Box mt={1} p={2} borderRadius={1} border="1px solid" borderColor="divider">
                  <Stack direction="row" spacing={1} mb={1.5}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        setSelectedTableKeys(
                          visibleTransferTables
                            .filter((t) => t.defaultSelected !== false)
                            .map((t) => t.key)
                        )
                      }
                    >
                      Varsayılanları Seç
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        setSelectedTableKeys(visibleTransferTables.map((t) => t.key))
                      }
                    >
                      Tümünü Seç
                    </Button>
                  </Stack>
                  {loadingTables ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Grid container spacing={0.5}>
                      {visibleTransferTables.map((t) => (
                        <Grid key={t.key} size={{ xs: 12, sm: 6, md: 4 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedTableKeys.includes(t.key)}
                                onChange={() => handleToggleTable(t.key)}
                              />
                            }
                            label={
                              <Typography variant="caption">
                                {t.name}
                                {t.isHeavy ? " (Büyük Veri)" : ""}
                              </Typography>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Collapse>
            </Box>

            <Stack direction="row" justifyContent="flex-end" mt={3}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={
                  submitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <IconDatabaseImport size={20} />
                  )
                }
                disabled={submitting || !selectedOldCompany || !selectedTargetAuditor}
                onClick={handleOpenConfirm}
              >
                Müşteriyi Hedef Denetçiye Taşı
              </Button>
            </Stack>
          </Box>
        </BlankCard>
      )}

      {/* BÖLÜM 4: CANLI İŞ DURUMU */}
      {jobStatus && (
        <BlankCard>
          <Box p={3}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
              mb={2}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                {polling && <CircularProgress size={20} />}
                <Typography variant="h6" fontWeight={600}>
                  Aktarım İlerlemesi
                </Typography>
                <Chip
                  size="small"
                  color={getJobStatusColor(jobStatus.status)}
                  label={getJobStatusLabel(jobStatus.status)}
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Job ID: {jobStatus.jobId}
                </Typography>
                {jobStatus.targetDenetlenenId && (
                  <Chip
                    size="small"
                    color="success"
                    variant="outlined"
                    label={`Hedef Müşteri ID: ${jobStatus.targetDenetlenenId}`}
                  />
                )}
              </Stack>
            </Stack>

            {jobStatus.errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {jobStatus.errorMessage}
              </Alert>
            )}

            {jobStatus.isUserInteractionPending && (
              <Alert
                severity="warning"
                icon={<IconAlertTriangle size={20} />}
                sx={{ mb: 2 }}
                action={
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      disabled={resumeBusy}
                      onClick={() => void handleResumeJob("continue")}
                    >
                      Yeniden Dene
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      disabled={resumeBusy}
                      onClick={() => void handleResumeJob("skip")}
                    >
                      Atla ve Devam Et
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      disabled={resumeBusy}
                      onClick={() => void handleResumeJob("cancel")}
                    >
                      İptal Et
                    </Button>
                  </Stack>
                }
              >
                <strong>{jobStatus.pendingTableKey || "Aşama"}</strong> adımında işlem kullanıcı
                kararı bekliyor.
              </Alert>
            )}

            {jobStatus.stageResults.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Aşama</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell align="right">İşlenen / Toplam</TableCell>
                      <TableCell>Yıl Özeti</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobStatus.stageResults.map((stage) => (
                      <TableRow key={stage.tableKey}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {tableDisplayNameMap.get(stage.tableKey) || stage.tableKey}
                          </Typography>
                          {stage.errorMessage && (
                            <Typography variant="caption" color="error.main">
                              {stage.errorMessage}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={stage.success ? "success" : "error"}
                            label={stage.success ? "Tamamlandı" : "Hata"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {stage.processedRecords} / {stage.totalRecords}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {(stage.yearSummaries || []).map((ys) => (
                              <Chip
                                key={ys.year}
                                size="small"
                                variant="outlined"
                                label={`${ys.year}: ${ys.addedRecords}/${ys.readRecords}`}
                              />
                            ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                Bildirim Günlüğü ({jobStatus.notifications.length})
              </Button>
              {TERMINAL_JOB_STATUSES.has(jobStatus.status) && (
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={
                    reconciliationLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <IconReportAnalytics size={16} />
                    )
                  }
                  disabled={reconciliationLoading}
                  onClick={() => void handleLoadReconciliation()}
                >
                  Mutabakat Raporunu Getir
                </Button>
              )}
            </Stack>

            <Collapse in={showNotifications}>
              <Paper
                variant="outlined"
                sx={{ mt: 1.5, p: 1.5, maxHeight: 260, overflowY: "auto" }}
              >
                <Stack spacing={0.5}>
                  {jobStatus.notifications.map((n, idx) => (
                    <Typography key={n.notificationId || idx} variant="caption">
                      [{n.tableKey || "Sistem"}] {n.message}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            </Collapse>

            {reconciliation && (
              <Box mt={2.5}>
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1.5}>
                  <Chip color="success" size="small" label={`Eşleşen: ${reconciliation.matchedTables}`} />
                  <Chip color="info" size="small" label={`Beklenen Fark: ${reconciliation.expectedDiffTables}`} />
                  <Chip color="error" size="small" label={`Uyumsuz: ${reconciliation.mismatchedTables}`} />
                  <Chip color="default" size="small" label={`Boş: ${reconciliation.emptyTables}`} />
                  <Chip
                    color="primary"
                    size="small"
                    label={`Uyum: %${Number(reconciliation.matchPercentage || 0).toFixed(1)}`}
                  />
                </Stack>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 360 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Aşama / Tablo</TableCell>
                        <TableCell>Yıl</TableCell>
                        <TableCell align="right">Eski Kayıt</TableCell>
                        <TableCell align="right">Yeni Kayıt</TableCell>
                        <TableCell>Durum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reconciliation.items.map((item, idx) => {
                        const badge = getReconciliationBadge(item.matchStatus);
                        return (
                          <TableRow key={`${item.stageKey}-${item.tableLabel}-${item.year}-${idx}`}>
                            <TableCell>
                              <Typography variant="caption" fontWeight={600}>
                                {item.stageName} — {item.tableLabel}
                              </Typography>
                              {item.note && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {item.note}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>{item.year}</TableCell>
                            <TableCell align="right">{item.sourceCount}</TableCell>
                            <TableCell align="right">{item.targetCount}</TableCell>
                            <TableCell>
                              <Chip size="small" color={badge.color} label={badge.label} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </BlankCard>
      )}

      {/* ONAY DİYALOGU */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Özel Müşteri Taşıma Onayı</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip
                color="secondary"
                label={`${selectedOldAuditor?.firmaAdi || ""} → ${overrideFirmaAdi || selectedOldCompany?.firmaAdi || ""}`}
              />
              <IconArrowRight size={18} />
              <Chip
                color="primary"
                label={selectedTargetAuditor?.firmaAdi || ""}
              />
            </Stack>
            <Typography variant="body2">
              <strong>{overrideFirmaAdi}</strong> (Eski ID: {selectedOldCompany?.id}) müşterisi ve seçili{" "}
              <strong>{selectedTableKeys.length}</strong> veri aşaması{" "}
              <strong>{selectedTargetAuditor?.firmaAdi}</strong> (Denetçi ID:{" "}
              {selectedTargetAuditor?.id}) altına aktarılacaktır.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aktarılacak yıllar:{" "}
              <strong>
                {useAutoYears
                  ? "Otomatik (Eski sistemdeki son yıllar)"
                  : selectedYears.length > 0
                  ? [...selectedYears].sort((a, b) => a - b).join(", ")
                  : "Otomatik"}
              </strong>
            </Typography>
            {selectedTargetAuditor && selectedTargetAuditor.kullanicilar.length > 0 && (
              <Alert severity="info">
                Hedef denetçideki kullanıcılar:{" "}
                {selectedTargetAuditor.kullanicilar.map((u) => u.email).filter(Boolean).join(", ")}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Vazgeç</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlayerPlay size={18} />}
            onClick={() => void handleStartTransfer()}
          >
            Onayla ve Başlat
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdminMusteriTasiFormu;
