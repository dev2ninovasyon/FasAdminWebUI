import { apiFetch } from "@/api/apiBase";
import { getOldDbDenetciler, OldDenetciListItem } from "@/api/DenetciIslemleri/DenetciIslemleri";

export interface OldDenetlenenPreviewDto {
  id: number;
  denetciId?: number | null;
  firmaAdi: string;
  yetkili: string;
  tel: string;
  fax: string;
  adres: string;
  email: string;
  webAdresi: string;
  ticaretSicilNo: string;
  vergiDairesi: string;
  vergiNo: string;
  arsivId: string;
  aktifmi: boolean;
  firmaNo?: string | null;
  tfrs: boolean;
  bobi: boolean;
  bobiBuyuk: boolean;
  tfrsDonemsel: boolean;
  kumi: boolean;
  ozeldenetim: boolean;
  enflasyonMu: boolean;
  denetimTuru?: string | null;
  sektor1Id?: number | null;
  sektor2Id?: number | null;
  sektor3Id?: number | null;
  sektor1Adi: string;
  sektor2Adi: string;
  sektor3Adi: string;
  sektor1Kod: string;
  sektor2Kod: string;
  sektor3Kod: string;
  konsolide: boolean;
  konsolideAnaSirketmi: boolean;
  konsolideAltSirketmi: boolean;
  konsolideBagliSirketId?: number | null;
  alreadyImported: boolean;
  existingTargetDenetlenenId?: number | null;
  existingTargetDenetciId?: number | null;
  existingTargetDenetciFirmaAdi?: string | null;
}

export interface AdminTargetDenetciKullaniciDto {
  id: number;
  personelAdi: string;
  email: string;
  unvani: string;
  aktifPasif: boolean;
  roller: string[];
}

export interface AdminTargetDenetciDto {
  id: number;
  firmaAdi: string;
  firmaUnvani: string;
  vergiNo: string;
  email: string;
  legacyOldDbId?: number | null;
  aktifmi?: boolean | null;
  musteriSayisi: number;
  sirketKota?: number | null;
  kullanicilar: AdminTargetDenetciKullaniciDto[];
}

export interface TransferTableInfo {
  key: string;
  name: string;
  defaultSelected?: boolean;
  isHeavy?: boolean;
  group?: string;
}

export interface ImportStageYearSummaryDto {
  year: number;
  readRecords: number;
  addedRecords: number;
  emptyFormRecords?: number;
  duplicateFormRecords?: number;
  warningMessage?: string | null;
}

export interface ImportStageResultDto {
  tableKey: string;
  success: boolean;
  totalRecords: number;
  processedRecords: number;
  errorMessage?: string | null;
  durationSeconds?: number;
  yearSummaries?: ImportStageYearSummaryDto[];
}

export interface ImportJobNotificationDto {
  notificationId?: string;
  createdAt?: string;
  status?: string;
  severity?: number;
  tableKey?: string | null;
  recordCount?: number | null;
  message: string;
}

export interface ImportJobStatusDto {
  jobId: string;
  status: string;
  errorMessage?: string | null;
  tasinanDenetlenenId?: number;
  legacyOldDbDenetlenenId?: number | null;
  targetDenetlenenId?: number | null;
  newCompanyName?: string | null;
  effectiveYears: number[];
  isUserInteractionPending: boolean;
  pendingTableKey?: string | null;
  skippedTables: string[];
  retryCount: number;
  createdAt?: string;
  updatedAt?: string;
  notifications: ImportJobNotificationDto[];
  stageResults: ImportStageResultDto[];
}

export interface ReconciliationItemDto {
  stageKey: string;
  stageName: string;
  tableLabel: string;
  year: number;
  sourceCount: number;
  targetCount: number;
  sourceTotalDebit?: number | null;
  targetTotalDebit?: number | null;
  sourceTotalCredit?: number | null;
  targetTotalCredit?: number | null;
  matchStatus: string;
  note?: string | null;
}

export interface ImportReconciliationDto {
  jobId: string;
  status: string;
  sourceDenetlenenId: number;
  targetDenetlenenId: number;
  sourceCompanyName?: string | null;
  targetCompanyName?: string | null;
  effectiveYears: number[];
  totalTables: number;
  matchedTables: number;
  expectedDiffTables: number;
  mismatchedTables: number;
  skippedTables: number;
  emptyTables: number;
  matchPercentage: number;
  generatedAt: string;
  items: ReconciliationItemDto[];
}

const parseErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  const text = await response.text().catch(() => "");
  if (!text) return `${fallback} (HTTP ${response.status})`;
  try {
    const parsed = JSON.parse(text);
    return parsed?.message || parsed?.Message || parsed?.error || parsed?.title || fallback;
  } catch {
    return text;
  }
};

export const getOldDenetcilerForAdmin = async (
  token?: string,
  includeInactive = false
): Promise<OldDenetciListItem[]> => {
  if (!includeInactive) {
    return getOldDbDenetciler(token);
  }

  const response = await apiFetch(`/DataTransfer/Denetciler?includeInactive=true`, {
    method: "GET",
    token: token || undefined,
    includeCredentials: true,
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Eski denetçi listesi alınamadı."));
  }
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: any) => ({
    ...item,
    id: Number(item.id ?? item.Id ?? 0),
    firmaAdi: item.firmaAdi || item.FirmaAdi || "",
    firmaUnvani: item.firmaUnvani || item.FirmaUnvani || "",
    vergiNo: item.vergiNo || item.VergiNo || "",
    email: item.email || item.Email || "",
    aktifmi: item.aktifmi !== undefined ? item.aktifmi : item.Aktifmi,
    denetciAdminSayisi: Number(item.denetciAdminSayisi ?? item.DenetciAdminSayisi ?? 0),
    denetciAdminKullanicilar: item.denetciAdminKullanicilar || item.DenetciAdminKullanicilar || [],
  }));
};

export const getOldDenetlenenByOldDenetciForAdmin = async (
  oldDenetciId: number,
  token?: string
): Promise<OldDenetlenenPreviewDto[]> => {
  const response = await apiFetch(`/DataTransfer/Admin/OldDenetlenen/${oldDenetciId}`, {
    method: "GET",
    token: token || undefined,
    includeCredentials: true,
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Eski denetçiye ait müşteri listesi alınamadı."));
  }
  const raw = await response.json();
  if (!Array.isArray(raw)) return [];
  return raw.map((x: any) => ({
    id: Number(x.id ?? x.Id ?? 0),
    denetciId: x.denetciId ?? x.DenetciId ?? null,
    firmaAdi: x.firmaAdi ?? x.FirmaAdi ?? "",
    yetkili: x.yetkili ?? x.Yetkili ?? "",
    tel: x.tel ?? x.Tel ?? "",
    fax: x.fax ?? x.Fax ?? "",
    adres: x.adres ?? x.Adres ?? "",
    email: x.email ?? x.Email ?? "",
    webAdresi: x.webAdresi ?? x.WebAdresi ?? "",
    ticaretSicilNo: x.ticaretSicilNo ?? x.TicaretSicilNo ?? "",
    vergiDairesi: x.vergiDairesi ?? x.VergiDairesi ?? "",
    vergiNo: x.vergiNo ?? x.VergiNo ?? "",
    arsivId: x.arsivId ?? x.ArsivId ?? "",
    aktifmi: Boolean(x.aktifmi ?? x.Aktifmi ?? true),
    firmaNo: x.firmaNo ?? x.FirmaNo ?? null,
    tfrs: Boolean(x.tfrs ?? x.Tfrs),
    bobi: Boolean(x.bobi ?? x.Bobi),
    bobiBuyuk: Boolean(x.bobiBuyuk ?? x.BobiBuyuk),
    tfrsDonemsel: Boolean(x.tfrsDonemsel ?? x.TfrsDonemsel),
    kumi: Boolean(x.kumi ?? x.Kumi),
    ozeldenetim: Boolean(x.ozeldenetim ?? x.Ozeldenetim),
    enflasyonMu: Boolean(x.enflasyonMu ?? x.EnflasyonMu),
    denetimTuru: x.denetimTuru ?? x.DenetimTuru ?? null,
    sektor1Id: x.sektor1Id ?? x.Sektor1Id ?? null,
    sektor2Id: x.sektor2Id ?? x.Sektor2Id ?? null,
    sektor3Id: x.sektor3Id ?? x.Sektor3Id ?? null,
    sektor1Adi: x.sektor1Adi ?? x.Sektor1Adi ?? "",
    sektor2Adi: x.sektor2Adi ?? x.Sektor2Adi ?? "",
    sektor3Adi: x.sektor3Adi ?? x.Sektor3Adi ?? "",
    sektor1Kod: x.sektor1Kod ?? x.Sektor1Kod ?? "",
    sektor2Kod: x.sektor2Kod ?? x.Sektor2Kod ?? "",
    sektor3Kod: x.sektor3Kod ?? x.Sektor3Kod ?? "",
    konsolide: Boolean(x.konsolide ?? x.Konsolide),
    konsolideAnaSirketmi: Boolean(x.konsolideAnaSirketmi ?? x.KonsolideAnaSirketmi),
    konsolideAltSirketmi: Boolean(x.konsolideAltSirketmi ?? x.KonsolideAltSirketmi),
    konsolideBagliSirketId: x.konsolideBagliSirketId ?? x.KonsolideBagliSirketId ?? null,
    alreadyImported: Boolean(x.alreadyImported ?? x.AlreadyImported),
    existingTargetDenetlenenId: x.existingTargetDenetlenenId ?? x.ExistingTargetDenetlenenId ?? null,
    existingTargetDenetciId: x.existingTargetDenetciId ?? x.ExistingTargetDenetciId ?? null,
    existingTargetDenetciFirmaAdi: x.existingTargetDenetciFirmaAdi ?? x.ExistingTargetDenetciFirmaAdi ?? null,
  }));
};

export const getTargetDenetcilerForAdmin = async (
  token?: string,
  search?: string
): Promise<AdminTargetDenetciDto[]> => {
  const qs = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  const response = await apiFetch(`/DataTransfer/Admin/TargetDenetciler${qs}`, {
    method: "GET",
    token: token || undefined,
    includeCredentials: true,
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Hedef denetçi listesi alınamadı."));
  }
  const raw = await response.json();
  if (!Array.isArray(raw)) return [];
  return raw.map((d: any) => ({
    id: Number(d.id ?? d.Id ?? 0),
    firmaAdi: d.firmaAdi ?? d.FirmaAdi ?? "",
    firmaUnvani: d.firmaUnvani ?? d.FirmaUnvani ?? "",
    vergiNo: d.vergiNo ?? d.VergiNo ?? "",
    email: d.email ?? d.Email ?? "",
    legacyOldDbId: d.legacyOldDbId ?? d.LegacyOldDbId ?? null,
    aktifmi: d.aktifmi !== undefined ? d.aktifmi : d.Aktifmi,
    musteriSayisi: Number(d.musteriSayisi ?? d.MusteriSayisi ?? 0),
    sirketKota: d.sirketKota ?? d.SirketKota ?? null,
    kullanicilar: Array.isArray(d.kullanicilar ?? d.Kullanicilar)
      ? (d.kullanicilar ?? d.Kullanicilar).map((u: any) => ({
          id: Number(u.id ?? u.Id ?? 0),
          personelAdi: u.personelAdi ?? u.PersonelAdi ?? "",
          email: u.email ?? u.Email ?? "",
          unvani: u.unvani ?? u.Unvani ?? "",
          aktifPasif: Boolean(u.aktifPasif ?? u.AktifPasif ?? true),
          roller: Array.isArray(u.roller ?? u.Roller) ? (u.roller ?? u.Roller) : [],
        }))
      : [],
  }));
};

export const getOldCompanyYearsForAdmin = async (
  oldDenetlenenId: number,
  token?: string
): Promise<number[]> => {
  const response = await apiFetch(`/DataTransfer/old-company-years/${oldDenetlenenId}`, {
    method: "GET",
    token: token || undefined,
    includeCredentials: true,
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Eski müşteri yılları alınamadı."));
  }
  const raw = await response.json();
  if (!Array.isArray(raw)) return [];
  return raw.map((y: any) => Number(y)).filter((y) => Number.isFinite(y) && y > 0).sort((a, b) => b - a);
};

export const getImportFromOldTransferTablesForAdmin = async (
  token?: string
): Promise<TransferTableInfo[]> => {
  const response = await apiFetch(`/DataTransfer/ImportFromOldTransferTables`, {
    method: "GET",
    token: token || undefined,
    includeCredentials: true,
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Aktarım tablo listesi alınamadı."));
  }
  const raw = await response.json();
  if (!Array.isArray(raw)) return [];
  return raw.map((t: any) => ({
    key: String(t.key ?? t.Key ?? ""),
    name: String(t.name ?? t.Name ?? t.key ?? ""),
    defaultSelected: (t.defaultSelected ?? t.DefaultSelected ?? true) !== false,
    isHeavy: Boolean(t.isHeavy ?? t.IsHeavy),
    group: t.group ?? t.Group,
  }));
};

export const startAdminCustomerImportJob = async (
  payload: {
    TasinanDenetlenenId: number;
    Years: number[];
    TableKeys: string[];
    CompanyOverrides: {
      DenetciId: number;
      FirmaAdi?: string;
      Yetkili?: string;
      Tel?: string;
      Fax?: string;
      Adres?: string;
      Email?: string;
      WebAdresi?: string;
      TicaretSicilNo?: string;
      VergiDairesi?: string;
      VergiNo?: string;
    };
  },
  token?: string
): Promise<{ jobId: string; status?: string; alreadyQueued?: boolean; queued?: boolean }> => {
  const response = await apiFetch(`/DataTransfer/ImportFromOldJob`, {
    method: "POST",
    token: token || undefined,
    includeCredentials: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TableKey: "ImportFromOldPipeline",
      ...payload,
    }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Müşteri taşıma işi kuyruğa alınamadı."));
  }
  return response.json();
};

export const getImportJobStatusForAdmin = async (
  jobId: string,
  token?: string
): Promise<ImportJobStatusDto> => {
  const response = await apiFetch(`/DataTransfer/ImportJobStatus/${encodeURIComponent(jobId)}`, {
    method: "GET",
    token: token || undefined,
    includeCredentials: true,
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Aktarım işi durumu alınamadı."));
  }
  const raw = await response.json();
  return {
    jobId: raw?.jobId ?? raw?.JobId ?? jobId,
    status: raw?.status ?? raw?.Status ?? "",
    errorMessage: raw?.errorMessage ?? raw?.ErrorMessage ?? null,
    tasinanDenetlenenId: raw?.tasinanDenetlenenId ?? raw?.TasinanDenetlenenId,
    legacyOldDbDenetlenenId: raw?.legacyOldDbDenetlenenId ?? raw?.LegacyOldDbDenetlenenId ?? null,
    targetDenetlenenId: raw?.targetDenetlenenId ?? raw?.TargetDenetlenenId ?? null,
    newCompanyName: raw?.newCompanyName ?? raw?.NewCompanyName ?? null,
    effectiveYears: Array.isArray(raw?.effectiveYears ?? raw?.EffectiveYears)
      ? (raw?.effectiveYears ?? raw?.EffectiveYears).map((y: any) => Number(y)).filter((y: number) => y > 0)
      : [],
    isUserInteractionPending: Boolean(raw?.isUserInteractionPending ?? raw?.IsUserInteractionPending),
    pendingTableKey: raw?.pendingTableKey ?? raw?.PendingTableKey ?? null,
    skippedTables: raw?.skippedTables ?? raw?.SkippedTables ?? [],
    retryCount: Number(raw?.retryCount ?? raw?.RetryCount ?? 0),
    createdAt: raw?.createdAt ?? raw?.CreatedAt,
    updatedAt: raw?.updatedAt ?? raw?.UpdatedAt,
    notifications: Array.isArray(raw?.notifications ?? raw?.Notifications)
      ? (raw?.notifications ?? raw?.Notifications).map((n: any) => ({
          notificationId: n?.notificationId ?? n?.NotificationId,
          createdAt: n?.createdAt ?? n?.CreatedAt,
          status: n?.status ?? n?.Status,
          severity: n?.severity ?? n?.Severity,
          tableKey: n?.tableKey ?? n?.TableKey ?? null,
          recordCount: n?.recordCount ?? n?.RecordCount ?? null,
          message: String(n?.message ?? n?.Message ?? ""),
        }))
      : [],
    stageResults: Array.isArray(raw?.stageResults ?? raw?.StageResults)
      ? (raw?.stageResults ?? raw?.StageResults).map((s: any) => ({
          tableKey: String(s?.tableKey ?? s?.TableKey ?? ""),
          success: Boolean(s?.success ?? s?.Success),
          totalRecords: Number(s?.totalRecords ?? s?.TotalRecords ?? 0),
          processedRecords: Number(s?.processedRecords ?? s?.ProcessedRecords ?? 0),
          errorMessage: s?.errorMessage ?? s?.ErrorMessage ?? null,
          durationSeconds: s?.durationSeconds ?? s?.DurationSeconds,
          yearSummaries: Array.isArray(s?.yearSummaries ?? s?.YearSummaries)
            ? (s?.yearSummaries ?? s?.YearSummaries).map((y: any) => ({
                year: Number(y?.year ?? y?.Year ?? 0),
                readRecords: Number(y?.readRecords ?? y?.ReadRecords ?? 0),
                addedRecords: Number(y?.addedRecords ?? y?.AddedRecords ?? 0),
                emptyFormRecords: Number(y?.emptyFormRecords ?? y?.EmptyFormRecords ?? 0),
                duplicateFormRecords: Number(y?.duplicateFormRecords ?? y?.DuplicateFormRecords ?? 0),
                warningMessage: y?.warningMessage ?? y?.WarningMessage ?? null,
              }))
            : undefined,
        }))
      : [],
  };
};

export const resumeImportJobForAdmin = async (
  jobId: string,
  action: "continue" | "skip" | "cancel",
  token?: string
) => {
  const response = await apiFetch(`/DataTransfer/ImportJob/${encodeURIComponent(jobId)}/Resume`, {
    method: "POST",
    token: token || undefined,
    includeCredentials: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Aktarım işi komutu gönderilemedi."));
  }
  return response.json();
};

export const getImportJobReconciliationForAdmin = async (
  jobId: string,
  token?: string
): Promise<ImportReconciliationDto> => {
  const response = await apiFetch(
    `/DataTransfer/ImportJobs/${encodeURIComponent(jobId)}/Reconciliation`,
    {
      method: "GET",
      token: token || undefined,
      includeCredentials: true,
    }
  );
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Mutabakat raporu alınamadı."));
  }
  return response.json();
};
