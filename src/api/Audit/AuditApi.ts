import { apiFetch, url } from "@/api/apiBase";

export interface UserActionDto {
  id: number;
  userId: number;
  userName?: string;
  httpMethod?: string;
  path?: string;
  controllerName?: string;
  actionName?: string;
  statusCode: number;
  isError: boolean;
  errorMessage?: string;
  exceptionType?: string;
  queryString?: string;
  createdAt: string;
  clientUrl?: string;
  title?: string;
  subtitle?: string;
  friendlyTitle?: string;
  friendlyMessage?: string;
  denetlenenId?: number | null;
  denetlenenUnvani?: string | null;
  yil?: number | null;
}

export interface GetAdminRecentActionsParams {
  userId?: number;
  denetlenenId?: number;
  yil?: number;
  onlyErrors?: boolean;
  count?: number;
}

export async function getAdminRecentActions(
  params: GetAdminRecentActionsParams = {},
  token?: string
): Promise<UserActionDto[]> {
  const queryParams = new URLSearchParams();
  if (params.userId && params.userId > 0) queryParams.set("userId", params.userId.toString());
  if (params.denetlenenId && params.denetlenenId > 0) queryParams.set("denetlenenId", params.denetlenenId.toString());
  if (params.yil && params.yil > 0) queryParams.set("yil", params.yil.toString());
  if (params.onlyErrors !== undefined) queryParams.set("onlyErrors", params.onlyErrors.toString());
  queryParams.set("count", (params.count || 150).toString());

  const response = await apiFetch(`/Audit/AdminRecentActions?${queryParams.toString()}`, {
    method: "GET",
    token,
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Sistem işlem logları alınırken hata oluştu.");
  }

  return (await response.json()) as UserActionDto[];
}

export async function fetchServerLogText(token?: string): Promise<string> {
  const normalizedBase = url.replace(/\/+$/, "");
  const fullUrl = `${normalizedBase}/Audit/DownloadServerLog`;

  const response = await fetch(fullUrl, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      Accept: "text/plain",
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Sunucu logları alınamadı (HTTP ${response.status})`);
  }

  return await response.text();
}

