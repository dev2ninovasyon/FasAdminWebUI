export type ClientLogLevel = "error" | "warn" | "info" | "debug";

export type ClientLogSource =
  | "ui"
  | "api"
  | "window"
  | "network"
  | "system";

export interface ClientLogEntry {
  id: string;
  timestamp: string;
  level: ClientLogLevel;
  source: ClientLogSource;
  message: string;
  route?: string;
  requestPath?: string;
  statusCode?: number;
  detail?: string;
}

const STORAGE_KEY = "fas_admin_client_logs_v1";
const MAX_LOG_COUNT = 1000;

let initialized = false;
let logs: ClientLogEntry[] = [];
const listeners = new Set<() => void>();

const safeStringify = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "bigint") return value.toString();

  if (value instanceof Error) {
    return JSON.stringify(
      {
        name: value.name,
        message: value.message,
        stack: value.stack,
      },
      null,
      2
    );
  }

  const seen = new WeakSet();
  const serialized = JSON.stringify(
    value,
    (_key, val) => {
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) return "[Circular]";
        seen.add(val);
      }
      return val;
    },
    2
  );
  return serialized;
};

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener error
    }
  });
};

const persistLogs = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // ignore quota error
  }
};

const initStore = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        logs = parsed.slice(0, MAX_LOG_COUNT);
      }
    }
  } catch {
    logs = [];
  }

  window.addEventListener("error", (event) => {
    addClientLog({
      level: "error",
      source: "window",
      message: event.message || "Bilinmeyen pencere hatası",
      detail: safeStringify({
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      }),
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    addClientLog({
      level: "error",
      source: "window",
      message: "İşlenmeyen Promise Hatası",
      detail: safeStringify(event.reason),
    });
  });
};

export const getClientLogs = (): ClientLogEntry[] => {
  initStore();
  return [...logs];
};

export const addClientLog = (
  entry: Omit<ClientLogEntry, "id" | "timestamp" | "route"> & {
    route?: string;
  }
) => {
  initStore();

  const currentRoute =
    entry.route ||
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : undefined);

  const fullEntry: ClientLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    route: currentRoute,
    ...entry,
  };

  logs.unshift(fullEntry);
  if (logs.length > MAX_LOG_COUNT) {
    logs = logs.slice(0, MAX_LOG_COUNT);
  }

  persistLogs();
  notifyListeners();
};

export const clearClientLogs = () => {
  logs = [];
  persistLogs();
  notifyListeners();
};

export const subscribeClientLogs = (listener: () => void): (() => void) => {
  initStore();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

