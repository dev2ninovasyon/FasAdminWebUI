"use client";

const ACCESS_TOKEN_KEY = "fas_token";
const REFRESH_TOKEN_KEY = "fas_refreshToken";
const PERSIST_ROOT_KEY = "persist:root";

const canUseBrowserStorage = () => typeof window !== "undefined";

export const getStoredAuthTokens = () => {
  if (!canUseBrowserStorage()) {
    return { token: "", refreshToken: "" };
  }

  return {
    token: sessionStorage.getItem(ACCESS_TOKEN_KEY) || "",
    refreshToken: sessionStorage.getItem(REFRESH_TOKEN_KEY) || "",
  };
};

export const setStoredAuthTokens = (token?: string, refreshToken?: string) => {
  if (!canUseBrowserStorage()) {
    return;
  }

  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const clearStoredAuthTokens = () => {
  if (!canUseBrowserStorage()) {
    return;
  }

  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const sanitizePersistedAuthState = () => {
  if (!canUseBrowserStorage()) {
    return;
  }

  const persistedRoot = localStorage.getItem(PERSIST_ROOT_KEY);
  if (!persistedRoot) {
    return;
  }

  try {
    const parsedRoot = JSON.parse(persistedRoot);
    if (!parsedRoot.userReducer) {
      return;
    }

    const parsedUserReducer = JSON.parse(parsedRoot.userReducer);
    delete parsedUserReducer.token;
    delete parsedUserReducer.refreshToken;
    parsedRoot.userReducer = JSON.stringify(parsedUserReducer);

    localStorage.setItem(PERSIST_ROOT_KEY, JSON.stringify(parsedRoot));
  } catch (error) {
    console.warn("Persisted auth state temizlenemedi:", error);
  }
};
