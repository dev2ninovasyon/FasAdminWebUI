//export const url = "https://betaapi.fasmart.app/api";
export const url = "https://localhost:5001/api";

export async function apiFetch(
    path: string,
    options: RequestInit & { timeout?: number; ignoreCustomHeaders?: boolean } = {}
) {
    const { headers, timeout = 30000, ignoreCustomHeaders = false, ...rest } = options;

    const clientUrl =
        typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "";

    const mergedHeaders: HeadersInit = {
        ...(headers || {}),
        "X-Client-Url": clientUrl,
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
            headers: mergedHeaders,
            body: rest.body
        });

        const response = await fetch(fullUrl, {
            ...rest,
            headers: mergedHeaders,
            signal: controller.signal,
        });

        const duration = Date.now() - requestStartTime;
        console.log(`✅ [%cAPI Yanıt %c] %c${fullUrl} %c(${duration}ms)`, 'color: #10b981; font-weight: bold;', 'color: inherit;', 'color: #3b82f6;', 'color: #6b7280;', {
            status: response.status,
            statusText: response.statusText
        });

        return response;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            const isTimeout = controller.signal.reason === "timeout";
            console.warn(`🛑 [%cAPI Hata   %c] ${path} -> ${isTimeout ? 'TIMED OUT' : 'CANCELLED'}.`, 'color: #ef4444; font-weight: bold;', 'color: inherit;');
        } else {
            console.error(`❌ [%cAPI Hata   %c] (${path}):`, 'color: #ef4444; font-weight: bold;', 'color: inherit;', error);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}