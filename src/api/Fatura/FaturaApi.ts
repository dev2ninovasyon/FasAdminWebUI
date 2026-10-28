import axios, { AxiosProgressEvent } from "axios";

import { apiFetch, url } from "@/api/apiBase";

export type Taraf = {
  id: string;
  ad?: string | null;
  vergiNo?: string | null;
  adres?: string | null;
  tip?: string | null;
};

export type Vergi = {
  id: string;
  vergiMatrahi: number;
  vergiTutari: number;
  oran: number;
  vergiTuru?: string | null;
  vergiKodu?: string | null;
  faturaId?: string | null;
};

export type FaturaDetay = {
  id: string;
  dosyaAdi?: string | null;
  durum?: string | null;
  durumMesaji?: string | null;
  embeddedMimeType?: string | null;
  embeddedDocumentFileName?: string | null;
  faturaId: string;
};

export type FaturaSatiri = {
  id: string;
  aciklama?: string | null;
  miktar: number;
  birimKodu?: string | null;
  birimFiyat: number;
  satirToplamTutar: number;
  faturaId: string;
  vergiId?: string | null;
  vergi?: Vergi | null;
};

export type Fatura = {
  id: string;
  faturaNumarasi?: string | null;
  faturaTarihi: string; // ISO
  paraBirimi?: string | null;
  odenecekTutar: number;

  tedarikciId?: string | null;
  tedarikci?: Taraf | null;

  aliciId?: string | null;
  alici?: Taraf | null;

  faturaDosyaId?: string | null;
  faturaDetay?: FaturaDetay | null;

  yuklemeIslemiId?: string | null;

  faturaSatirlari?: FaturaSatiri[];
  vergiler?: Vergi[];
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

// TAM grafik dönen endpoint
export async function fetchPagedFaturalarFull(
  denetciId: number,
  yil: number,
  denetlenenId: number,
  page: number,
  pageSize: number,
  tip: string, // "Alınan" | "Satis" vb.
  filters: Record<string, string[]> = {}
): Promise<PagedResult<Fatura>> {
  const apiurl =
    `/Invoices/FilteredPagedFull` +
    `?denetciId=${denetciId}&yil=${yil}` +
    `&denetlenenId=${denetlenenId}&page=${page}&pageSize=${pageSize}` +
    `&tip=${encodeURIComponent(tip)}`;

  const res = await apiFetch(apiurl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  return res.json();
}
export const uploadFaturaDosyalari = async (
  user: any,
  files: File[],
  tip: string,
  islemAdi: string,
  onUploadProgress?: (e: AxiosProgressEvent) => void
) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  const qs = `denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&tip=${encodeURIComponent(
    tip
  )}&islemAdi=${encodeURIComponent(islemAdi)}`;

  return axios.post(`${url}/Invoices/Upload?${qs}`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true, // ✅ HttpOnly cookies için gerekli
    onUploadProgress,
  });
};

export const getYuklemeIslemleri = async (user: any) => {
  const r = await apiFetch(
    `/Invoices/GetYuklemeIslemleri?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}`,
    { headers: { accept: "application/json" } }
  );
  if (!r.ok) throw new Error("Yükleme işlemleri alınamadı");
  return r.json();
};

export const getYuklemeDosyalari = async (user: any, yuklemeId: string) => {
  const r = await apiFetch(
    `/Invoices/GetYuklemeDosyalari?denetciId=${user.denetciId}&yil=${user.yil}&denetlenenId=${user.denetlenenId}&yuklemeId=${yuklemeId}`,
    { headers: { accept: "application/json" } }
  );
  if (!r.ok) throw new Error("Dosyalar alınamadı");
  return r.json();
};

export const previewFaturaHtmlNewTab = async (
  user: any,
  dosyaId: string
): Promise<Blob> => {
  const res = await apiFetch(`/Invoices/PreviewHtml/${dosyaId}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Sunucudan beklenen içerik tipi dönmedi");
  }

  return res.blob();
};


export const deleteYuklemeIslemleri = async (user: any, ids: string[]) => {
  const r = await apiFetch(`/Invoices/DeleteYuklemeIslemleri`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids)
  });
  if (!r.ok) throw new Error("Silinemedi");
  return true;
};

export type InvoiceYevmiyeRow = {
  invoiceId: string;
  invoiceDate?: string | null;
  invoiceNo?: string | null;
  amount: number;
  kdv: number;
  yevmiyeId?: string | null;
  yevmiyeDate?: string | null;
  yevmiyeNo?: number | null;
  matched: boolean;
  tip?: string;
};

export async function findInvoiceYevmiyeRowsByVkn(user: any, tip: string, vkn: string): Promise<InvoiceYevmiyeRow[]> {
  const qs = `denetciId=${user.denetciId}&denetlenenId=${user.denetlenenId}&yil=${user.yil}&tip=${encodeURIComponent(tip)}&vkn=${encodeURIComponent(vkn)}`;
  const r = await apiFetch(`/Invoices/FindInvoiceYevmiyeRowsByVkn?${qs}`, {
    headers: { accept: "application/json" }
  });
  if (!r.ok) throw new Error("Satırlar alınamadı");
  return r.json();
}

// opsiyonel: persist
export async function saveInvoiceYevmiyeMatches(user: any, rows: InvoiceYevmiyeRow[]) {
  const qs = `denetciId=${user.denetciId}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`;
  const r = await apiFetch(`/Invoices/SaveInvoiceYevmiyeMatches?${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rows)
  });
  if (!r.ok) throw new Error("Eşleştirmeler kaydedilemedi");
  return true;
}
export type SentInvoiceMatchRow = {
  matchId: string;
  invoiceId: string;
  invoiceNo?: string | null;
  invoiceDate?: string | null;
  amount: number;
  kdv: number;
  yevmiyeId?: string | null;
  yevmiyeNo?: number | null;
  yevmiyeDate?: string | null;
  counterpartyVkn?: string | null;
  counterpartyName?: string | null;
}

export async function getSentInvoiceMatches(user: any): Promise<SentInvoiceMatchRow[]> {
  const qs = `denetciId=${user.denetciId}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`;
  const r = await apiFetch(`/Invoices/GetSentInvoiceMatches?${qs}`, {
    headers: { accept: "application/json" }
  });
  if (!r.ok) throw new Error("Eşleşmeler alınamadı");
  return r.json();
}
export type ReceivedInvoiceMatchRow = {
  matchId: string;
  invoiceNo?: string | null;
  invoiceDate?: string | null;
  counterpartyName?: string | null; // Tedarikçi
  counterpartyVkn?: string | null;  // Tedarikçi VKN
  amount?: number | null;
  kdv?: number | null;
  yevmiyeNo?: number | string | null;
  yevmiyeDate?: string | null;
};

export async function getReceivedInvoiceMatches(user: any): Promise<ReceivedInvoiceMatchRow[]> {
  const qs = `denetciId=${user.denetciId}&denetlenenId=${user.denetlenenId}&yil=${user.yil}`;
  const r = await apiFetch(`/Invoices/GetReceivedInvoiceMatches?${qs}`, {
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Alınan eşleşmeleri alınamadı");
  return r.json();
}

