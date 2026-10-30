import { apiFetch } from "@/api/apiBase";

export type HangfireStats = {
  enqueued: number;
  processing: number;
  failed: number;
  scheduled: number;
  succeeded: number;
  queues: { queue: string; enqueued: number; fetched: number }[];
  faturaStatuses?: { status: string; count: number }[];
  irsaliyeStatuses?: { status: string; count: number }[];
};

export type ClearResponse = {
  deleted: number;
  message: string;
};

export type ResetStuckResponse = {
  total: number;
  message: string;
};

export async function getHangfireStats(token?: string): Promise<HangfireStats> {
  const r = await apiFetch("/Hangfire/stats", {
    cache: "no-store",
    token,
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Hangfire istatistikleri alınamadı");
  return (await r.json()) as HangfireStats;
}

export async function clearQueues(token?: string): Promise<ClearResponse> {
  const r = await apiFetch("/Hangfire/kuyruk", {
    method: "DELETE",
    token,
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Kuyruk temizlenemedi");
  return (await r.json()) as ClearResponse;
}

export async function clearFailed(token?: string): Promise<ClearResponse> {
  const r = await apiFetch("/Hangfire/basarisizlar", {
    method: "DELETE",
    token,
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Başarısız işler silinemedi");
  return (await r.json()) as ClearResponse;
}

export async function resetStuckPackets(token?: string): Promise<ResetStuckResponse> {
  const r = await apiFetch("/Hangfire/takili-paketleri-sifirla", {
    method: "POST",
    token,
    headers: { accept: "application/json" },
  });
  if (!r.ok) throw new Error("Takılı paketler sıfırlanamadı");
  return (await r.json()) as ResetStuckResponse;
}

