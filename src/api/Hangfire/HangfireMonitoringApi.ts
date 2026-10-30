import { apiFetch } from "@/api/apiBase";

export interface ServerStatus {
  name: string;
  workersCount: number;
  queues: string[];
  lastHeartbeat: string;
  isHealthy: boolean;
  uptime: number;
  status: string;
}

export interface QueueStats {
  name: string;
  enqueued: number;
  processing: number;
  failed: number;
  succeeded: number;
  scheduled: number;
  total: number;
  priority: string;
}

export interface MonitoringSummary {
  status: string;
  timestamp: string;
  servers: {
    total: number;
    active: number;
    workers: number;
  };
  jobs: {
    enqueued: number;
    processing: number;
    succeeded: number;
    failed: number;
    scheduled: number;
    deleted: number;
  };
  queues?: {
    dataImport?: any;
    fileImport?: any;
    default_?: any;
  };
}

export interface RecentJob {
  id: string;
  jobName: string;
  queue: string;
  state: string;
  createdAt: string;
  duration?: string;
  arguments?: string;
}

export async function getMonitoringSummary(token?: string): Promise<MonitoringSummary> {
  const res = await apiFetch("/HangfireMonitoring/summary", {
    cache: "no-store",
    token,
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Özet verileri alınamadı");
  return (await res.json()) as MonitoringSummary;
}

export async function getMonitoringServers(token?: string): Promise<{ servers: ServerStatus[] }> {
  const res = await apiFetch("/HangfireMonitoring/servers", {
    cache: "no-store",
    token,
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Sunucu durumları alınamadı");
  return (await res.json()) as { servers: ServerStatus[] };
}

export async function getMonitoringQueues(token?: string): Promise<{ queues: QueueStats[] }> {
  const res = await apiFetch("/HangfireMonitoring/queues", {
    cache: "no-store",
    token,
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Kuyruk durumları alınamadı");
  return (await res.json()) as { queues: QueueStats[] };
}

export async function getMonitoringHealth(token?: string): Promise<any> {
  const res = await apiFetch("/HangfireMonitoring/health", {
    cache: "no-store",
    token,
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Sağlık verileri alınamadı");
  return await res.json();
}

export async function getMonitoringRecentJobs(limit = 15, token?: string): Promise<{ jobs: RecentJob[] }> {
  const res = await apiFetch(`/HangfireMonitoring/recent-jobs?limit=${limit}`, {
    cache: "no-store",
    token,
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error("Son işler alınamadı");
  return (await res.json()) as { jobs: RecentJob[] };
}

