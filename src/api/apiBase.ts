import { decodeUTF8Deep } from "@/utils/utf8Support";

const normalizeApiUrl = (value: string) => value.replace(/\/+$/, "");

const sanitizeHeadersForLog = (headers: HeadersInit) => {
  const safeHeaders: Record<string, string> = {};

  Object.entries(headers as Record<string, string>).forEach(([key, value]) => {
    safeHeaders[key] =
      key.toLowerCase() === "authorization" ? "[REDACTED]" : value;
  });

  return safeHeaders;
};

const sanitizeBodyForLog = (body: RequestInit["body"]) => {
  if (!body || typeof body !== "string") {
    return body ? "[BODY_PRESENT]" : undefined;
  }

  try {
    const parsedBody = JSON.parse(body);
    if (!parsedBody || typeof parsedBody !== "object") {
      return "[BODY_PRESENT]";
    }

    const sensitiveKeys = [
      "password",
      "token",
      "refreshToken",
      "RefreshToken",
      "CaptchaToken",
    ];

    sensitiveKeys.forEach((key) => {
      if (key in parsedBody) {
        parsedBody[key] = "[REDACTED]";
      }
    });

    return parsedBody;
  } catch {
    return "[BODY_PRESENT]";
  }
};

const getDefaultApiUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000/api";
  }

  const { hostname } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  return isLocalhost
    ? "http://localhost:5000/api"
    : "https://betaapi.fasmart.app/api";
};

export const url = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl()
);

export async function apiFetch(
  path: string,
  options: RequestInit & {
    timeout?: number;
    ignoreCustomHeaders?: boolean;
    token?: string;
    includeCredentials?: boolean;
    suppressErrorLog?: boolean;
  } = {}
) {
  const {
    headers,
    timeout = 30000,
    ignoreCustomHeaders = false,
    token,
    includeCredentials = true,
    suppressErrorLog = false,
    ...rest
  } = options;

  const clientUrl =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : "";

  const baseHeaders: HeadersInit = {
    accept: "application/json; charset=utf-8",
    "Content-Type": "application/json; charset=utf-8",
    "Accept-Charset": "utf-8",
    "Accept-Language": "tr-TR,tr;q=0.9",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "X-Client-Url": clientUrl,
  };

  const mergedHeaders: HeadersInit = ignoreCustomHeaders
    ? { ...(headers || {}) }
    : { ...baseHeaders, ...(headers || {}) };

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${url}${normalizedPath}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    const timeoutMsg = `API Timeout: ${fullUrl} (${timeout}ms suresini asti)`;
    console.error(timeoutMsg);
    controller.abort("timeout");
  }, timeout);

  try {
    const requestStartTime = Date.now();
    console.log(`[API Istek] ${fullUrl}`, {
      method: rest.method || "GET",
      credentials: includeCredentials ? "include" : "omit",
      headers: sanitizeHeadersForLog(mergedHeaders),
      body: sanitizeBodyForLog(rest.body),
    });

    const response = await fetch(fullUrl, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
      credentials: includeCredentials ? "include" : "omit",
    });

    const originalJson = response.json.bind(response);
    (response as Response & { json: () => Promise<unknown> }).json = async () => {
      const data = await originalJson();
      return decodeUTF8Deep(data);
    };

    const duration = Date.now() - requestStartTime;
    console.log(`[API Yanit] ${fullUrl} (${duration}ms)`, {
      status: response.status,
      statusText: response.statusText,
    });

    return response;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      const isTimeout = controller.signal.reason === "timeout";
      if (!suppressErrorLog) {
        console.warn(
          `[API Hata] ${fullUrl} -> ${isTimeout ? "TIMED OUT" : "CANCELLED"}`
        );
      }
    } else if (!suppressErrorLog) {
      console.error(`[API Hata] (${fullUrl}):`, error);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
