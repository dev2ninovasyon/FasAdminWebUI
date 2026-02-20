import { apiFetch } from "@/api/apiBase";

const handleBackendCall = async (token: string, endpoint: string, body: any, fallbackText: string) => {
    try {
        const response = await apiFetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.text();
            if (response.status === 429 || errorData.includes("TooManyRequests") || errorData.includes("RESOURCE_EXHAUSTED")) {
                console.warn("Gemini API kotası doldu (429).");
                return fallbackText;
            }
            throw new Error(`API error: ${response.status} - ${errorData}`);
        }

        const result = await response.json();
        return result.data || result.Data || result.message || result.Message || fallbackText;
    } catch (error) {
        console.log(`Gemini API error (${endpoint}):`, error);
        return fallbackText;
    }
};

export const enhanceText = async (user: any, text: string, instruction: string) => {
    return handleBackendCall(
        user.token,
        "/Gemini/EnhanceText",
        { text, instruction },
        text || "Lütfen önce bir tespit metni girin."
    );
};

export const enhanceTextSettingWith = async (user: any, text: string, instruction: string) => {
    return handleBackendCall(user.token, "/Gemini/EnhanceText", { text, instruction }, text);
};

export const enhanceTextMsuteriEkle = async (user: any, text: string, instruction: string) => {
    return handleBackendCall(user.token, "/Gemini/EnhanceText", { text, instruction }, text);
};
