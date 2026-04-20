import { apiFetch } from "../apiBase";
import type {
  FeedbackAdminFilter,
  FeedbackAdminSummary,
  FeedbackResponse,
  FeedbackStatus,
  PagedResult,
} from "./feedback.types";

const BASE = "/PageFeedback";

export const getAdminSummary = async (
  token: string
): Promise<FeedbackAdminSummary> => {
  const res = await apiFetch(`${BASE}/admin/summary`, { token });
  if (!res.ok) throw new Error("Özet alınamadı");
  return res.json();
};

export const getAdminList = async (
  token: string,
  filter: FeedbackAdminFilter
): Promise<PagedResult<FeedbackResponse>> => {
  const params = new URLSearchParams();
  if (filter.pageKey) params.set("pageKey", filter.pageKey);
  if (filter.route) params.set("route", filter.route);
  if (filter.moduleKey) params.set("moduleKey", filter.moduleKey);
  if (filter.feedbackType) params.set("feedbackType", filter.feedbackType);
  if (filter.sentiment) params.set("sentiment", String(filter.sentiment));
  if (filter.status) params.set("status", filter.status);
  if (filter.userId) params.set("userId", String(filter.userId));
  if (filter.dateFrom) params.set("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.set("dateTo", filter.dateTo);
  if (filter.wantsContact !== undefined)
    params.set("wantsContact", String(filter.wantsContact));
  params.set("page", String(filter.page ?? 1));
  params.set("pageSize", String(filter.pageSize ?? 50));

  const res = await apiFetch(`${BASE}/admin/list?${params.toString()}`, {
    token,
  });
  return res.json();
};

export const getAdminDetail = async (
  token: string,
  id: number
): Promise<FeedbackResponse | null> => {
  const res = await apiFetch(`${BASE}/admin/${id}`, { token });
  if (!res.ok) return null;
  return res.json();
};

export const updateFeedbackStatus = async (
  token: string,
  id: number,
  status: FeedbackStatus
): Promise<void> => {
  await apiFetch(`${BASE}/admin/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    token,
  });
};

export const updateFeedbackNote = async (
  token: string,
  id: number,
  adminNote: string | null
): Promise<void> => {
  await apiFetch(`${BASE}/admin/${id}/note`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminNote }),
    token,
  });
};

export const deleteFeedback = async (
  token: string,
  id: number
): Promise<void> => {
  await apiFetch(`${BASE}/admin/${id}`, { method: "DELETE", token });
};
