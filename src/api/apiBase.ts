import { decodeUTF8Deep } from "@/utils/utf8Support";

export const url = "https://betaapi.fasmart.app/api";
//export const url = "https://localhost:5001/api";

export async function apiFetch(
    path: string,
    options: RequestInit & { timeout?: number; ignoreCustomHeaders?: boolean; token?: string; includeCredentials?: boolean; suppressErrorLog?: boolean } = {}
) {
    const { headers, timeout = 30000, ignoreCustomHeaders = false, token, includeCredentials = true, suppressErrorLog = false, ...rest } = options;

    const clientUrl =
        typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "";

    const mergedHeaders: HeadersInit = {
        "accept": "application/json; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8",
        "Accept-Charset": "utf-8",
        "Accept-Language": "tr-TR,tr;q=0.9",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        "X-Client-Url": clientUrl,
        ...(headers || {}),
    };

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const fullUrl = `${url.endsWith('/') ? url.slice(0, -1) : url}${normalizedPath}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        const timeoutMsg = `⚠️ API Timeout: ${fullUrl} (${timeout}ms süresini aştı)`;
        console.error(timeoutMsg);
        controller.abort("timeout");
    }, timeout);

    try {
        const requestStartTime = Date.now();
        console.log(`🌐 [%cAPI İstek %c] %c${fullUrl}`, 'color: #3b82f6; font-weight: bold;', 'color: inherit;', 'color: #10b981;', {
            method: rest.method || 'GET',
            credentials: includeCredentials ? 'include' : 'omit',
            headers: mergedHeaders,
            body: rest.body
        });

        const response = await fetch(fullUrl, {
            ...rest,
            headers: mergedHeaders,
            signal: controller.signal,
            credentials: includeCredentials ? 'include' : 'omit',
        });

        // Wrap response to add UTF-8 decoding to json() method
        const originalJson = response.json.bind(response);
        (response as any).json = async function () {
            const data = await originalJson();
            return decodeUTF8Deep(data);
        };

        const duration = Date.now() - requestStartTime;
        const logColor = response.ok ? '#10b981' : '#ef4444';
        const logIcon = response.ok ? '✅' : '⚠️';
        console.log(`${logIcon} [%cAPI Yanıt %c] %c${fullUrl} %c(${duration}ms)`, `color: ${logColor}; font-weight: bold;`, 'color: inherit;', 'color: #3b82f6;', 'color: #6b7280;', {
            status: response.status,
            statusText: response.statusText
        });

        return response;
    } catch (error: any) {
        if (error?.name === 'AbortError') {
            const isTimeout = controller.signal.reason === "timeout";
            if (!suppressErrorLog) {
                console.warn(
                    `🛑 [%cAPI Hata   %c] ${fullUrl} -> ${isTimeout ? "TIMED OUT" : "CANCELLED"}.`,
                    "color: #ef4444; font-weight: bold;",
                    "color: inherit;"
                );
            }
        } else {
            if (!suppressErrorLog) {
                console.error(
                    `❌ [%cAPI Hata   %c] (${fullUrl}):`,
                    "color: #ef4444; font-weight: bold;",
                    "color: inherit;",
                    error
                );
            }
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}
