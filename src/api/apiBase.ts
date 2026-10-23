const APP_IDENTITY_HEADER = "X-App-Identity";
const APP_IDENTITY_SECRET = "Fas-VG-Secure-9x2PZQ-7vR8-KmLn-41Nb-Ty6S-2026-N2Dev";

const LOCAL_API_URL = "http://localhost:5080/api";
const BETA_API_URL = "https://betaapi.fasmart.app/api";
const ENV_API_URL =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
    : undefined;

const normalizeApiBaseUrl = (baseUrl: string) =>
  (baseUrl || "").trim().replace(/\/+$/, "");

export const url = normalizeApiBaseUrl(
  ENV_API_URL ||
    (typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
      ? LOCAL_API_URL
      : BETA_API_URL)
);

// Otomatik fetch interceptor: X-App-Identity ve URL yonlendirmesi
if (typeof window !== "undefined" && !(window as any).__FAS_FETCH_PATCHED__) {
  (window as any).__FAS_FETCH_PATCHED__ = true;
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let requestUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

    // Eski sabit url varsa aktif dinamik api url ile degistir
    if (requestUrl.includes("2ninovasyon.online/api")) {
      requestUrl = requestUrl.replace(/https?:\/\/2ninovasyon\.online\/api/g, url);
    }

    const modifiedInit: RequestInit = { ...(init || {}) };
    const headers = new Headers(modifiedInit.headers || (input instanceof Request ? input.headers : {}));

    if (!headers.has(APP_IDENTITY_HEADER)) {
      headers.set(APP_IDENTITY_HEADER, APP_IDENTITY_SECRET);
    }

    modifiedInit.headers = headers;
    modifiedInit.credentials = modifiedInit.credentials || "include";

    return originalFetch(requestUrl, modifiedInit);
  };
}

export { APP_IDENTITY_HEADER, APP_IDENTITY_SECRET };
