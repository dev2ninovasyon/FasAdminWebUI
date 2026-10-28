"use client";

import { apiFetch } from "@/api/apiBase";
import { getStoredAuthTokens, setStoredAuthTokens } from "@/utils/authStorage";

interface RefreshAuthSessionOptions {
  accessToken?: string;
  refreshToken?: string;
}

interface RefreshAuthSessionResult {
  token: string;
  refreshToken: string;
}

const normalizeAuthPayload = (
  payload: any,
  fallbackRefreshToken: string
): RefreshAuthSessionResult | null => {
  const token = payload?.token || payload?.Token || "";
  if (!token) {
    return null;
  }

  return {
    token,
    refreshToken:
      payload?.refreshToken || payload?.RefreshToken || fallbackRefreshToken,
  };
};

export const refreshAuthSession = async (
  options: RefreshAuthSessionOptions = {}
): Promise<RefreshAuthSessionResult> => {
  const storedTokens = getStoredAuthTokens();
  const accessToken = options.accessToken || storedTokens.token;
  const refreshToken = options.refreshToken || storedTokens.refreshToken;

  const refreshAttempts: Array<() => Promise<Response>> = [];

  if (refreshToken) {
    refreshAttempts.push(() =>
      apiFetch("/Auth/refresh", {
        method: "POST",
        body: JSON.stringify({ RefreshToken: refreshToken }),
        suppressErrorLog: true,
      })
    );
  }

  if (accessToken) {
    refreshAttempts.push(() =>
      apiFetch("/Auth/refresh", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ token: accessToken }),
        suppressErrorLog: true,
      })
    );
  }

  let lastError: unknown = null;

  for (const attempt of refreshAttempts) {
    try {
      const response = await attempt();
      if (!response.ok) {
        lastError = new Error(`Refresh basarisiz: ${response.status}`);
        continue;
      }

      const payload = await response.json();
      const normalizedPayload = normalizeAuthPayload(payload, refreshToken);

      if (!normalizedPayload) {
        lastError = new Error("Refresh yaniti gecersiz.");
        continue;
      }

      setStoredAuthTokens(
        normalizedPayload.token,
        normalizedPayload.refreshToken
      );

      return normalizedPayload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Token yenileme basarisiz.");
};
